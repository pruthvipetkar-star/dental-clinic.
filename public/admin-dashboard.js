
// =====================================
// BRIGHTSIDE DENTAL - ADMIN DASHBOARD
// =====================================

// DOM ELEMENTS
const appointmentsTable = document.getElementById("appointmentsTable");
const statusMessage = document.getElementById("statusMessage");

const totalCount = document.getElementById("totalCount");
const requestedCount = document.getElementById("requestedCount");
const confirmedCount = document.getElementById("confirmedCount");
const completedCount = document.getElementById("completedCount");
const cancelledCount = document.getElementById("cancelledCount");

const searchInput = document.getElementById("appointmentSearch");
const statusFilter = document.getElementById("statusFilter");
const startDateFilter = document.getElementById("startDateFilter");
const endDateFilter = document.getElementById("endDateFilter");
const clearDateFilter = document.getElementById("clearDateFilter");
const exportButton = document.getElementById("exportButton");
const toastContainer = document.getElementById("toastContainer");
// PAGINATION ELEMENTS
const paginationInfo = document.getElementById("paginationInfo");
const pageSizeSelect = document.getElementById("pageSize");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageDisplay = document.getElementById("currentPage");

// SHOW NOTIFICATION
function showToast(message, type = "success") {
  console.log("showToast called:", message);
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");

const appointmentDialog = document.getElementById("appointmentDialog");
const closeDialogButton = document.getElementById("closeDialog");

// APPOINTMENT DETAILS ELEMENTS
const viewName = document.getElementById("viewName");
const viewEmail = document.getElementById("viewEmail");
const viewPhone = document.getElementById("viewPhone");
const viewDate = document.getElementById("viewDate");
const viewService = document.getElementById("viewService");
const viewStatus = document.getElementById("viewStatus");
const viewNotes = document.getElementById("viewNotes");
const viewCreated = document.getElementById("viewCreated");

// DATA
let appointments = [];
// PAGINATION STATE
let currentPage = 1;
let pageSize = 5;

const allowedStatuses = [
  "requested",
  "confirmed",
  "completed",
  "cancelled"
];

// CHECK ADMIN SESSION
async function checkAdminSession() {
  try {
    const response = await fetch("/api/admin/session");
    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      window.location.href = "admin.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error("Session check failed:", error);
    window.location.href = "admin.html";
    return false;
  }
}

// CREATE TABLE CELL
function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "";
  return cell;
}

// FORMAT DATE
function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString();
}

// UPDATE STATISTICS
function updateStatistics() {
  totalCount.textContent = appointments.length;

  requestedCount.textContent = appointments.filter(
    appointment => appointment.status === "requested"
  ).length;

  confirmedCount.textContent = appointments.filter(
    appointment => appointment.status === "confirmed"
  ).length;

  completedCount.textContent = appointments.filter(
    appointment => appointment.status === "completed"
  ).length;

  cancelledCount.textContent = appointments.filter(
    appointment => appointment.status === "cancelled"
  ).length;
}

/// FILTER APPOINTMENTS
function getFilteredAppointments() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const startDate = startDateFilter.value;
  const endDate = endDateFilter.value;

  return appointments.filter(appointment => {
    const matchesSearch =
      String(appointment.name || "").toLowerCase().includes(searchTerm) ||
      String(appointment.email || "").toLowerCase().includes(searchTerm) ||
      String(appointment.phone || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" ||
      appointment.status === selectedStatus;

    const appointmentDate = String(appointment.date || "").slice(0, 10);

    const matchesStartDate =
      !startDate || appointmentDate >= startDate;

    const matchesEndDate =
      !endDate || appointmentDate <= endDate;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesStartDate &&
      matchesEndDate
    );
  });
}

// CREATE STATUS DROPDOWN
function createStatusDropdown(appointment) {
  const select = document.createElement("select");
  select.className = "status-select";

  allowedStatuses.forEach(status => {
    const option = document.createElement("option");

    option.value = status;
    option.textContent =
      status.charAt(0).toUpperCase() + status.slice(1);

    select.appendChild(option);
  });

  select.value = allowedStatuses.includes(appointment.status)
    ? appointment.status
    : "requested";

function applyStatusStyle() {
  select.className = "status-select";
  select.classList.add(`status-${select.value}`);
}

applyStatusStyle();

select.addEventListener("change", async () => {
  applyStatusStyle();

  await updateAppointmentStatus(
    appointment.id,
    select.value,
    select
  );
});

  return select;
}

