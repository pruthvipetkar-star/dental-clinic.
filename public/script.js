
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
// Apply clinic configuration

if (typeof CLINIC_CONFIG !== "undefined") {
  // Clinic name
  const clinicNameElement = document.getElementById("clinic-name");
  const footerClinicName = document.getElementById("footer-clinic-name");

  if (clinicNameElement) {
    clinicNameElement.textContent = CLINIC_CONFIG.clinicName;
  }

  if (footerClinicName) {
    footerClinicName.textContent = CLINIC_CONFIG.clinicName;
  }

  // Doctor information
  const doctorNameElement = document.getElementById("doctor-name");
  const doctorQualificationElement = document.getElementById("doctor-qualification");

  if (doctorNameElement) {
    doctorNameElement.textContent = CLINIC_CONFIG.doctorName;
  }

  if (doctorQualificationElement) {
    doctorQualificationElement.textContent = CLINIC_CONFIG.doctorQualification;
  }

  // Clinic contact information
  const locationHeadingElement = document.getElementById("clinic-location-heading");

if (locationHeadingElement) {
  locationHeadingElement.textContent = CLINIC_CONFIG.locationHeading;
}
  const addressElement = document.getElementById("clinic-address");
  const hoursElement = document.getElementById("clinic-hours");
  const phoneElement = document.getElementById("clinic-phone");
  const emailElement = document.getElementById("clinic-email");

  if (addressElement) {
    addressElement.textContent =
      `${CLINIC_CONFIG.address}, ${CLINIC_CONFIG.city}, ${CLINIC_CONFIG.state}`;
  }

  if (hoursElement) {
    hoursElement.textContent = CLINIC_CONFIG.openingHours;
  }

  if (phoneElement) {
    phoneElement.textContent = CLINIC_CONFIG.phone;
  }

  if (emailElement) {
    emailElement.textContent = CLINIC_CONFIG.email;
  }
  // Footer contact information
const footerAddress = document.getElementById("footer-address");
const footerPhone = document.getElementById("footer-phone");
const footerEmail = document.getElementById("footer-email");

if (footerAddress) {
  footerAddress.textContent =
    `${CLINIC_CONFIG.address}, ${CLINIC_CONFIG.city}, ${CLINIC_CONFIG.state}`;
}

if (footerPhone) {
  footerPhone.textContent = CLINIC_CONFIG.phone;
}

if (footerEmail) {
  footerEmail.textContent = CLINIC_CONFIG.email;
}

  // Browser tab title

  // ==========================================
  // DYNAMIC SERVICES
  // ==========================================

  const servicesHeadingElement = document.querySelector(".services h2");
  const servicesGrid = document.querySelector(".services-grid");

  if (servicesHeadingElement) {
    servicesHeadingElement.textContent = CLINIC_CONFIG.servicesHeading;
  }

  if (servicesGrid && Array.isArray(CLINIC_CONFIG.services)) {
    servicesGrid.replaceChildren();

    CLINIC_CONFIG.services.forEach((service, index) => {
      const article = document.createElement("article");
      article.className = index === 0
        ? "service-card service-wide"
        : "service-card";

      const heading = document.createElement("h3");
      heading.textContent = service.title;

      const description = document.createElement("p");
      description.textContent = service.description;

      article.appendChild(heading);
      article.appendChild(description);
      servicesGrid.appendChild(article);
    });
  }

  const taglineElement = document.getElementById("clinic-tagline");

if (taglineElement) {
  taglineElement.textContent = CLINIC_CONFIG.tagline;
}
const heroHeadingElement = document.getElementById("hero-heading");

if (heroHeadingElement) {
  heroHeadingElement.textContent = CLINIC_CONFIG.heroHeading;
}
const heroDescriptionElement = document.getElementById("hero-description");

if (heroDescriptionElement) {
  heroDescriptionElement.textContent = CLINIC_CONFIG.heroDescription;
}
// Hero buttons
const heroBookingButton = document.getElementById("hero-booking-button");
const heroServicesButton = document.getElementById("hero-services-button");

if (heroBookingButton) {
  heroBookingButton.textContent = CLINIC_CONFIG.heroBookingButton;
}

if (heroServicesButton) {
  heroServicesButton.textContent = CLINIC_CONFIG.heroServicesButton;
}
  document.title = `${CLINIC_CONFIG.clinicName} | Dental Care`;

  // Footer branding
  const footerLogo = document.getElementById("footer-logo");
  const footerDescription = document.getElementById("footer-description");
  const footerBookingButton = document.getElementById("footer-booking-button");

  if (footerLogo) {
    footerLogo.src = CLINIC_CONFIG.footerLogo;
  }

  if (footerDescription) {
    footerDescription.textContent = CLINIC_CONFIG.footerDescription;
  }

  if (footerBookingButton) {
    footerBookingButton.firstChild.textContent =
      CLINIC_CONFIG.footerBookingButton + " ";
  }

}