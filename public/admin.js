
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

// Check whether an admin session already exists.
async function checkAdminSession() {
  try {
    const response = await fetch("/api/admin/session");
    const data = await response.json();

    if (response.ok && data.authenticated) {
      window.location.href = "/admin-dashboard.html";
    }
  } catch (error) {
    console.error("Session check failed:", error);
  }
}

// Handle admin login.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = passwordInput.value.trim();

  if (!password) {
    message.textContent = "Please enter your admin password.";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";
  message.textContent = "";

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Invalid admin password.");
    }

    message.style.color = "#287a52";
    message.textContent = "Login successful!";

    passwordInput.value = "";

    window.location.href = "/admin-dashboard.html";
  } catch (error) {
    message.style.color = "#b34236";
    message.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});

// Run session check when page loads.
checkAdminSession();
