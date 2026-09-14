const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const { loadEnv } = require("./lib/env");
loadEnv();
const { sendAppointmentAlert } = require("./lib/mailer");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "appointments.json");

if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function readAppointments() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeAppointments(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

function validateAppointment(body) {
  const errors = [];
  const { name, email, phone, service, date } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Please enter your full name.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!phone || String(phone).replace(/\D/g, "").length < 7) {
    errors.push("Please enter a valid phone number.");
  }
  if (!service || typeof service !== "string") {
    errors.push("Please choose a service.");
  }
  if (!date || isNaN(Date.parse(date))) {
    errors.push("Please choose a valid date.");
  } else if (new Date(date) < new Date(new Date().toDateString())) {
    errors.push("Please choose a date that isn't in the past.");
  }

  return errors;
}

function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (err2, fallback) => {
        if (err2) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("Not found");
        }
        res.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
        res.end(fallback);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (pathname === "/api/appointments" && req.method === "GET") {
    return sendJSON(res, 200, readAppointments());
  }

  if (pathname === "/api/appointments" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body || "{}");
      } catch {
        return sendJSON(res, 400, { ok: false, errors: ["Invalid request body."] });
      }

      const errors = validateAppointment(parsedBody);
      if (errors.length > 0) {
        return sendJSON(res, 400, { ok: false, errors });
      }

      const appointments = readAppointments();
      const appointment = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name: parsedBody.name.trim(),
        email: parsedBody.email.trim(),
        phone: parsedBody.phone.trim(),
        service: parsedBody.service,
        date: parsedBody.date,
        notes: (parsedBody.notes || "").trim(),
        status: "requested",
        createdAt: new Date().toISOString(),
      };

      appointments.push(appointment);
      writeAppointments(appointments);
      sendJSON(res, 201, { ok: true, appointment });

      // Fire the clinic email alert after responding, so a slow or
      // misconfigured mail server never delays the patient's confirmation.
      sendAppointmentAlert(appointment).catch((err) => {
        console.error("[mailer] Failed to send appointment alert:", err.message);
      });
    });
    return;
  }

  if (req.method === "GET") {
    return serveStatic(req, res, pathname);
  }

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Brightside Dental running at http://localhost:${PORT}`);
});
