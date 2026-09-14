// Pure template-building logic — no external dependencies, so it can
// be tested and reused without needing nodemailer installed.

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAlertEmail(appointment) {
  const subject = `New appointment request — ${appointment.name} (${formatDate(appointment.date)})`;

  const text = [
    `New appointment request received:`,
    ``,
    `Name:     ${appointment.name}`,
    `Email:    ${appointment.email}`,
    `Phone:    ${appointment.phone}`,
    `Service:  ${appointment.service}`,
    `Date:     ${formatDate(appointment.date)}`,
    `Notes:    ${appointment.notes || "(none)"}`,
    ``,
    `Submitted: ${new Date(appointment.createdAt).toLocaleString("en-US")}`,
    `Booking ID: ${appointment.id}`,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; color: #24302E; max-width: 480px;">
      <h2 style="color: #1F3D3B; margin-bottom: 4px;">New appointment request</h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Name</td><td>${escapeHtml(appointment.name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Email</td><td>${escapeHtml(appointment.email)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Phone</td><td>${escapeHtml(appointment.phone)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Service</td><td>${escapeHtml(appointment.service)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Date</td><td>${escapeHtml(formatDate(appointment.date))}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #7FA8A0;">Notes</td><td>${escapeHtml(appointment.notes || "(none)")}</td></tr>
      </table>
      <p style="color: #7FA8A0; font-size: 12px; margin-top: 16px;">
        Booking ID: ${appointment.id} · Submitted ${new Date(appointment.createdAt).toLocaleString("en-US")}
      </p>
    </div>
  `;

  return { subject, text, html };
}

module.exports = { buildAlertEmail, formatDate, escapeHtml };
