// ==========================================
// MALL OWNER AUTHENTICATION
// ==========================================

if (localStorage.getItem("mallOwnerLoggedIn") !== "true") {
    window.location.replace("index.html");
}


// ==========================================
// GET FOOD SHOPS FROM LOCAL STORAGE
// ==========================================

function getFoodShops() {
    try {
        return JSON.parse(localStorage.getItem("foodShops")) || [];
    } catch (error) {
        return [];
    }
}


// ==========================================
// SAVE FOOD SHOPS
// ==========================================

function saveFoodShops(shops) {
    localStorage.setItem("foodShops", JSON.stringify(shops));
}


// ==========================================
// HTML ELEMENTS
// ==========================================

const shopsTableBody = document.getElementById("shopsTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const emptyState = document.getElementById("emptyState");


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const shops = getFoodShops();

    const active = shops.filter(shop => shop.status === "Active").length;

    const inactive = shops.filter(shop => shop.status === "Inactive").length;

    document.getElementById("totalShops").textContent = shops.length;

    document.getElementById("activeShops").textContent = active;

    document.getElementById("inactiveShops").textContent = inactive;

}


// ==========================================
// CREATE TABLE CELL
// ==========================================

function createCell(text, className = "") {

    const cell = document.createElement("td");

    cell.textContent = text || "-";

    if (className) {
        cell.className = className;
    }

    return cell;

}


// ==========================================
// CREATE ACTION BUTTON
// ==========================================

function createActionButton(text, className, action, shopId) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.className = `action-btn ${className}`;

    button.dataset.action = action;
    button.dataset.id = shopId;

    return button;

}


// ==========================================
// DISPLAY FOOD SHOPS
// ==========================================

