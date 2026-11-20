// ==========================================
// MALL OWNER AUTHENTICATION
// ==========================================

if (localStorage.getItem("mallOwnerLoggedIn") !== "true") {

    window.location.replace("index.html");

}


// ==========================================
// DISPLAY CURRENT DATE
// ==========================================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// ==========================================
// LOAD ADMIN EMAIL
// ==========================================

const adminEmail = localStorage.getItem("mallOwnerEmail") || "";

document.getElementById("adminEmail").value = adminEmail;

document.getElementById("accountEmail").textContent =
    adminEmail || "Not available";


// ==========================================
// MALL INFORMATION
// ==========================================

const mallForm = document.getElementById("mallForm");

const mallFields = [
    "mallName",
    "mallEmail",
    "mallPhone",
    "mallLocation"
];


// Load saved mall information

function loadMallInformation() {

    const mallData = JSON.parse(
        localStorage.getItem("mallInformation") || "{}"
    );

    mallFields.forEach(field => {

        document.getElementById(field).value = mallData[field] || "";

    });

}

loadMallInformation();


// Save mall information

mallForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const phone = document.getElementById("mallPhone").value.trim();

    const message = document.getElementById("mallMessage");

    if (!/^[6-9]\d{9}$/.test(phone)) {

        message.style.color = "#dc2626";

        message.textContent =
            "Please enter a valid 10-digit Indian mobile number.";

        return;

    }


    const mallData = {};

    mallFields.forEach(field => {

        mallData[field] =
            document.getElementById(field).value.trim();

    });


    localStorage.setItem(
        "mallInformation",
        JSON.stringify(mallData)
    );


    message.style.color = "#159653";

    message.textContent =
        "Mall information saved successfully!";

});


// ==========================================
// ADMIN PROFILE
// ==========================================

const profileForm = document.getElementById("profileForm");


// Load profile information

const savedProfile = JSON.parse(
    localStorage.getItem("mallAdminProfile") || "{}"
);

document.getElementById("adminName").value =
    savedProfile.adminName || "Administrator";


// Save profile

profileForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const adminName =
        document.getElementById("adminName").value.trim();

    const message =
        document.getElementById("profileMessage");


    if (!adminName) {

        message.style.color = "#dc2626";

        message.textContent = "Please enter your name.";

        return;

    }


    localStorage.setItem(
        "mallAdminProfile",
        JSON.stringify({
            adminName: adminName
        })
    );


    message.style.color = "#159653";

    message.textContent =
        "Administrator profile updated successfully!";


});


// ==========================================
// NOTIFICATION PREFERENCES
// ==========================================

const notificationIds = [
    "shopNotifications",
    "statusNotifications",
    "systemNotifications"
];


// Load notification settings

function loadNotificationSettings() {

    const preferences = JSON.parse(
        localStorage.getItem("mallNotificationPreferences") || "{}"
    );

    notificationIds.forEach(id => {

        const checkbox = document.getElementById(id);

        checkbox.checked = preferences[id] ?? true;

    });

}

loadNotificationSettings();


// Save notification settings

document.getElementById("saveNotifications").addEventListener(
    "click",
    function() {

        const preferences = {};

        notificationIds.forEach(id => {

            preferences[id] =
                document.getElementById(id).checked;

        });


        localStorage.setItem(
            "mallNotificationPreferences",
            JSON.stringify(preferences)
        );


        const message =
            document.getElementById("notificationMessage");

        message.style.color = "#159653";

        message.textContent =
            "Notification preferences saved successfully!";

    }
);


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    const confirmation = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmation) return;


    localStorage.removeItem("mallOwnerLoggedIn");

    localStorage.removeItem("mallOwnerEmail");


    window.location.replace("index.html");

}


document.getElementById("logoutButton").addEventListener(
    "click",
    logout
);

document.getElementById("mobileLogoutButton").addEventListener(
    "click",
    logout
);