
document.addEventListener("DOMContentLoaded", () => {
  // Dark / light theme button
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-theme");

      themeToggle.textContent = isDark ? "☀️" : "💡";
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    });
  }

  // Prevent selecting a past appointment date
  const dateInput = document.getElementById("date");

  if (dateInput) {
    const today = new Date();
    const localDate =
      today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");

    dateInput.min = localDate;
  }

  // Demo booking form
  const bookingForm = document.getElementById("booking-form");
  const formStatus = document.getElementById("form-status");

  if (bookingForm && formStatus) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      formStatus.textContent =
        "Demo only: your appointment details have not been sent.";
    });
  }
});