function displayShops() {

    const shops = getFoodShops();

    const searchValue = searchInput.value.trim().toLowerCase();

    const selectedStatus = statusFilter.value;


    // SEARCH AND FILTER

    const filteredShops = shops.filter(shop => {

        const matchesSearch =
            (shop.shopName || "").toLowerCase().includes(searchValue) ||
            (shop.shopId || "").toLowerCase().includes(searchValue) ||
            (shop.ownerName || "").toLowerCase().includes(searchValue);

        const matchesStatus =
            selectedStatus === "All" || shop.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });


    // CLEAR TABLE

    shopsTableBody.replaceChildren();


    // UPDATE COUNT

    document.getElementById("shopCount").textContent =
        `${filteredShops.length} Shops`;


    // EMPTY STATE

    if (filteredShops.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    // CREATE TABLE ROWS

    filteredShops.forEach(shop => {

        const row = document.createElement("tr");


        // SHOP NAME

        const nameCell = document.createElement("td");

        const name = document.createElement("div");

        name.className = "shop-name";
        name.textContent = shop.shopName || "Unnamed Shop";


        const description = document.createElement("div");

        description.className = "shop-description";
        description.textContent = shop.description || "No description";


        nameCell.append(name, description);


        // SHOP ID

        const idCell = createCell(shop.shopId, "shop-id");


        // OWNER NAME

        const ownerCell = createCell(shop.ownerName);


        // CONTACT

        const contactCell = createCell(shop.phone);


        // REGISTRATION DATE

        const dateCell = createCell(shop.registrationDate);


        // OWNER REGISTRATION STATUS

        const registrationCell = document.createElement("td");

        const registrationBadge = document.createElement("span");

        registrationBadge.className = shop.registered
            ? "registration-badge registered"
            : "registration-badge not-registered";

        registrationBadge.textContent = shop.registered
            ? "Registered"
            : "Not Registered";

        registrationCell.appendChild(registrationBadge);


        // ACTIVE / INACTIVE STATUS

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className = shop.status === "Active"
            ? "status-badge status-active"
            : "status-badge status-inactive";

        statusBadge.textContent = shop.status || "Inactive";

        statusCell.appendChild(statusBadge);


        // ACTION BUTTONS

        const actionCell = document.createElement("td");

        const actions = document.createElement("div");

        actions.className = "actions";


        const viewButton = createActionButton(
            "View", "view-btn", "view", shop.shopId
        );

        const editButton = createActionButton(
            "Edit", "edit-btn", "edit", shop.shopId
        );

        const toggleButton = createActionButton(
            shop.status === "Active" ? "Disable" : "Activate",
            "toggle-btn",
            "toggle",
            shop.shopId
        );

        const copyButton = createActionButton(
            "Copy ID", "copy-btn", "copy", shop.shopId
        );

        const deleteButton = createActionButton(
            "Delete", "delete-btn", "delete", shop.shopId
        );


        actions.append(
            viewButton,
            editButton,
            toggleButton,
            copyButton,
            deleteButton
        );

        actionCell.appendChild(actions);


        // ADD CELLS TO ROW

        row.append(
            nameCell,
            idCell,
            ownerCell,
            contactCell,
            dateCell,
            registrationCell,
            statusCell,
            actionCell
        );

        shopsTableBody.appendChild(row);

    });


    updateStatistics();

}


// ==========================================
// FIND SHOP USING SHOP ID
// ==========================================

function findShop(shopId) {

    return getFoodShops().find(shop => shop.shopId === shopId);

}


// ==========================================
// VIEW SHOP DETAILS
// ==========================================

function viewShop(shopId) {

    const shop = findShop(shopId);

    if (!shop) return;


    // Match the individual IDs in shops.html

    document.getElementById("viewShopName").textContent =
        shop.shopName || "-";

    document.getElementById("viewShopId").textContent =
        shop.shopId || "-";

    document.getElementById("viewOwnerName").textContent =
        shop.ownerName || "-";

    document.getElementById("viewEmail").textContent =
        shop.email || "-";

    document.getElementById("viewPhone").textContent =
        shop.phone || "-";

    document.getElementById("viewDate").textContent =
        shop.registrationDate || "-";

    document.getElementById("viewRegistration").textContent =
        shop.registered ? "Registered" : "Not Registered";

    document.getElementById("viewStatus").textContent =
        shop.status || "-";

    document.getElementById("viewDescription").textContent =
        shop.description || "No description provided";


    document.getElementById("viewModal").classList.add("show");

}


// ==========================================
// EDIT SHOP
// ==========================================

function editShop(shopId) {

    const shop = findShop(shopId);

    if (!shop) return;


    document.getElementById("editShopId").value = shop.shopId;

    document.getElementById("editShopName").value = shop.shopName || "";

    document.getElementById("editOwnerName").value = shop.ownerName || "";

    document.getElementById("editEmail").value = shop.email || "";

    document.getElementById("editPhone").value = shop.phone || "";

    document.getElementById("editDescription").value =
        shop.description || "";


    document.getElementById("editMessage").textContent = "";

    document.getElementById("editModal").classList.add("show");

}


// ==========================================
// SAVE EDITED SHOP
// ==========================================

document.getElementById("editShopForm").addEventListener("submit", function(event) {

    event.preventDefault();


    const shopId = document.getElementById("editShopId").value;

    const shops = getFoodShops();

    const shopIndex = shops.findIndex(shop => shop.shopId === shopId);

    const editMessage = document.getElementById("editMessage");


    if (shopIndex === -1) {

        editMessage.textContent = "Shop not found.";

        return;

    }


    // GET UPDATED VALUES

    const shopName = document.getElementById("editShopName").value.trim();

    const ownerName = document.getElementById("editOwnerName").value.trim();

    const email = document.getElementById("editEmail").value.trim().toLowerCase();

    const phone = document.getElementById("editPhone").value.trim();

    const description = document.getElementById("editDescription").value.trim();


    // VALIDATION

    if (!shopName || !ownerName || !email || !phone) {

        editMessage.textContent = "Please fill in all required fields.";

        return;

    }


    if (!/^[6-9]\d{9}$/.test(phone)) {

        editMessage.textContent = "Enter a valid 10-digit mobile number.";

        return;

    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        editMessage.textContent = "Enter a valid email address.";

        return;

    }


    // DUPLICATE EMAIL CHECK

    const duplicateEmail = shops.some(shop =>
        shop.email &&
        shop.email.toLowerCase() === email &&
        shop.shopId !== shopId
    );


    if (duplicateEmail) {

        editMessage.textContent =
            "Another shop is already using this email address.";

        return;

    }


    // UPDATE SHOP

    shops[shopIndex].shopName = shopName;
    shops[shopIndex].ownerName = ownerName;
    shops[shopIndex].email = email;
    shops[shopIndex].phone = phone;
    shops[shopIndex].description = description;


    saveFoodShops(shops);


    document.getElementById("editModal").classList.remove("show");


    displayShops();

    alert("Food shop information updated successfully!");

});


// ==========================================
// ACTIVATE / DEACTIVATE SHOP
// ==========================================

function toggleShop(shopId) {

    const shops = getFoodShops();

    const shop = shops.find(item => item.shopId === shopId);

    if (!shop) return;


    if (shop.status === "Active") {

        const confirmation = confirm(
            `Are you sure you want to deactivate ${shop.shopName}?`
        );

        if (!confirmation) return;

        shop.status = "Inactive";

    } else {

        const confirmation = confirm(
            `Are you sure you want to activate ${shop.shopName}?`
        );

        if (!confirmation) return;

        shop.status = "Active";

    }


    saveFoodShops(shops);

    displayShops();

}


// ==========================================
// DELETE SHOP
// ==========================================

function deleteShop(shopId) {

    const shops = getFoodShops();

    const shop = shops.find(item => item.shopId === shopId);

    if (!shop) return;


    const confirmation = confirm(
        `Are you sure you want to permanently delete ${shop.shopName} (${shop.shopId})?`
    );

    if (!confirmation) return;


    const updatedShops = shops.filter(item => item.shopId !== shopId);

    saveFoodShops(updatedShops);

    displayShops();

    alert("Food shop deleted successfully!");

}


// ==========================================
// COPY SHOP ID
// ==========================================

async function copyShopId(shopId) {

    try {

        if (!navigator.clipboard || !window.isSecureContext) {
            throw new Error("Clipboard unavailable");
        }

        await navigator.clipboard.writeText(shopId);

        alert(`Shop ID ${shopId} copied successfully!`);

    } catch (error) {

        // FALLBACK COPY METHOD

        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = shopId;

        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";

        document.body.appendChild(temporaryInput);

        temporaryInput.select();

        const copied = document.execCommand("copy");

        temporaryInput.remove();


        if (copied) {

            alert(`Shop ID ${shopId} copied successfully!`);

        } else {

            alert(`Please copy this Shop ID manually: ${shopId}`);

        }

    }

}


// ==========================================
// HANDLE TABLE BUTTON CLICKS
// ==========================================

shopsTableBody.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;


    const action = button.dataset.action;

    const shopId = button.dataset.id;


    if (action === "view") {

        viewShop(shopId);

    }

    else if (action === "edit") {

        editShop(shopId);

    }

    else if (action === "toggle") {

        toggleShop(shopId);

    }

    else if (action === "delete") {

        deleteShop(shopId);

    }

    else if (action === "copy") {

        copyShopId(shopId);

    }

});


