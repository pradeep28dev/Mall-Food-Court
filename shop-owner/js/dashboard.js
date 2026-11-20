// ===================================
// SHOP OWNER AUTHENTICATION
// ===================================

const isLoggedIn = localStorage.getItem("shopOwnerLoggedIn");
const ownerEmail = localStorage.getItem("shopOwnerEmail");
const shopId = localStorage.getItem("shopOwnerShopId");

if (isLoggedIn !== "true" || !ownerEmail || !shopId) {
    window.location.replace("index.html");
}


// ===================================
// LOAD SHOP OWNER DATA
// ===================================

const shopOwners = JSON.parse(
    localStorage.getItem("shopOwners") || "[]"
);

const foodShops = JSON.parse(
    localStorage.getItem("foodShops") || "[]"
);

const foodOrders = JSON.parse(
    localStorage.getItem("foodOrders") || "[]"
);

const currentOwner = shopOwners.find(owner =>
    owner.email === ownerEmail &&
    owner.shopId === shopId
);

const currentShop = foodShops.find(shop =>
    shop.shopId === shopId
);


// ===================================
// VERIFY ACCOUNT AND SHOP
// ===================================

if (!currentOwner || !currentShop || currentShop.status !== "Active") {

    localStorage.removeItem("shopOwnerLoggedIn");
    localStorage.removeItem("shopOwnerEmail");
    localStorage.removeItem("shopOwnerShopId");

    window.location.replace("index.html");

}


// ===================================
// GET SHOP SETTINGS
// ===================================

const shopSettings = JSON.parse(
    localStorage.getItem(`shopSettings_${shopId}`) || "{}"
);


// ===================================
// FILTER CURRENT SHOP ORDERS
// ===================================

const shopOrders = foodOrders.filter(order =>
    order.shopId === shopId
);


// ===================================
// DATE HELPERS
// ===================================

function isToday(dateValue) {

    if (!dateValue) return false;

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return false;

    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );

}


function formatTime(dateValue) {

    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });

}


// ===================================
// DISPLAY CURRENT DATE
// ===================================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// ===================================
// DISPLAY SHOP INFORMATION
// ===================================

document.getElementById("welcomeOwnerName").textContent =
    currentOwner.ownerName || currentShop.ownerName || "Owner";

document.getElementById("shopName").textContent =
    currentShop.shopName;

document.getElementById("shopId").textContent =
    currentShop.shopId;

document.getElementById("profileAvatar").textContent =
    (currentOwner.ownerName || "S").charAt(0).toUpperCase();


// ===================================
// SHOP AVAILABILITY
// ===================================

function updateShopAvailability() {

    const statusBadge = document.getElementById("shopStatusBadge");
    const statusDescription =
        document.getElementById("shopStatusDescription");

    if (shopSettings.acceptOrders === false) {

        statusBadge.className = "status-badge inactive";

        statusBadge.innerHTML =
            '<i class="fas fa-circle"></i> Not Accepting Orders';

        statusDescription.textContent =
            "Your shop is currently not accepting new orders.";

    } else {

        statusBadge.className = "status-badge active";

        statusBadge.innerHTML =
            '<i class="fas fa-circle"></i> Accepting Orders';

        statusDescription.textContent =
            "Your shop is currently accepting orders.";

    }

}

updateShopAvailability();


// ===================================
// TODAY'S STATISTICS
// ===================================

function updateStatistics() {

    const todayOrders = shopOrders.filter(order =>
        isToday(order.createdAt || order.orderDate)
    );

    const pendingOrders = todayOrders.filter(order =>
        ["Placed", "Accepted", "Preparing"].includes(
            order.status || "Placed"
        )
    );

    const completedOrders = todayOrders.filter(order =>
        order.status === "Completed"
    );

    const todayRevenue = completedOrders.reduce(
        (total, order) => {

            const amount = Number(
                order.totalAmount ?? order.total ?? 0
            );

            return total + (Number.isFinite(amount) ? amount : 0);

        },
        0
    );


    document.getElementById("todayOrders").textContent =
        todayOrders.length;

    document.getElementById("pendingOrders").textContent =
        pendingOrders.length;

    document.getElementById("completedOrders").textContent =
        completedOrders.length;

    document.getElementById("todayRevenue").textContent =
        "₹" + todayRevenue.toLocaleString("en-IN");

}

