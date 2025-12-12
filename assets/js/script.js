// ================================
// DIGITAL CLOCK - SCRIPT
// Region-grouped timezones + DST + Friendly Device Label + UTC Prefix
// ================================

//----------------------------------------------
// WAIT FOR DOM LOAD
//------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // ---------- VARIABLES & ELEMENTS ----------

  // State variables 
  let selectedTimeZone = "device";
  let is24Hour = true;
  // DOM elements 
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const yearEl = document.getElementById("year");
  const timeZoneSelect = document.getElementById("timezone-select");
  const formatSelect = document.getElementById("format-select");

  // Set current year in footer 
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- HELPER: GET DEVICE TIMEZONE INFO ---------- 

  // Get device timezone details: IANA name, UTC offset, friendly label 
  function getDeviceTimeZoneInfo() {
    const now = new Date();

    // IANA time zone name (e.g. "Africa/Lagos")
    let timeZone = "Local";
    try {
      const opts = Intl.DateTimeFormat().resolvedOptions();
      if (opts && opts.timeZone) {
        timeZone = opts.timeZone;
      }
    } catch (e) {
      console.warn("Could not get device time zone:", e);
    }

    // UTC offset in hours (e.g. +3, -5.5)
    const offsetMinutes = now.getTimezoneOffset(); 
    const offsetHours = -offsetMinutes / 60;

    // Formatted offset label (e.g. "+3", "-5.5")
    const sign = offsetHours >= 0 ? "+" : "";
    const offsetLabel =
      Number.isInteger(offsetHours)
        ? `${sign}${offsetHours}`
        : `${sign}${offsetHours.toFixed(1)}`;

    // Friendly location label for known time zones 
    let friendlyLabel = "";

    // Common time zones with city names
    switch (timeZone) {
      case "Africa/Lagos":
        friendlyLabel = "West Africa Time / Lagos, Nigeria";
        break;
      case "Europe/London":
        friendlyLabel = "Greenwich Mean Time / London, UK";
        break;
      case "Europe/Paris":
        friendlyLabel = "Central European Time / Paris, France";
        break;
      case "America/New_York":
        friendlyLabel = "Eastern Time / New York, USA";
        break;
      case "America/Los_Angeles":
        friendlyLabel = "Pacific Time / Los Angeles, USA";
        break;
      default:
        if (timeZone !== "Local") {

          // Generic friendly label from IANA name
          friendlyLabel = timeZone.replace(/\//g, " / ").replace(/_/g, " ");
        }
        break;
    }

    // Return all info as an object
    return {
      timeZone,
      offsetHours,
      offsetLabel,
      friendlyLabel,
    };
  }

  // ---------- HELPER: GET UTC LABEL FOR TIMEZONE ----------

  // Get "UTC+3", "UTC-5", etc. for a given IANA timezone
  function getUtcLabelForZone(tz) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Extract the timeZoneName part from formatted parts
      const parts = formatter.formatToParts(new Date());
      const tzNamePart = parts.find((p) => p.type === "timeZoneName");
      
      // Replace "GMT" with "UTC"
      if (tzNamePart && tzNamePart.value) {
        return tzNamePart.value.replace("GMT", "UTC");
      }
    } catch (e) {
      console.warn("Could not get UTC label for zone:", tz, e);
    }

    // Fallback
    return "UTC";
  }

  // ---------- POPULATE TIMEZONE DROPDOWN ----------

  // Populate the timezone dropdown with device option and grouped IANA zones
  function populateTimeZones() {
    if (!timeZoneSelect) return;

    // Check for Intl.supportedValuesOf support
    if (!Intl.supportedValuesOf) {
      console.warn("Intl.supportedValuesOf is not supported.");
      return;
    }

    // Get device timezone info
    const info = getDeviceTimeZoneInfo();
    const { timeZone: deviceTz, offsetLabel, friendlyLabel } = info;

    // Clear existing options
    timeZoneSelect.innerHTML = "";

    // Add device timezone option at the top
    let deviceText = `Device Time (UTC${offsetLabel}`;
    if (friendlyLabel) {
      deviceText += `, ${friendlyLabel}`;
    }
    deviceText += ")";

    // Create and append device option
    const deviceOption = document.createElement("option");
    deviceOption.value = "device";
    deviceOption.textContent = deviceText;
    timeZoneSelect.appendChild(deviceOption);

    // Get all supported IANA time zones
    let zones = [];
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch (e) {
      console.error("Error reading supported time zones:", e);
      return;
    }

    // Group zones by region
    const REGION_LABELS = {
      Africa: "Africa",
      Europe: "Europe",
      Asia: "Asia",
      America: "Americas",
      Pacific: "Australia & Oceania",
      Australia: "Australia & Oceania",
      Indian: "Indian Ocean",
      Atlantic: "Atlantic",
      Antarctica: "Other",
      Etc: "Other",
    };

    // Initialize region buckets
    const regionBuckets = {
      Africa: [],
      Europe: [],
      Asia: [],
      Americas: [],
      "Australia & Oceania": [],
      "Indian Ocean": [],
      Atlantic: [],
      Other: [],
    };

    // Distribute zones into region buckets
    zones.forEach((tz) => {
      const parts = tz.split("/");
      const prefix = parts[0];
      const regionLabel = REGION_LABELS[prefix] || "Other";
      if (!regionBuckets[regionLabel]) {
        regionBuckets[regionLabel] = [];
      }
      regionBuckets[regionLabel].push(tz);
    });

    // Sort each region's time zones alphabetically by city name
    Object.keys(regionBuckets).forEach((region) => {
      regionBuckets[region].sort((a, b) => {
        const labelA = a.split("/").slice(1).join(" / ").replace(/_/g, " ");
        const labelB = b.split("/").slice(1).join(" / ").replace(/_/g, " ");
        return labelA.localeCompare(labelB);
      });
    });

    // Define the order of regions to display
    const REGION_ORDER = [
      "Africa",
      "Europe",
      "Asia",
      "Americas",
      "Australia & Oceania",
      "Indian Ocean",
      "Atlantic",
      "Other",
    ];

    // Create optgroups and options for each region
    REGION_ORDER.forEach((regionName) => {
      const tzList = regionBuckets[regionName];
      if (!tzList || tzList.length === 0) return;
      
      const groupEl = document.createElement("optgroup");
      groupEl.label = regionName;

      tzList.forEach((tz) => {
        const option = document.createElement("option");
        option.value = tz;

        // Create city label from IANA name
        const cityLabel = tz
          .split("/")
          .map((p) => p.replace(/_/g, " "))
          .join(" / ");

        // Get UTC offset label for this timezone 
        const utcLabel = getUtcLabelForZone(tz);

        // Combine UTC and city labels 
        let finalLabel = `${utcLabel} — ${cityLabel}`;

        // Mark if this is the device's current timezone 
        if (tz === deviceTz) {
          finalLabel += " (current)";
        }

        option.textContent = finalLabel;
        groupEl.appendChild(option);
      });

      timeZoneSelect.appendChild(groupEl);
    });
  }

  // ---------- GET CURRENT TIME FOR SELECTED TIMEZONE ----------

  // Get current Date object adjusted for selected timezone
  function getNowForTimeZone() {
    const now = new Date();

    // Device timezone mode 
    if (selectedTimeZone === "device") {
      return now;
    }

    // Specific IANA timezone mode 
    try {
      const localeString = now.toLocaleString("en-US", {
        timeZone: selectedTimeZone,
      });
      return new Date(localeString);
    } catch (e) {
      console.error("Invalid timezone:", selectedTimeZone, e);
      return now;
    }
  }

  // ---------- UPDATE CLOCK & DATE DISPLAY ----------

  // Update the clock and date elements based on selected timezone and format
  function updateClockAndDate() {
    const now = getNowForTimeZone();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const pad = (n) => (n < 10 ? "0" + n : n);

    let timeString = "";

    // Format time string based on 12-hour or 24-hour preference
    if (is24Hour) {
      timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      const period = hours >= 12 ? " PM" : " AM";
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      timeString = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}${period}`;
    }
  
    // Format date string
    const dateString = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (clockEl) clockEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
  }

  // ---------- LOAD & SAVE PREFERENCES ----------

  // Load saved preferences from localStorage
  function loadPreferences() {
    try {
      const savedTz = localStorage.getItem("digitalClockTimeZone");
      const savedFormat = localStorage.getItem("digitalClockFormat");
      
      // Validate and apply saved timezone
      if (savedTz) {
        selectedTimeZone = savedTz;
      }

      // Validate and apply saved format
      if (savedFormat === "12" || savedFormat === "24") {
        is24Hour = savedFormat === "24";
        if (formatSelect) {
          formatSelect.value = savedFormat;
        }
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  // Save current preferences to localStorage
  function savePreferences() {
    try {
      localStorage.setItem("digitalClockTimeZone", selectedTimeZone);
      localStorage.setItem("digitalClockFormat", is24Hour ? "24" : "12");
    } catch (e) {
      // ignore storage errors
    }
  }

  // ---------- EVENT LISTENERS ----------

  // Timezone selection change
  if (timeZoneSelect) {
    timeZoneSelect.addEventListener("change", (e) => {
      selectedTimeZone = e.target.value;
      savePreferences();
      updateClockAndDate();
    });
  }

  // Time format selection change
  if (formatSelect) {
    formatSelect.addEventListener("change", (e) => {
      is24Hour = e.target.value === "24";
      savePreferences();
      updateClockAndDate();
    });
  }

  // ---------- INITIALIZATION ----------

  // Populate timezone dropdown and load preferences
  populateTimeZones();
  loadPreferences();

  // Validate selected timezone against dropdown options
  if (timeZoneSelect) {
    const optionsArray = Array.from(timeZoneSelect.options);
    const hasMatch = optionsArray.some(
      (opt) => opt.value === selectedTimeZone
    );
    if (hasMatch) {
      timeZoneSelect.value = selectedTimeZone;
    } else {
      selectedTimeZone = "device";
      timeZoneSelect.value = "device";
    }
  }

  // Initial clock and date update, then every second
  updateClockAndDate();
  setInterval(updateClockAndDate, 1000);
});
