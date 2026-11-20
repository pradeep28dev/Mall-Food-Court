// ===================================
// MALL OWNER AUTHENTICATION CHECK
// ===================================

const isLoggedIn = localStorage.getItem("mallOwnerLoggedIn");

if (isLoggedIn !== "true") {
    window.location.replace("index.html");
}


// ===================================
// DISPLAY CURRENT DATE
// ===================================

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
});


// ===================================
// LOAD FOOD SHOP DATA
// ===================================

// Retrieve registered shops from LocalStorage

function getFoodShops() {

    return JSON.parse(localStorage.getItem("foodShops")) || [];

}


// ===================================
// UPDATE DASHBOARD STATISTICS
// ===================================

function updateStatistics() {

    const shops = getFoodShops();

    const total = shops.length;

    const active = shops.filter(shop => shop.status === "Active").length;

    const inactive = shops.filter(shop => shop.status === "Inactive").length;

    const owners = shops.filter(shop => shop.registered === true).length;


    document.getElementById("totalShops").textContent = total;

    document.getElementById("activeShops").textContent = active;

    document.getElementById("inactiveShops").textContent = inactive;

    document.getElementById("totalOwners").textContent = owners;

}


// ===================================
// RECENTLY ADDED FOOD SHOPS
// ===================================

function displayRecentShops() {

    const shops = getFoodShops();

    const tableBody = document.getElementById("recentShopsTable");

    tableBody.innerHTML = "";


    if (shops.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    No food shops registered yet.
                </td>
            </tr>
        `;

        return;

    }


    // Display latest five shops

    const recentShops = [...shops].reverse().slice(0, 5);


    recentShops.forEach(shop => {

        const row = document.createElement("tr");

        const statusClass = shop.status === "Active" ? "active" : "inactive";


        const values = [
            shop.shopName,
            shop.shopId,
            shop.ownerName,
            shop.registrationDate,
            shop.status
        ];


        values.forEach((value, index) => {

            const cell = document.createElement("td");

            if (index === 4) {

                const badge = document.createElement("span");

                badge.className = `status ${statusClass}`;

                badge.textContent = value;

                cell.appendChild(badge);

            } else {

                cell.textContent = value || "-";

            }

            row.appendChild(cell);

        });


        tableBody.appendChild(row);

    });

}


// ===================================
// LOGOUT
// ===================================

document.getElementById("logoutButton").addEventListener("click", function () {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        localStorage.removeItem("mallOwnerLoggedIn");

        localStorage.removeItem("mallOwnerEmail");

        window.location.replace("index.html");

    }

});


// ===================================
// INITIALIZE DASHBOARD
// ===================================

updateStatistics();

displayRecentShops();