updateStatistics();


// ===================================
// LIVE ORDER QUEUE
// ===================================

function updateQueue() {

    const accepted = shopOrders.filter(order =>
        order.status === "Accepted"
    );

    const preparing = shopOrders.filter(order =>
        order.status === "Preparing"
    );

    const ready = shopOrders.filter(order =>
        order.status === "Ready"
    );


    document.getElementById("acceptedCount").textContent =
        accepted.length;

    document.getElementById("preparingCount").textContent =
        preparing.length;

    document.getElementById("readyCount").textContent =
        ready.length;

}

updateQueue();


// ===================================
// STATUS CLASS
// ===================================

function getStatusClass(status) {

    const classes = {
        "Placed": "status-placed",
        "Accepted": "status-accepted",
        "Preparing": "status-preparing",
        "Ready": "status-ready",
        "Completed": "status-completed",
        "Rejected": "status-rejected"
    };

    return classes[status] || "status-placed";

}


// ===================================
// RECENT ORDERS
// ===================================

function displayRecentOrders() {

    const tableBody =
        document.getElementById("recentOrdersBody");

    const emptyState =
        document.getElementById("emptyOrders");

    tableBody.innerHTML = "";

    const recentOrders = [...shopOrders]
        .sort((a, b) => {

            const dateA = new Date(
                a.createdAt || a.orderDate || 0
            ).getTime();

            const dateB = new Date(
                b.createdAt || b.orderDate || 0
            ).getTime();

            return dateB - dateA;

        })
        .slice(0, 5);


    if (recentOrders.length === 0) {

        emptyState.style.display = "block";
        return;

    }

    emptyState.style.display = "none";


    recentOrders.forEach(order => {

        const row = document.createElement("tr");

        const orderId = order.orderId || order.id || "N/A";

        const customerName =
            order.customerName ||
            order.customer?.name ||
            "Customer";

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const itemCount = items.reduce(
            (total, item) =>
                total + Number(item.quantity || 1),
            0
        );

        const amount = Number(
            order.totalAmount ?? order.total ?? 0
        );

        const status = order.status || "Placed";

        const time = formatTime(
            order.createdAt || order.orderDate
        );


        const idCell = document.createElement("td");
        idCell.className = "order-id";
        idCell.textContent = orderId;

        const customerCell = document.createElement("td");
        customerCell.textContent = customerName;

        const itemsCell = document.createElement("td");
        itemsCell.textContent = `${itemCount} item(s)`;

        const amountCell = document.createElement("td");
        amountCell.className = "order-amount";
        amountCell.textContent =
            "₹" + (Number.isFinite(amount) ? amount : 0);

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");
        statusBadge.className =
            `status-pill ${getStatusClass(status)}`;

        statusBadge.textContent = status;

        statusCell.appendChild(statusBadge);

        const timeCell = document.createElement("td");
        timeCell.textContent = time;


        row.append(
            idCell,
            customerCell,
            itemsCell,
            amountCell,
            statusCell,
            timeCell
        );

        tableBody.appendChild(row);

    });

}

displayRecentOrders();


// ===================================
// LOGOUT
// ===================================

document.getElementById("logoutButton").addEventListener(
    "click",
    function() {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        localStorage.removeItem("shopOwnerLoggedIn");
        localStorage.removeItem("shopOwnerEmail");
        localStorage.removeItem("shopOwnerShopId");

        window.location.replace("index.html");

    }
);