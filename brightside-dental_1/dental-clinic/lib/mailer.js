const nodemailer = require("nodemailer");
const { buildAlertEmail } = require("./email-template");

// Reads SMTP settings from environment variables (set via .env or
// your hosting platform's config). See .env.example for what's needed.
function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // Not configured yet
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true", // true for port 465, false for 587/25
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendAppointmentAlert(appointment) {
  const transporter = buildTransporter();
  const clinicEmail = process.env.CLINIC_EMAIL;

  if (!transporter || !clinicEmail) {
    console.warn(
      "[mailer] Email alerts are not configured — skipping. " +
      "Set SMTP_HOST, SMTP_USER, SMTP_PASS, and CLINIC_EMAIL in .env to enable them."
    );
    return { sent: false, reason: "not_configured" };
  }

  const { subject, text, html } = buildAlertEmail(appointment);

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: clinicEmail,
    subject,
    text,
    html,
  });

  return { sent: true };
}

module.exports = { sendAppointmentAlert };
