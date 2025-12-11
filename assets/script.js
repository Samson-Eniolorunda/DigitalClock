function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Add leading zero if less than 10 (e.g. 07, 09)
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds}`;

  document.getElementById("clock").textContent = timeString;
}

// Run once immediately so it doesn’t wait 1s to show
updateClock();

// Update every second
setInterval(updateClock, 1000);
