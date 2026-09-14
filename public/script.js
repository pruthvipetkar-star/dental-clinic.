const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");

// Prevent picking a past date in the date picker
const dateInput = document.getElementById("date");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const payload = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    service: form.service.value,
    date: form.date.value,
    notes: form.notes.value,
  };

  const submitBtn = form.querySelector(".form-submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.errors ? data.errors.join(" ") : "Something went wrong. Please try again.";
      statusEl.classList.add("error");
    } else {
      statusEl.textContent = "Request sent — we'll confirm by email within one business day.";
      statusEl.classList.add("success");
      form.reset();
    }
  } catch (err) {
    statusEl.textContent = "Couldn't reach the server. Please try again in a moment.";
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Request appointment";
  }
});
