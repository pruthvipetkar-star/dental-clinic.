
const nodemailer = require("nodemailer");
const { buildAlertEmail } = require("./email-template");

function buildTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendAppointmentAlert(appointment) {
  const transporter = buildTransporter();

  if (!transporter) {
    console.warn(
      "[mailer] SMTP is not configured. Check your .env settings."
    );

    return {
      sent: false,
      reason: "not_configured",
    };
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const clinicEmail = process.env.CLINIC_EMAIL;
  const results = {
    clinic: false,
    customer: false,
  };

  // 1. Send appointment details to the clinic.
  if (clinicEmail) {
    try {
      const { subject, text, html } = buildAlertEmail(appointment);

      const info = await transporter.sendMail({
        from,
        to: clinicEmail,
        replyTo: appointment.email,
        subject,
        text,
        html,
      });

      results.clinic = true;
      console.log("[mailer] Clinic email sent:", info.messageId);
    } catch (error) {
      console.error(
        "[mailer] Clinic email failed:",
        error.code || error.message
      );
    }
  } else {
    console.warn("[mailer] CLINIC_EMAIL is missing from .env.");
  }

  // 2. Send a request-received confirmation to the customer.
  if (appointment.email) {
    const customerSubject =
      "We received your dental appointment request";

    const customerText = [
      `Hello ${appointment.name},`,
      "",
      "Thank you for contacting Brightside Dental.",
      "We have received your appointment request with the following details:",
      "",
      `Name: ${appointment.name}`,
      `Service: ${appointment.service}`,
      `Requested date: ${appointment.date}`,
      `Phone: ${appointment.phone}`,
      "",
      "Your request is awaiting confirmation from the clinic.",
      "We will contact you if any further information is needed.",
      "",
      "Thank you,",
      "Brightside Dental",
    ].join("\n");

    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]);

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#24302e;max-width:600px;margin:auto">
        <h2 style="color:#1f3d3b">Brightside Dental</h2>
        <p>Hello ${escapeHtml(appointment.name)},</p>
        <p>Thank you for contacting Brightside Dental. We have received your appointment request.</p>
        <h3>Appointment details</h3>
        <p>
          <strong>Name:</strong> ${escapeHtml(appointment.name)}<br>
          <strong>Service:</strong> ${escapeHtml(appointment.service)}<br>
          <strong>Requested date:</strong> ${escapeHtml(appointment.date)}<br>
          <strong>Phone:</strong> ${escapeHtml(appointment.phone)}
        </p>
        <p>Your request is awaiting confirmation from the clinic. We will contact you if any further information is needed.</p>
        <p>Thank you,<br><strong>Brightside Dental</strong></p>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from,
        to: appointment.email,
        subject: customerSubject,
        text: customerText,
        html: customerHtml,
      });

      results.customer = true;
      console.log("[mailer] Customer email sent:", info.messageId);
    } catch (error) {
      console.error(
        "[mailer] Customer email failed:",
        error.code || error.message
      );
    }
  } else {
    console.warn("[mailer] Customer email address is missing.");
  }

  return {
    sent: results.clinic || results.customer,
    ...results,
  };
}

module.exports = { sendAppointmentAlert };
