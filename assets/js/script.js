// ================================
// DIGITAL CLOCK - SCRIPT
// ================================

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  let selectedTimeZone = "local";
  let is24Hour = true;

  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const yearEl = document.getElementById("year");
  const timeZoneSelect = document.getElementById("timezone-select");
  const formatSelect = document.getElementById("format-select");

  // Set current year in footer
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Populate timezone dropdown
  function populateTimeZones() {
    if (!timeZoneSelect) return;

    if (!Intl.supportedValuesOf) return;

    let zones = Intl.supportedValuesOf("timeZone");
    zones = zones.slice().sort();

    zones.forEach((tz) => {
      const option = document.createElement("option");
      option.value = tz;
      option.textContent = tz.replace(/\//g, " / ").replace(/_/g, " ");
      timeZoneSelect.appendChild(option);
    });
  }

  // Get current time in selected timezone
  function getNowForTimeZone() {
    if (selectedTimeZone === "local") {
      return new Date();
    }
    try {
      const localeString = new Date().toLocaleString("en-US", {
        timeZone: selectedTimeZone,
      });
      return new Date(localeString);
    } catch (e) {
      return new Date();
    }
  }

  // Update clock and date display
  function updateClockAndDate() {
    const now = getNowForTimeZone();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const pad = (n) => (n < 10 ? "0" + n : n);

    let timeString = "";

    // 24-hour or 12-hour format
    if (is24Hour) {
      timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      const period = hours >= 12 ? " PM" : " AM";
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      timeString = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}${period}`;
    }

    // Date string
    const dateString = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    clockEl.textContent = timeString;
    dateEl.textContent = dateString;
  }

  // Timezone change listener
  timeZoneSelect.addEventListener("change", (e) => {
    selectedTimeZone = e.target.value;
    updateClockAndDate();
  });

  // Format change listener
  formatSelect.addEventListener("change", (e) => {
    is24Hour = e.target.value === "24";
    updateClockAndDate();
  });

  // Initial population and update
  populateTimeZones();
  updateClockAndDate();
  setInterval(updateClockAndDate, 1000);
});
