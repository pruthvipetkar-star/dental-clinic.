const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");

const dateInput = document.getElementById("date");

if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  statusEl.textContent = "Appointment submitted successfully!";
  statusEl.className = "form-status success";

  form.reset();
});

 // =========================
// THEME TOGGLE
// =========================

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {

  themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {

      // Dark theme = lamp OFF
      themeToggle.textContent = "🔅";

    } else {

      // Bright theme = lamp ON
      themeToggle.textContent = "💡";

    }

  });

}