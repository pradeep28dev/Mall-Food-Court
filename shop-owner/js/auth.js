// ==========================================
// SHOP OWNER LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");

const successMessage = document.getElementById("successMessage");


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

togglePassword.addEventListener("click", function() {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "Show";

    }

});


// ==========================================
// SHOP OWNER LOGIN
// ==========================================

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    errorMessage.textContent = "";

    successMessage.textContent = "";


    const email = emailInput.value.trim().toLowerCase();

    const password = passwordInput.value;


    if (!email || !password) {

        errorMessage.textContent =
            "Please enter your email and password.";

        return;

    }


    // GET REGISTERED SHOP OWNER ACCOUNTS

    const shopOwners = JSON.parse(
        localStorage.getItem("shopOwners") || "[]"
    );


    // FIND ACCOUNT

    const owner = shopOwners.find(account =>
        account.email === email &&
        account.password === password
    );


    if (!owner) {

        errorMessage.textContent =
            "Invalid email or password. Please check your details.";

        return;

    }


    // CHECK MALL OWNER SHOP STATUS

    const foodShops = JSON.parse(
        localStorage.getItem("foodShops") || "[]"
    );

    const assignedShop = foodShops.find(shop =>
        shop.shopId === owner.shopId
    );


    if (!assignedShop) {

        errorMessage.textContent =
            "Your assigned food shop could not be found.";

        return;

    }


    if (assignedShop.status !== "Active") {

        errorMessage.textContent =
            "Your food shop account is currently inactive. Contact the Mall Owner.";

        return;

    }


    // SAVE LOGIN INFORMATION

    localStorage.setItem("shopOwnerLoggedIn", "true");

    localStorage.setItem("shopOwnerEmail", owner.email);

    localStorage.setItem("shopOwnerShopId", owner.shopId);


    successMessage.textContent =
        "Login successful! Redirecting...";


    setTimeout(function() {

        window.location.href = "dashboard.html";

    }, 1000);

});