// ===================================
// SHOP OWNER AUTHENTICATION
// ===================================

const isLoggedIn = localStorage.getItem("shopOwnerLoggedIn");
const ownerEmail = localStorage.getItem("shopOwnerEmail");
const shopId = localStorage.getItem("shopOwnerShopId");

if (isLoggedIn !== "true" || !ownerEmail || !shopId) {
    window.location.replace("index.html");
}

const shopOwners = JSON.parse(localStorage.getItem("shopOwners")) || [];
const foodShops = JSON.parse(localStorage.getItem("foodShops")) || [];

const currentOwner = shopOwners.find(owner =>
    owner.email === ownerEmail &&
    owner.shopId === shopId
);

const currentShop = foodShops.find(shop =>
    shop.shopId === shopId
);

if (!currentOwner || !currentShop || currentShop.status !== "Active") {

    localStorage.removeItem("shopOwnerLoggedIn");
    localStorage.removeItem("shopOwnerEmail");
    localStorage.removeItem("shopOwnerShopId");

    window.location.replace("index.html");
}


// ===================================
// ELEMENT REFERENCES
// ===================================

const shopInformationForm =
    document.getElementById("shopInformationForm");

const operatingHoursForm =
    document.getElementById("operatingHoursForm");

const orderPreferencesForm =
    document.getElementById("orderPreferencesForm");

const saveNotificationsButton =
    document.getElementById("saveNotificationsButton");

const toast = document.getElementById("toast");


// ===================================
// SETTINGS STORAGE KEY
// ===================================

const settingsKey = `shopSettings_${shopId}`;

let shopSettings = JSON.parse(
    localStorage.getItem(settingsKey)
) || {};


// ===================================
// DEFAULT SETTINGS
// ===================================

const defaultSettings = {

    phone: currentShop.phone || "",
    description: currentShop.description || "",

    openingTime: "09:00",
    closingTime: "22:00",

    preparationTime: 20,

    acceptOrders: true,

    newOrderNotifications: true,
    statusNotifications: true

};


// Fill missing settings with defaults
shopSettings = {
    ...defaultSettings,
    ...shopSettings
};


// ===================================
// SAVE SETTINGS TO LOCAL STORAGE
// ===================================

function saveSettings() {

    localStorage.setItem(
        settingsKey,
        JSON.stringify(shopSettings)
    );

}


// ===================================
// DISPLAY TOAST MESSAGE
// ===================================

let toastTimer;

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


// ===================================
// LOAD SHOP INFORMATION
// ===================================

function loadShopInformation() {

    document.getElementById("headerShopName").textContent =
        currentShop.shopName;

    document.getElementById("shopName").value =
        currentShop.shopName;

    document.getElementById("shopId").value =
        currentShop.shopId;

    document.getElementById("ownerName").value =
        currentShop.ownerName;

    document.getElementById("shopEmail").value =
        currentShop.email;

    document.getElementById("shopPhone").value =
        shopSettings.phone;

    document.getElementById("shopDescription").value =
        shopSettings.description;

    document.getElementById("accountEmail").textContent =
        currentOwner.email;

    document.getElementById("accountShopId").textContent =
        currentOwner.shopId;

}


// ===================================
// LOAD OPERATING HOURS
// ===================================

function loadOperatingHours() {

    document.getElementById("openingTime").value =
        shopSettings.openingTime;

    document.getElementById("closingTime").value =
        shopSettings.closingTime;

}


// ===================================
// LOAD ORDER PREFERENCES
// ===================================

function loadOrderPreferences() {

    document.getElementById("preparationTime").value =
        shopSettings.preparationTime;

    document.getElementById("acceptOrders").checked =
        shopSettings.acceptOrders;

}


// ===================================
// LOAD NOTIFICATION PREFERENCES
// ===================================

function loadNotificationPreferences() {

    document.getElementById("newOrderNotifications").checked =
        shopSettings.newOrderNotifications;

    document.getElementById("statusNotifications").checked =
        shopSettings.statusNotifications;

}


// ===================================
// SAVE SHOP INFORMATION
// ===================================

shopInformationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const phone = document.getElementById("shopPhone").value.trim();

    const description =
        document.getElementById("shopDescription").value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {

        showToast("Please enter a valid 10-digit mobile number.");
        return;

    }

    shopSettings.phone = phone;
    shopSettings.description = description;

    saveSettings();

    showToast("Shop information saved successfully!");

});


// ===================================
// SAVE OPERATING HOURS
// ===================================

operatingHoursForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const openingTime =
        document.getElementById("openingTime").value;

    const closingTime =
        document.getElementById("closingTime").value;

    if (!openingTime || !closingTime) {

        showToast("Please select both operating times.");
        return;

    }

    if (openingTime >= closingTime) {

        showToast("Closing time must be later than opening time.");
        return;

    }

    shopSettings.openingTime = openingTime;
    shopSettings.closingTime = closingTime;

    saveSettings();

    showToast("Operating hours updated successfully!");

});


// ===================================
// SAVE ORDER PREFERENCES
// ===================================

orderPreferencesForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const preparationTime = Number(
        document.getElementById("preparationTime").value
    );

    const acceptOrders =
        document.getElementById("acceptOrders").checked;

    if (
        !Number.isInteger(preparationTime) ||
        preparationTime < 1 ||
        preparationTime > 180
    ) {

        showToast("Preparation time must be between 1 and 180 minutes.");
        return;

    }

    shopSettings.preparationTime = preparationTime;
    shopSettings.acceptOrders = acceptOrders;

    saveSettings();

    showToast("Order preferences saved successfully!");

});


// ===================================
// SAVE NOTIFICATION PREFERENCES
// ===================================

saveNotificationsButton.addEventListener("click", function() {

    shopSettings.newOrderNotifications =
        document.getElementById("newOrderNotifications").checked;

    shopSettings.statusNotifications =
        document.getElementById("statusNotifications").checked;

    saveSettings();

    showToast("Notification preferences saved!");

});


// ===================================
// LOGOUT
// ===================================

document.getElementById("logoutButton").addEventListener("click", function() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
        return;
    }

    localStorage.removeItem("shopOwnerLoggedIn");
    localStorage.removeItem("shopOwnerEmail");
    localStorage.removeItem("shopOwnerShopId");

    window.location.replace("index.html");

});


// ===================================
// INITIALIZE SETTINGS PAGE
// ===================================

loadShopInformation();
loadOperatingHours();
loadOrderPreferences();
loadNotificationPreferences();

saveSettings();