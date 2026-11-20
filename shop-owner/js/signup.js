// ===================================
// ELEMENT REFERENCES
// ===================================

const signupForm = document.getElementById("signupForm");

const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

const signupButton = document.getElementById("signupButton");


// ===================================
// PASSWORD SHOW / HIDE
// ===================================

document.querySelectorAll(".toggle-password").forEach(button => {

    button.addEventListener("click", function() {

        const input = document.getElementById(
            this.dataset.target
        );

        const icon = this.querySelector("i");

        if (input.type === "password") {

            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");

        } else {

            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");

        }

    });

});


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
// SIGNUP FORM
// ===================================

signupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    errorMessage.style.display = "none";
    successMessage.style.display = "none";


    // GET FORM VALUES

    const shopId = document
        .getElementById("shopId")
        .value.trim()
        .toUpperCase();

    const email = document
        .getElementById("email")
        .value.trim()
        .toLowerCase();

    const password = document
        .getElementById("password")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;


    // PASSWORD VALIDATION

    if (password.length < 8) {

        showError("Password must contain at least 8 characters.");
        return;

    }

    if (password !== confirmPassword) {

        showError("Passwords do not match.");
        return;

    }


    // LOAD REGISTERED SHOPS

    const foodShops = JSON.parse(
        localStorage.getItem("foodShops")
    ) || [];


    // FIND SHOP

    const shopIndex = foodShops.findIndex(shop =>
        shop.shopId.toUpperCase() === shopId
    );


    if (shopIndex === -1) {

        showError("Invalid Shop ID. Please check your assigned Shop ID.");
        return;

    }


    const shop = foodShops[shopIndex];


    // CHECK SHOP STATUS

    if (shop.status !== "Active") {

        showError("This shop is currently inactive. Contact the Mall Owner.");
        return;

    }


    // VERIFY REGISTERED EMAIL

    if (shop.email.toLowerCase() !== email) {

        showError("The email address does not match the registered shop details.");
        return;

    }


    // CHECK EXISTING REGISTRATION

    if (shop.registered === true) {

        showError("An account has already been created for this Shop ID.");
        return;

    }


    // LOAD EXISTING ACCOUNTS

    const shopOwners = JSON.parse(
        localStorage.getItem("shopOwners")
    ) || [];


    // CHECK DUPLICATE EMAIL

    const existingEmail = shopOwners.some(owner =>
        owner.email.toLowerCase() === email
    );

    if (existingEmail) {

        showError("An account already exists with this email address.");
        return;

    }


    // CHECK DUPLICATE SHOP ID

    const existingShop = shopOwners.some(owner =>
        owner.shopId === shopId
    );

    if (existingShop) {

        showError("An account already exists for this shop.");
        return;

    }


    // CREATE SHOP OWNER ACCOUNT

    const newOwner = {

        shopId: shop.shopId,
        shopName: shop.shopName,
        ownerName: shop.ownerName,
        email: email,
        password: password,

        createdAt: new Date().toISOString()

    };


    // SAVE ACCOUNT

    shopOwners.push(newOwner);

    localStorage.setItem(
        "shopOwners",
        JSON.stringify(shopOwners)
    );


    // MARK SHOP AS REGISTERED

    foodShops[shopIndex].registered = true;

    localStorage.setItem(
        "foodShops",
        JSON.stringify(foodShops)
    );


    // SUCCESS

    signupButton.disabled = true;

    showSuccess(
        "Account created successfully! Redirecting you to login..."
    );


    setTimeout(() => {

        window.location.href = "index.html";

    }, 2000);

});