// CREATE VIEW BUTTON
function createViewButton(appointment) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "View";

  button.addEventListener("click", () => {
    showAppointmentDetails(appointment);
  });

  return button;
}

// CREATE DELETE BUTTON
function createDeleteButton(appointment) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = "Delete";
  button.className = "delete-button";

  button.addEventListener("click", async () => {
    await deleteAppointment(appointment.id);
  });

  return button;
}


// DISPLAY APPOINTMENTS
function displayAppointments() {
  appointmentsTable.replaceChildren();

  const filteredAppointments = getFilteredAppointments();
  const totalAppointments = filteredAppointments.length;

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalAppointments / pageSize));

  // Keep current page valid
  currentPage = Math.min(currentPage, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalAppointments);

  // Update pagination information
  paginationInfo.textContent = totalAppointments === 0
    ? "Showing 0–0 of 0"
    : `Showing ${startIndex + 1}–${endIndex} of ${totalAppointments}`;

  currentPageDisplay.textContent =
    `Page ${currentPage} of ${totalPages}`;

  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;

  // Check empty appointments
  if (totalAppointments === 0) {
    statusMessage.textContent =
      appointments.length === 0
        ? "No appointments found."
        : "No matching appointments found.";

    return;
  }

  statusMessage.textContent =
    `Showing ${endIndex - startIndex} appointment(s) on this page.`;

  // Get appointments for current page
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex
  );

  paginatedAppointments.forEach(appointment => {
    const row = document.createElement("tr");

    // Patient
    row.appendChild(createCell(appointment.name));

    // Email
    row.appendChild(createCell(appointment.email));

    // Phone
    row.appendChild(createCell(appointment.phone));

    // Appointment date
    row.appendChild(createCell(formatDate(appointment.date)));

    // Service
    row.appendChild(createCell(appointment.service));

    // Status dropdown
    const statusCell = document.createElement("td");
    statusCell.appendChild(createStatusDropdown(appointment));
    row.appendChild(statusCell);

    // Action buttons
    const actionCell = document.createElement("td");
    actionCell.appendChild(createViewButton(appointment));
    actionCell.appendChild(createDeleteButton(appointment));
    row.appendChild(actionCell);

    appointmentsTable.appendChild(row);
  });
}

// LOAD APPOINTMENTS
async function loadAppointments() {
  statusMessage.textContent = "Loading appointments...";
  refreshButton.disabled = true;

  try {
    const response = await fetch("/api/appointments");

    if (response.status === 401) {
      window.location.href = "admin-login.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load appointments.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid appointment data received.");
    }

    appointments = data;

    updateStatistics();
    displayAppointments();

  } catch (error) {
    console.error("Loading appointments failed:", error);
    statusMessage.textContent = "Unable to load appointments. Please refresh.";
  } finally {
    refreshButton.disabled = false;
  }
}

