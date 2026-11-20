// =====================================
// CUSTOMER SIGNUP
// =====================================

const signupForm = document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const signupButton = document.getElementById("signupButton");


// =====================================
// SHOW / HIDE PASSWORD
// =====================================

document.querySelectorAll(".toggle-password").forEach(button => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }

    });

});


// =====================================
// PHONE NUMBER INPUT
// =====================================

phoneInput.addEventListener("input", () => {

    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);

});


// =====================================
// MESSAGE FUNCTIONS
// =====================================

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


// =====================================
// SIGNUP FORM SUBMISSION
// =====================================

signupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    const name = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;


    // NAME VALIDATION

    if (name.length < 3) {
        showError("Please enter a valid full name.");
        return;
    }


    // EMAIL VALIDATION

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        return;
    }


    // PHONE VALIDATION

    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(phone)) {
        showError("Please enter a valid 10-digit Indian mobile number.");
        return;
    }


    // PASSWORD VALIDATION

    if (password.length < 8) {
        showError("Password must contain at least 8 characters.");
        return;
    }


    // CONFIRM PASSWORD

    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }


    // GET EXISTING CUSTOMERS

    const customers = JSON.parse(
        localStorage.getItem("customers") || "[]"
    );


    // CHECK DUPLICATE EMAIL

    const existingEmail = customers.some(customer =>
        customer.email.toLowerCase() === email
    );

    if (existingEmail) {
        showError("An account with this email already exists.");
        return;
    }


    // CHECK DUPLICATE PHONE

    const existingPhone = customers.some(customer =>
        customer.phone === phone
    );

    if (existingPhone) {
        showError("This mobile number is already registered.");
        return;
    }


    // CREATE CUSTOMER ACCOUNT

    const newCustomer = {

        customerId: "CUS" + Date.now(),

        name: name,

        email: email,

        phone: phone,

        password: password,

        createdAt: new Date().toISOString()

    };


    // SAVE CUSTOMER

    customers.push(newCustomer);

    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    // SUCCESS

    signupButton.disabled = true;

    showSuccess("Account created successfully! Redirecting to login...");

    signupForm.reset();

    setTimeout(() => {

        window.location.href = "index.html";

    }, 1800);

});