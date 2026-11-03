
const form = document.getElementById("booking-form");
const statusEl = document.getElementById("form-status");
const dateInput = document.getElementById("date");

// Set today's date as the earliest selectable appointment date.
function setMinimumDate() {
  if (dateInput) {
    dateInput.min = new Date().toLocaleDateString("en-CA");
  }
}

setMinimumDate();

// ==========================================
// APPOINTMENT BOOKING — CONNECTED TO BACKEND
// ==========================================

if (form && statusEl) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    const originalButtonText = submitButton
      ? submitButton.textContent
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    statusEl.textContent = "Submitting your appointment...";
    statusEl.className = "form-status";

    const formData = new FormData(form);

    const appointment = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      date: String(formData.get("date") || ""),
      notes: String(formData.get("notes") || "").trim()
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointment)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          Array.isArray(result.errors)
            ? result.errors.join(" ")
            : "Unable to submit your appointment. Please try again."
        );
      }

      statusEl.textContent =
        "Appointment submitted successfully! Your request is awaiting confirmation.";
      statusEl.className = "form-status success";

      form.reset();
      setMinimumDate();

    } catch (error) {
      console.error("[booking] Submission failed:", error);

      statusEl.textContent =
        error.message ||
        "Unable to submit your appointment. Please try again.";

      statusEl.className = "form-status error";

    } finally {
      if (submitButton) {
        submitButton.disabled = false;

        if (submitButton.tagName === "INPUT") {
          submitButton.value = originalButtonText;
        } else {
          submitButton.textContent =
            originalButtonText || "Request appointment";
        }
      }
    }
  });
}

// ==========================================
// THEME TOGGLE
// ==========================================

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
      themeToggle.textContent = "🔅";
    } else {
      themeToggle.textContent = "💡";
    }
  });
}

// ==========================================
// RESPONSIVE MOBILE NAVIGATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("mobile-menu-toggle");
  const navigation = document.getElementById("main-navigation");

  if (!menuButton || !navigation) return;

  const menuIcon = menuButton.querySelector(".menu-icon");
  const mobileQuery = window.matchMedia("(max-width: 860px)");

  function setMenuOpen(open) {
    navigation.classList.toggle("is-open", open);

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );

    if (menuIcon) {
      menuIcon.textContent = open ? "✕" : "☰";
    }
  }

  menuButton.addEventListener("click", () => {
    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    setMenuOpen(!isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    ) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  function handleViewportChange(event) {
    if (!event.matches) {
      setMenuOpen(false);
    }
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  setMenuOpen(false);
});
