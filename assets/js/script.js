// ================================
// DIGITAL CLOCK - SCRIPT
// ================================

// Function to format and update the time & date
function updateClockAndDate() {
  const now = new Date();

  // --- Time ---
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Add leading zero if less than 10
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds}`;

  // --- Date (full written format) ---
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = now.toLocaleDateString(undefined, dateOptions);
  // Example: "Thursday, 11 December 2025"

  // Update the DOM
  document.getElementById("clock").textContent = timeString;
  document.getElementById("date").textContent = dateString;
}

// Run once immediately
updateClockAndDate();

// Update every second
setInterval(updateClockAndDate, 1000);
