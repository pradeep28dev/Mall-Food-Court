// =====================================
// CUSTOMER AUTHENTICATION
// =====================================

const customerEmail = localStorage.getItem("customerEmail");

if (
    localStorage.getItem("customerLoggedIn") !== "true" ||
    !customerEmail
) {
    window.location.href = "index.html";
}


// =====================================
// GET CURRENT CUSTOMER
// =====================================

let customers = JSON.parse(
    localStorage.getItem("customers") || "[]"
);

let currentCustomer = customers.find(
    customer =>
        customer.email.toLowerCase() === customerEmail.toLowerCase()
);

if (!currentCustomer) {
    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";
}


// =====================================
// ELEMENTS
// =====================================

const profileForm = document.getElementById("profileForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");

const profileAvatar = document.getElementById("profileAvatar");

const customerIdElement = document.getElementById("customerId");
const registrationDateElement = document.getElementById("registrationDate");

const message = document.getElementById("message");


// =====================================
// DISPLAY CUSTOMER INFORMATION
// =====================================

function loadProfile() {

    fullNameInput.value = currentCustomer.name || "";
    emailInput.value = currentCustomer.email || "";
    phoneInput.value = currentCustomer.phone || "";

    displayName.textContent = currentCustomer.name || "Customer";
    displayEmail.textContent = currentCustomer.email || "";

    profileAvatar.textContent =
        (currentCustomer.name || "C").trim().charAt(0).toUpperCase();

    customerIdElement.textContent =
        currentCustomer.customerId || "Not available";

    if (currentCustomer.createdAt) {

        registrationDateElement.textContent =
            new Date(currentCustomer.createdAt).toLocaleDateString("en-IN");

    } else {

        registrationDateElement.textContent = "Not available";
    }
}

loadProfile();


// =====================================
// SAVE PROFILE CHANGES
// =====================================

profileForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = fullNameInput.value.trim();
    const phone = phoneInput.value.trim();

    message.className = "message";
    message.textContent = "";

    if (name.length < 3) {

        showMessage("Please enter a valid full name.", "error");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {

        showMessage("Please enter a valid 10-digit mobile number.", "error");
        return;
    }

    // Check whether another customer already uses this phone number.
    const duplicatePhone = customers.some(customer =>
        customer.customerId !== currentCustomer.customerId &&
        customer.phone === phone
    );

    if (duplicatePhone) {

        showMessage(
            "This mobile number is already registered with another account.",
            "error"
        );

        return;
    }

    // Update customer information.
    currentCustomer.name = name;
    currentCustomer.phone = phone;

    // Update customer array.
    customers = customers.map(customer => {

        if (customer.customerId === currentCustomer.customerId) {
            return currentCustomer;
        }

        return customer;
    });

    localStorage.setItem("customers", JSON.stringify(customers));

    loadProfile();

    showMessage("Your profile has been updated successfully!", "success");
});


// =====================================
// DISPLAY MESSAGE
// =====================================

function showMessage(text, type) {

    message.textContent = text;
    message.className = "message " + type;
}


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutButton").addEventListener("click", function() {

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";
});