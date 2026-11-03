const crypto = require("crypto");

const http = require("http");
const fs = require("fs");
const path = require("path");

const { loadEnv } = require("./lib/env");
loadEnv();

const { sendAppointmentAlert } = require("./lib/mailer");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "appointments.json");

// Create the data folder and appointments file if missing.
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
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function readAppointments() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[appointments] Read failed:", error.message);
    return [];
  }
}

function writeAppointments(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

// Admin sessions are stored in server memory.
const adminSessions = new Map();
const SESSION_DURATION = 8 * 60 * 60 * 1000;

// Admin login rate limiting
const loginAttempts = new Map();
const LOGIN_WINDOW = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

function getAdminToken(req) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/(?:^|;\s*)adminToken=([^;]*)/);

  return match ? match[1] : null;
}

function isAdminAuthenticated(req) {
  const token = getAdminToken(req);

  if (!token) return false;

  const session = adminSessions.get(token);

  if (!session) return false;

  if (Date.now() >= session.expiresAt) {
    adminSessions.delete(token);
    return false;
  }

  return true;
}

function requireAdmin(req, res) {
  if (isAdminAuthenticated(req)) return true;

  sendJSON(res, 401, {
    ok: false,
    error: "Admin authentication required."
  });

  return false;
}



function validateAppointment(body) {
  const errors = [];

  const { name, email, phone, service, date, notes } = body;

  // Name
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    errors.push("Name must be between 2 and 100 characters.");
  }

  // Email
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Please enter a valid email address.");
  }

  // Phone
  if (
    typeof phone !== "string" ||
    phone.length > 25 ||
    phone.replace(/\D/g, "").length < 7 ||
    phone.replace(/\D/g, "").length > 15
  ) {
    errors.push("Please enter a valid phone number.");
  }

  // Service
  const allowedServices = [
    "General checkup & cleaning",
    "Cosmetic dentistry",
    "Restorative work",
    "Orthodontics",
    "Emergency visit"
  ];

  if (
    typeof service !== "string" ||
    !allowedServices.includes(service.trim())
  ) {
    errors.push("Please choose a valid service.");
  }

  // Notes
  if (
    notes !== undefined &&
    (typeof notes !== "string" || notes.length > 1000)
  ) {
    errors.push("Notes cannot exceed 1000 characters.");
  }

  // Date
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    errors.push("Please choose a valid date.");
  } else {
    const [year, month, day] = date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      errors.push("Please choose a valid date.");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push("Please choose today or a future date.");
      }
    }
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
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400);
    return res.end("Invalid URL");
  }

  const relativePath =
    decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");

  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  // Prevent requests from accessing files outside the public folder.
  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(PUBLIC_DIR + path.sep)
  ) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });

    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(req.url, "http://localhost");
  } catch {
    return sendJSON(res, 400, {
      ok: false,
      errors: ["Invalid URL."],
    });
  }

  const pathname = parsedUrl.pathname;



  // ADMIN LOGIN
  if (pathname === "/api/admin/login" && req.method === "POST") {
    const clientIP = req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let attempts = loginAttempts.get(clientIP);

    if (!attempts || now - attempts.windowStartedAt >= LOGIN_WINDOW) {
      attempts = {
        count: 0,
        windowStartedAt: now
      };

      loginAttempts.set(clientIP, attempts);
    }

    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const remainingTime = Math.ceil(
        (LOGIN_WINDOW - (now - attempts.windowStartedAt)) / 1000
      );

      res.setHeader("Retry-After", remainingTime);

      return sendJSON(res, 429, {
        ok: false,
        error: "Too many login attempts. Please try again later."
      });
    }

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();

      if (Buffer.byteLength(body) > 10000) {
        res.writeHead(413);
        res.end();
        req.destroy();
      }
    });

    req.on("end", () => {
      let data;

      try {
        data = JSON.parse(body || "{}");
      } catch {
        return sendJSON(res, 400, {
          ok: false,
          error: "Invalid request."
        });
      }

      const expected = process.env.ADMIN_PASSWORD || "";
      const supplied = typeof data.password === "string"
        ? data.password
        : "";

      if (!expected) {
        return sendJSON(res, 500, {
          ok: false,
          error: "Admin password is not configured."
        });
      }

      const expectedBuffer = Buffer.from(expected);
      const suppliedBuffer = Buffer.from(supplied);

      const valid =
        expectedBuffer.length === suppliedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

      if (!valid) {
        attempts.count++;

        if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
          const remainingTime = Math.ceil(
            (LOGIN_WINDOW - (Date.now() - attempts.windowStartedAt)) / 1000
          );

          res.setHeader("Retry-After", remainingTime);

          return sendJSON(res, 429, {
            ok: false,
            error: "Too many login attempts. Please try again later."
          });
        }

        return sendJSON(res, 401, {
          ok: false,
          error: "Incorrect password."
        });
      }

      // Clear failed attempts after successful login.
      loginAttempts.delete(clientIP);

      const token = crypto.randomBytes(32).toString("hex");

      adminSessions.set(token, {
        expiresAt: Date.now() + SESSION_DURATION
      });

      const secureCookie =
        process.env.NODE_ENV === "production" ? "; Secure" : "";

      res.setHeader(
        "Set-Cookie",
        `adminToken=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secureCookie}`
      );

      return sendJSON(res, 200, { ok: true });
    });

    return;
  }



  // ADMIN LOGOUT
  if (pathname === "/api/admin/logout" && req.method === "POST") {
    const token = getAdminToken(req);

    if (token) adminSessions.delete(token);

    res.setHeader(
      "Set-Cookie",
      "adminToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    );

    return sendJSON(res, 200, { ok: true });
  }

  // CHECK ADMIN SESSION
  if (pathname === "/api/admin/session" && req.method === "GET") {
    return sendJSON(res, 200, {
      authenticated: isAdminAuthenticated(req)
    });
  }

  // UPDATE APPOINTMENT STATUS
  if (
    pathname.startsWith("/api/admin/appointments/") &&
    req.method === "PATCH"
  ) {
    if (!requireAdmin(req, res)) return;

    const appointmentId = decodeURIComponent(
      pathname.slice("/api/admin/appointments/".length)
    );

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();

      if (Buffer.byteLength(body) > 10000) {
        res.writeHead(413);
        res.end();
        req.destroy();
      }
    });

    req.on("end", () => {
      let data;

      try {
        data = JSON.parse(body || "{}");
      } catch {
        return sendJSON(res, 400, {
          ok: false,
          error: "Invalid request."
        });
      }

      const allowedStatuses = [
  "requested",
  "confirmed",
  "completed",
  "cancelled"
];

      if (!allowedStatuses.includes(data.status)) {
        return sendJSON(res, 400, {
          ok: false,
          error: "Invalid appointment status."
        });
      }

      const appointments = readAppointments();
      const appointment = appointments.find(
        item => item.id === appointmentId
      );

      if (!appointment) {
        return sendJSON(res, 404, {
          ok: false,
          error: "Appointment not found."
        });
      }

      appointment.status = data.status;

      try {
        writeAppointments(appointments);
      } catch (error) {
        console.error("[appointments] Update failed:", error.message);
        return sendJSON(res, 500, {
          ok: false,
          error: "Could not update appointment."
        });
      }

      return sendJSON(res, 200, {
        ok: true,
        appointment
      });
    });

    return;
  }


 // Retrieve saved appointments (admin only).
