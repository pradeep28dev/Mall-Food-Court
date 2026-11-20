// Get HTML elements

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");

const successMessage = document.getElementById("successMessage");


// Temporary demo credentials
// Backend authentication will replace these later.

const ADMIN_EMAIL = "admin@mall.com";

const ADMIN_PASSWORD = "Mall@123";


// Show / Hide Password

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "Show";

    }

});


// Login Functionality

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    errorMessage.textContent = "";

    successMessage.textContent = "";


    const email = emailInput.value.trim();

    const password = passwordInput.value;


    // Check empty fields

    if (!email || !password) {

        errorMessage.textContent = "Please fill in all fields.";

        return;

    }


    // Validate credentials

    if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
    ) {

        successMessage.textContent = "Login successful! Redirecting...";


        // Temporary frontend authentication

        localStorage.setItem("mallOwnerLoggedIn", "true");

        localStorage.setItem("mallOwnerEmail", email);


        // Redirect to dashboard

        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 1000);

    } else {

        errorMessage.textContent = "Invalid email or password.";

    }

});