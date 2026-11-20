// ===================================
// CUSTOMER LOGIN
// ===================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");


// ===================================
// PASSWORD SHOW / HIDE
// ===================================

document.getElementById("togglePassword").addEventListener(
    "click",
    function() {

        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            icon.classList.replace("fa-eye", "fa-eye-slash");

        } else {

            passwordInput.type = "password";

            icon.classList.replace("fa-eye-slash", "fa-eye");

        }

    }
);


// ===================================
// MESSAGE FUNCTIONS
// ===================================

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

    successMessage.style.display = "none";

}


function showSuccess(message) {

    successMessage.textContent = message;

    successMessage.style.display = "block";

    errorMessage.style.display = "none";

}


// ===================================
// CUSTOMER LOGIN FORM
// ===================================

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    errorMessage.style.display = "none";

    successMessage.style.display = "none";


    const email = emailInput.value.trim().toLowerCase();

    const password = passwordInput.value;


    // LOAD CUSTOMER ACCOUNTS

    const customers = JSON.parse(
        localStorage.getItem("customers") || "[]"
    );


    // FIND CUSTOMER

    const customer = customers.find(user =>
        user.email.toLowerCase() === email &&
        user.password === password
    );


    if (!customer) {

        showError("Invalid email address or password.");

        return;

    }


    // SAVE LOGIN INFORMATION

    localStorage.setItem("customerLoggedIn", "true");

    localStorage.setItem("customerEmail", customer.email);


    showSuccess("Login successful! Redirecting...");


    // REDIRECT TO CUSTOMER HOME PAGE

    setTimeout(() => {

        window.location.href = "home.html";

    }, 1000);

});