// UPDATE APPOINTMENT STATUS
async function updateAppointmentStatus(id, newStatus, select) {
  if (!allowedStatuses.includes(newStatus)) return;

  const previousStatus = appointments.find(
    appointment => appointment.id === id
  )?.status;

  select.disabled = true;

  try {
    const response = await fetch(
      `/api/admin/appointments/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (response.status === 401) {
  window.location.href = "admin-dashboard.html";
  return;
}

    if (!response.ok) {
      throw new Error(data.error || "Could not update status.");
    }

    const appointment = appointments.find(
      item => item.id === id
    );

    if (appointment) {
      appointment.status = newStatus;
    }

    updateStatistics();

    select.className = "status-select";
    select.classList.add(`status-${newStatus}`);

    statusMessage.textContent = "Appointment status updated successfully.";
    showToast("Appointment status updated successfully!");

    // Refresh if the changed appointment no longer matches the filter.
    displayAppointments();

  } catch (error) {
    console.error("Status update failed:", error);

    select.value = previousStatus || "requested";
    select.className = "status-select";
    select.classList.add(`status-${select.value}`);

    statusMessage.textContent = error.message;
    showToast(error.message, "error");

  } finally {
    select.disabled = false;
  }
}

// SHOW APPOINTMENT DETAILS
function showAppointmentDetails(appointment) {
  viewName.textContent = appointment.name || "";
  viewEmail.textContent = appointment.email || "";
  viewPhone.textContent = appointment.phone || "";
  viewDate.textContent = formatDate(appointment.date);
  viewService.textContent = appointment.service || "";
  viewStatus.textContent = appointment.status || "requested";
  viewNotes.textContent = appointment.notes || "No notes";
  viewCreated.textContent = formatDate(appointment.createdAt);

  appointmentDialog.showModal();
}

// CLOSE DETAILS DIALOG
closeDialogButton.addEventListener("click", () => {
  appointmentDialog.close();
});

// DELETE APPOINTMENT
async function deleteAppointment(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this appointment?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `/api/admin/appointments/${encodeURIComponent(id)}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      window.location.href = "admin-login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "Could not delete appointment.");
    }

    appointments = appointments.filter(
      appointment => appointment.id !== id
    );

    updateStatistics();
    displayAppointments();

    statusMessage.textContent = "Appointment deleted successfully.";
    showToast("Appointment deleted successfully!");

  } catch (error) {
    console.error("Delete failed:", error);
    statusMessage.textContent = error.message;
    showToast(error.message, "error");
  }
}

// SEARCH LISTENER
searchInput.addEventListener("input", displayAppointments);

// STATUS FILTER LISTENER
statusFilter.addEventListener("change", displayAppointments);

// REFRESH LISTENER
refreshButton.addEventListener("click", loadAppointments);


// LOGOUT
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    const response = await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Logout request failed.");
    }

  } catch (error) {
    console.error("Logout failed:", error);
  }

  window.location.replace("/admin-login.html");
});


// INITIALIZE DASHBOARD
async function initializeDashboard() {
  const authenticated = await checkAdminSession();

  if (!authenticated) return;

  await loadAppointments();
}

initializeDashboard();
// EXPORT APPOINTMENTS TO CSV
function exportAppointmentsToCSV() {
  if (appointments.length === 0) {
    showToast("No appointments available to export.", "error");
    return;
  }

  const headers = [
    "Patient",
    "Email",
    "Phone",
    "Date",
    "Service",
    "Status",
    "Notes",
    "Booking Date"
  ];

  const rows = appointments.map(appointment => [
    appointment.name,
    appointment.email,
    appointment.phone,
    appointment.date,
    appointment.service,
    appointment.status,
    appointment.notes,
    appointment.createdAt
  ]);

  const csvContent = [headers, ...rows]
    .map(row =>
      row.map(value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`
      ).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "brightside-dental-appointments.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Appointments exported successfully!");
}

// EXPORT BUTTON CLICK
exportButton.addEventListener("click", exportAppointmentsToCSV);
startDateFilter.addEventListener("change", displayAppointments);
endDateFilter.addEventListener("change", displayAppointments);

clearDateFilter.addEventListener("click", () => {
  startDateFilter.value = "";
  endDateFilter.value = "";
  displayAppointments();
});

// PAGINATION BUTTONS

prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayAppointments();
  }
});

nextPageButton.addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(getFilteredAppointments().length / pageSize)
  );

  if (currentPage < totalPages) {
    currentPage++;
    displayAppointments();
  }
});

// CHANGE PAGE SIZE
pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  displayAppointments();
});

// RESET PAGE WHEN SEARCHING OR FILTERING
searchInput.addEventListener("input", () => {
  currentPage = 1;
  displayAppointments();
});

statusFilter.addEventListener("change", () => {
  currentPage = 1;
  displayAppointments();
});

startDateFilter.addEventListener("change", () => {
  currentPage = 1;
  displayAppointments();
});

endDateFilter.addEventListener("change", () => {
  currentPage = 1;
  displayAppointments();
});

clearDateFilter.addEventListener("click", () => {
  currentPage = 1;
  displayAppointments();
});