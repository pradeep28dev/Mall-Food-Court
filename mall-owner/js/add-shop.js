// ========================================
// MALL OWNER AUTHENTICATION
// ========================================

if (localStorage.getItem("mallOwnerLoggedIn") !== "true") {

    window.location.replace("index.html");

}


// ========================================
// GET HTML ELEMENTS
// ========================================

const shopForm = document.getElementById("shopForm");

const shopIdPreview = document.getElementById("shopIdPreview");

const message = document.getElementById("message");

const successModal = document.getElementById("successModal");

const generatedShopId = document.getElementById("generatedShopId");


// ========================================
// GET EXISTING FOOD SHOPS
// ========================================

function getFoodShops() {

    return JSON.parse(localStorage.getItem("foodShops")) || [];

}


// ========================================
// GENERATE UNIQUE SHOP ID
// ========================================

// The counter is stored separately so deleted IDs
// will never be reused.

function generateShopId() {

    let counter = Number(localStorage.getItem("shopIdCounter")) || 0;

    const shops = getFoodShops();

    let shopId;

    do {

        counter++;

        shopId = "MALL" + String(counter).padStart(3, "0");

    } while (shops.some(shop => shop.shopId === shopId));


    localStorage.setItem("shopIdCounter", counter);

    return shopId;

}


// ========================================
// DISPLAY NEXT SHOP ID PREVIEW
// ========================================

function updateShopIdPreview() {

    const counter = Number(localStorage.getItem("shopIdCounter")) || 0;

    const nextId = "MALL" + String(counter + 1).padStart(3, "0");

    shopIdPreview.textContent = nextId;

}

updateShopIdPreview();


// ========================================
// REGISTER NEW FOOD SHOP
// ========================================

shopForm.addEventListener("submit", function(event) {

    event.preventDefault();

    message.textContent = "";


    // GET FORM VALUES

    const shopName = document.getElementById("shopName").value.trim();

    const ownerName = document.getElementById("ownerName").value.trim();

    const email = document.getElementById("email").value.trim().toLowerCase();

    const phone = document.getElementById("phone").value.trim();

    const description = document.getElementById("description").value.trim();


    // ====================================
    // VALIDATION
    // ====================================

    if (!shopName || !ownerName || !email || !phone || !description) {

        message.textContent = "Please fill in all required fields.";

        return;

    }


    if (!/^[6-9]\d{9}$/.test(phone)) {

        message.textContent = "Please enter a valid 10-digit Indian mobile number.";

        return;

    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        message.textContent = "Please enter a valid email address.";

        return;

    }


    // ====================================
    // CHECK DUPLICATE EMAIL
    // ====================================

    const shops = getFoodShops();

    const emailExists = shops.some(shop => shop.email === email);

    if (emailExists) {

        message.textContent = "This email address is already registered.";

        return;

    }


    // ====================================
    // GENERATE SHOP ID
    // ====================================

    const shopId = generateShopId();


    // ====================================
    // CREATE SHOP OBJECT
    // ====================================

    const newShop = {

        shopId: shopId,

        shopName: shopName,

        ownerName: ownerName,

        email: email,

        phone: phone,

        description: description,

        registrationDate: new Date().toLocaleDateString("en-IN"),

        status: "Active",

        registered: false

    };


    // ====================================
    // SAVE SHOP DATA
    // ====================================

    shops.push(newShop);

    localStorage.setItem("foodShops", JSON.stringify(shops));


    // ====================================
    // SHOW SUCCESS MODAL
    // ====================================

    generatedShopId.textContent = shopId;

    successModal.classList.add("show");


    // ====================================
    // RESET FORM
    // ====================================

    shopForm.reset();

    updateShopIdPreview();

});


// ========================================
// CLEAR FORM
// ========================================

document.getElementById("cancelButton").addEventListener("click", function() {

    message.textContent = "";

    updateShopIdPreview();

});


// ========================================
// GO TO DASHBOARD
// ========================================

document.getElementById("doneButton").addEventListener("click", function() {

    window.location.href = "dashboard.html";

});


// ========================================
// LOGOUT
// ========================================

document.getElementById("logoutButton").addEventListener("click", function() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        localStorage.removeItem("mallOwnerLoggedIn");

        localStorage.removeItem("mallOwnerEmail");

        window.location.replace("index.html");

    }

});