// ==========================================
// SEARCH AND FILTER EVENTS
// ==========================================

searchInput.addEventListener("input", displayShops);

statusFilter.addEventListener("change", displayShops);


// ==========================================
// CLOSE VIEW MODAL
// ==========================================

document.getElementById("closeViewModal").addEventListener("click", function() {

    document.getElementById("viewModal").classList.remove("show");

});

document.getElementById("viewDoneButton").addEventListener("click", function() {

    document.getElementById("viewModal").classList.remove("show");

});


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

document.getElementById("closeEditModal").addEventListener("click", function() {

    document.getElementById("editModal").classList.remove("show");

});

document.getElementById("cancelEditButton").addEventListener("click", function() {

    document.getElementById("editModal").classList.remove("show");

});


// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==========================================

document.querySelectorAll(".modal").forEach(modal => {

    modal.addEventListener("click", function(event) {

        if (event.target === modal) {

            modal.classList.remove("show");

        }

    });

});


// ==========================================
// LOGOUT
// ==========================================

document.getElementById("logoutButton").addEventListener("click", function() {

    const confirmation = confirm("Are you sure you want to logout?");

    if (!confirmation) return;


    localStorage.removeItem("mallOwnerLoggedIn");

    localStorage.removeItem("mallOwnerEmail");


    window.location.replace("index.html");

});


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

displayShops();