if (pathname === "/api/appointments" && req.method === "GET") {
  if (!requireAdmin(req, res)) return;

  return sendJSON(res, 200, readAppointments());
}

  // DELETE APPOINTMENT (ADMIN ONLY)
  if (
    pathname.startsWith("/api/admin/appointments/") &&
    req.method === "DELETE"
  ) {
    if (!requireAdmin(req, res)) return;

    const appointmentId = decodeURIComponent(
      pathname.slice("/api/admin/appointments/".length)
    );

    if (!appointmentId || appointmentId.includes("/")) {
      return sendJSON(res, 400, {
        ok: false,
        error: "Invalid appointment ID."
      });
    }

    const appointments = readAppointments();

    const updatedAppointments = appointments.filter(
      appointment => appointment.id !== appointmentId
    );

    if (updatedAppointments.length === appointments.length) {
      return sendJSON(res, 404, {
        ok: false,
        error: "Appointment not found."
      });
    }

    try {
      writeAppointments(updatedAppointments);
    } catch (error) {
      console.error("[appointments] Delete failed:", error.message);

      return sendJSON(res, 500, {
        ok: false,
        error: "Could not delete appointment."
      });
    }

    return sendJSON(res, 200, {
      ok: true,
      message: "Appointment deleted successfully."
    });
  }


  // Submit a new appointment.
  if (pathname === "/api/appointments" && req.method === "POST") {
    let body = "";
    let tooLarge = false;

    req.on("data", (chunk) => {
      body += chunk.toString();

      if (Buffer.byteLength(body, "utf8") > 1e6 && !tooLarge) {
        tooLarge = true;
        res.writeHead(413, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify({
          ok: false,
          errors: ["Request too large."],
        }));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (tooLarge) return;

      let parsedBody;

      try {
        parsedBody = JSON.parse(body || "{}");
      } catch {
        return sendJSON(res, 400, {
          ok: false,
          errors: ["Invalid request body."],
        });
      }

      if (
        !parsedBody ||
        typeof parsedBody !== "object" ||
        Array.isArray(parsedBody)
      ) {
        return sendJSON(res, 400, {
          ok: false,
          errors: ["Invalid appointment data."],
        });
      }

      const errors = validateAppointment(parsedBody);

      if (errors.length > 0) {
        return sendJSON(res, 400, { ok: false, errors });
      }

      const appointment = {
        id:
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 7),
        name: parsedBody.name.trim(),
        email: parsedBody.email.trim(),
        phone: String(parsedBody.phone).trim(),
        service: parsedBody.service.trim(),
        date: parsedBody.date,
        notes:
          typeof parsedBody.notes === "string"
            ? parsedBody.notes.trim()
            : "",
        status: "requested",
        createdAt: new Date().toISOString(),
      };

      try {
        const appointments = readAppointments();
        appointments.push(appointment);
        writeAppointments(appointments);
      } catch (error) {
        console.error("[appointments] Save failed:", error.message);

        return sendJSON(res, 500, {
          ok: false,
          errors: ["Could not save your appointment. Please try again."],
        });
      }

      // Return success after saving, then send the email alert.
      sendJSON(res, 201, { ok: true, appointment });

      Promise.resolve()
        .then(() => sendAppointmentAlert(appointment))
        .then((result) => {
          console.log("[mailer] Result:", result);
        })
        .catch((error) => {
          console.error(
            "[mailer] Failed:",
            error.code || error.message
          );
        });

      return;
    });

    return;
  }

  // Serve website files for normal browser requests.
  if (req.method === "GET") {
    return serveStatic(req, res, pathname);
  }

  res.writeHead(405, {
    "Content-Type": "application/json; charset=utf-8",
    Allow: "GET, POST, PATCH, DELETE",
  });

  res.end(JSON.stringify({
    ok: false,
    errors: ["Method not allowed."],
  }));
});

server.on("error", (error) => {
  console.error("[server] Error:", error.code || error.message);
});

server.listen(PORT, () => {
  console.log(`Brightside Dental running at http://localhost:${PORT}`);
});
