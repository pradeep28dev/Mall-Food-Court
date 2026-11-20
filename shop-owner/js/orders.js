// ============================================
// SHOP OWNER AUTHENTICATION
// ============================================

const isLoggedIn = localStorage.getItem("shopOwnerLoggedIn");

if (isLoggedIn !== "true") {
    window.location.replace("index.html");
}


// ============================================
// GET CURRENT SHOP OWNER
// ============================================

const loggedInEmail = localStorage.getItem("shopOwnerEmail");
const loggedInShopId = localStorage.getItem("shopOwnerShopId");

const shopOwners = JSON.parse(
    localStorage.getItem("shopOwners") || "[]"
);

let foodShops = JSON.parse(
    localStorage.getItem("foodShops") || "[]"
);

const currentOwner = shopOwners.find(function (owner) {
    return owner.email === loggedInEmail &&
           owner.shopId === loggedInShopId;
});

const currentShop = foodShops.find(function (shop) {
    return shop.shopId === loggedInShopId;
});


if (!currentOwner || !currentShop || currentShop.status !== "Active") {

    localStorage.removeItem("shopOwnerLoggedIn");
    localStorage.removeItem("shopOwnerEmail");
    localStorage.removeItem("shopOwnerShopId");

    window.location.replace("index.html");

}


// ============================================
// DISPLAY OWNER INFORMATION
// ============================================

const ownerName = currentOwner.ownerName || "Shop Owner";

const initial = ownerName.charAt(0).toUpperCase();

document.getElementById("sidebarOwnerName").textContent = ownerName;

document.getElementById("ownerInitial").textContent = initial;

document.getElementById("headerInitial").textContent = initial;

document.getElementById("headerShopId").textContent = currentShop.shopId;

// ============================================
// CUSTOMER NOTIFICATIONS
// ============================================

function sendCustomerNotification(order, status, reason = "") {

    // Customer ID is required to identify the recipient.
    if (!order.customerId) {
        console.warn(
            "Notification not created: customerId missing for order",
            getOrderId(order)
        );
        return;
    }

    const notificationKey =
        `customerNotifications_${order.customerId}`;

    const notifications = JSON.parse(
        localStorage.getItem(notificationKey) || "[]"
    );

    const notification = {
        id: "NOTIF" + Date.now() + Math.random().toString(16).slice(2),
        customerId: order.customerId,
        orderId: getOrderId(order),
        shopId: order.shopId,
        shopName: order.shopName || currentShop.shopName,
        status: status,
        reason: reason,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.push(notification);

    localStorage.setItem(
        notificationKey,
        JSON.stringify(notifications)
    );

}

// ============================================
// ORDER STORAGE
// ============================================

// All customer orders are stored in one shared array.
// Each order must contain a shopId.
//
// The Shop Owner can only access orders belonging
// to their own Shop ID.

function getAllOrders() {

    return JSON.parse(
        localStorage.getItem("foodOrders") || "[]"
    );

}


function saveAllOrders(orders) {

    localStorage.setItem(
        "foodOrders",
        JSON.stringify(orders)
    );

}


function getShopOrders() {

    return getAllOrders().filter(function (order) {

        return order.shopId === loggedInShopId;

    });

}


// ============================================
// HTML ELEMENTS
// ============================================

const ordersTableBody = document.getElementById("ordersTableBody");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const sortFilter = document.getElementById("sortFilter");

const orderModal = document.getElementById("orderModal");

const rejectModal = document.getElementById("rejectModal");


// ============================================
// HELPER FUNCTIONS
// ============================================

function formatPrice(price) {

    return "₹" + Number(price || 0).toFixed(2);

}


function getOrderId(order) {

    return order.orderId || order.id || "ORDER";


}


function getCustomerName(order) {

    return order.customerName ||
           order.customer?.name ||
           "Customer";


}


function getCustomerPhone(order) {

    return order.customerPhone ||
           order.customer?.phone ||
           "Not provided";


}


function getOrderItems(order) {

    return Array.isArray(order.items) ? order.items : [];

}


function getItemSummary(order) {

    return getOrderItems(order).map(function (item) {

        const quantity = Number(item.quantity || 1);

        return (item.name || item.foodName || "Food Item") +
               " × " + quantity;

    }).join(", ");

}


function getOrderTotal(order) {

    if (Number.isFinite(Number(order.totalAmount))) {
        return Number(order.totalAmount);
    }

    if (Number.isFinite(Number(order.total))) {
        return Number(order.total);
    }

    return getOrderItems(order).reduce(function (sum, item) {

        return sum +
            Number(item.price || 0) *
            Number(item.quantity || 1);

    }, 0);

}


function getOrderDate(order) {

    const date = new Date(order.createdAt || order.orderDate || Date.now());

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });

}


function getStatus(order) {

    return order.status || "Placed";

}


function getStatusClass(status) {

    const classes = {

        Placed: "status-placed",
        Accepted: "status-accepted",
        Preparing: "status-preparing",
        Ready: "status-ready",
        Completed: "status-completed",
        Rejected: "status-rejected"

    };

    return classes[status] || "status-placed";

}


// ============================================
// UPDATE SUMMARY CARDS
// ============================================

function updateSummary() {

    const orders = getShopOrders();

    document.getElementById("totalOrders").textContent = orders.length;

    document.getElementById("newOrders").textContent =
        orders.filter(function (order) {
            return getStatus(order) === "Placed";
        }).length;

    document.getElementById("preparingOrders").textContent =
        orders.filter(function (order) {
            return getStatus(order) === "Preparing";
        }).length;

    document.getElementById("readyOrders").textContent =
        orders.filter(function (order) {
            return getStatus(order) === "Ready";
        }).length;

}


// ============================================
// ORDER PREPARATION QUEUE
// ============================================

// Only Accepted and Preparing orders appear in the queue.
// They are sorted by the time they were created.

function renderQueue() {

    const queueList = document.getElementById("queueList");

    const queueEmpty = document.getElementById("queueEmpty");

    queueList.replaceChildren();


    const queueOrders = getShopOrders()
        .filter(function (order) {

            return ["Accepted", "Preparing"].includes(getStatus(order));

        })
        .sort(function (a, b) {

            return new Date(a.createdAt || a.orderDate || 0) -
                   new Date(b.createdAt || b.orderDate || 0);

        });


    document.getElementById("queueCount").textContent =
        queueOrders.length;


    if (queueOrders.length === 0) {

        queueEmpty.style.display = "block";

        return;

    }

    queueEmpty.style.display = "none";


    queueOrders.forEach(function (order, index) {

        const item = document.createElement("div");

        item.className = "queue-item";


        const left = document.createElement("div");

        left.className = "queue-left";


        const number = document.createElement("div");

        number.className = "queue-number";

        number.textContent = index + 1;


        const info = document.createElement("div");

        info.className = "queue-info";


        const title = document.createElement("h4");

        title.textContent = getOrderId(order);


        const description = document.createElement("p");

        description.textContent =
            getCustomerName(order) + " · " +
            (getItemSummary(order) || "No items") +
            " · " + getOrderDate(order);


        info.appendChild(title);

        info.appendChild(description);


        left.appendChild(number);

        left.appendChild(info);


        const right = document.createElement("div");

        right.className = "queue-right";


        const status = document.createElement("span");

        status.className = "queue-status";

        status.textContent = getStatus(order);


        right.appendChild(status);


        item.appendChild(left);

        item.appendChild(right);

        queueList.appendChild(item);

    });

}


// ============================================
// RENDER ORDERS TABLE
// ============================================

function renderOrders() {

    ordersTableBody.replaceChildren();


    let orders = getShopOrders();


    const searchValue = searchInput.value.trim().toLowerCase();

    const selectedStatus = statusFilter.value;

    const sortOrder = sortFilter.value;


    // SEARCH

    orders = orders.filter(function (order) {

        const orderId = getOrderId(order).toLowerCase();

        const customer = getCustomerName(order).toLowerCase();

        const phone = getCustomerPhone(order).toLowerCase();

        return orderId.includes(searchValue) ||
               customer.includes(searchValue) ||
               phone.includes(searchValue);

    });


    // STATUS FILTER

    if (selectedStatus !== "all") {

        orders = orders.filter(function (order) {

            return getStatus(order) === selectedStatus;

        });

    }


    // SORT

    orders.sort(function (a, b) {

        const dateA = new Date(a.createdAt || a.orderDate || 0);

        const dateB = new Date(b.createdAt || b.orderDate || 0);

        return sortOrder === "oldest"
            ? dateA - dateB
            : dateB - dateA;

    });


    document.getElementById("orderCount").textContent =
        orders.length + (orders.length === 1 ? " order" : " orders");


    if (orders.length === 0) {

        document.querySelector(".table-container").style.display = "none";

        document.getElementById("emptyState").style.display = "block";

        return;

    }


    document.querySelector(".table-container").style.display = "block";

    document.getElementById("emptyState").style.display = "none";


    orders.forEach(function (order) {

        const row = document.createElement("tr");


        // ORDER ID

        const orderIdCell = document.createElement("td");

        orderIdCell.className = "order-id";

        orderIdCell.textContent = getOrderId(order);


        // CUSTOMER

        const customerCell = document.createElement("td");

        customerCell.className = "customer-name";

        customerCell.textContent = getCustomerName(order);


        // ITEMS

        const itemsCell = document.createElement("td");

        itemsCell.className = "item-summary";

        itemsCell.textContent = getItemSummary(order) || "No items";


        // AMOUNT

        const amountCell = document.createElement("td");

        amountCell.className = "amount";

        amountCell.textContent = formatPrice(getOrderTotal(order));


        // TIME

        const timeCell = document.createElement("td");

        timeCell.textContent = getOrderDate(order);


        // STATUS

        const statusCell = document.createElement("td");

        const badge = document.createElement("span");

        badge.className =
            "status-badge " + getStatusClass(getStatus(order));

        badge.textContent = getStatus(order);

        statusCell.appendChild(badge);


        // ACTIONS

        const actionCell = document.createElement("td");

        const actions = document.createElement("div");

        actions.className = "action-group";


        // VIEW

        const viewButton = document.createElement("button");

        viewButton.className = "action-button view-button";

        viewButton.textContent = "View";

        viewButton.addEventListener("click", function () {

            openOrderDetails(getOrderId(order));

        });

        actions.appendChild(viewButton);


        // STATUS ACTIONS

        const currentStatus = getStatus(order);


        if (currentStatus === "Placed") {

            const acceptButton = createActionButton(
                "Accept",
                "accept-button",
                function () {
                    updateOrderStatus(getOrderId(order), "Accepted");
                }
            );

            const rejectButton = createActionButton(
                "Reject",
                "reject-button",
                function () {
                    openRejectModal(getOrderId(order));
                }
            );

            actions.appendChild(acceptButton);

            actions.appendChild(rejectButton);

        }


        if (currentStatus === "Accepted") {

            actions.appendChild(createActionButton(
                "Start",
                "prepare-button",
                function () {
                    updateOrderStatus(getOrderId(order), "Preparing");
                }
            ));

        }


        if (currentStatus === "Preparing") {

            actions.appendChild(createActionButton(
                "Mark Ready",
                "ready-button",
                function () {
                    updateOrderStatus(getOrderId(order), "Ready");
                }
            ));

        }


        if (currentStatus === "Ready") {

            actions.appendChild(createActionButton(
                "Complete",
                "complete-button",
                function () {
                    updateOrderStatus(getOrderId(order), "Completed");
                }
            ));

        }


        actionCell.appendChild(actions);


        row.appendChild(orderIdCell);

        row.appendChild(customerCell);

        row.appendChild(itemsCell);

        row.appendChild(amountCell);

        row.appendChild(timeCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);


        ordersTableBody.appendChild(row);

    });

}


// ============================================
// CREATE ACTION BUTTON
// ============================================

function createActionButton(text, className, callback) {

    const button = document.createElement("button");

    button.className = "action-button " + className;

    button.textContent = text;

    button.addEventListener("click", callback);

    return button;

}


// ============================================
// UPDATE ORDER STATUS
// ============================================

function updateOrderStatus(orderId, newStatus) {

    const orders = getAllOrders();

    const orderIndex = orders.findIndex(function (order) {

        return getOrderId(order) === orderId &&
               order.shopId === loggedInShopId;

    });


    if (orderIndex === -1) return;


    const order = orders[orderIndex];

    const currentStatus = getStatus(order);


    // Validate allowed transitions

    const allowedTransitions = {

        Placed: ["Accepted", "Rejected"],

        Accepted: ["Preparing"],

        Preparing: ["Ready"],

        Ready: ["Completed"],

        Completed: [],

        Rejected: []

    };


    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {

        alert("This status change is not allowed.");

        return;

    }


    order.status = newStatus;

    order.updatedAt = new Date().toISOString();


    if (newStatus === "Accepted") {

        order.acceptedAt = new Date().toISOString();

    }

    if (newStatus === "Preparing") {

        order.preparingAt = new Date().toISOString();

    }

    if (newStatus === "Ready") {

        order.readyAt = new Date().toISOString();

    }

    if (newStatus === "Completed") {

        order.completedAt = new Date().toISOString();

    }


    // Save updated order
saveAllOrders(orders);

// Send notification to customer
sendCustomerNotification(order, newStatus);

// Refresh Shop Owner interface
renderEverything();


}


// ============================================
// ORDER DETAILS MODAL
// ============================================

function openOrderDetails(orderId) {

    const order = getShopOrders().find(function (item) {

        return getOrderId(item) === orderId;

    });


    if (!order) return;


    document.getElementById("modalOrderId").textContent = getOrderId(order);

    document.getElementById("detailCustomer").textContent =
        getCustomerName(order);

    document.getElementById("detailPhone").textContent =
        getCustomerPhone(order);

    document.getElementById("detailTime").textContent =
        getOrderDate(order);

    document.getElementById("detailStatus").textContent =
        getStatus(order);


    const detailItems = document.getElementById("detailItems");

    detailItems.replaceChildren();


    getOrderItems(order).forEach(function (item) {

        const itemRow = document.createElement("div");

        itemRow.className = "detail-item";


        const itemName = document.createElement("span");

        itemName.textContent =
            (item.name || item.foodName || "Food Item") +
            " × " + Number(item.quantity || 1);


        const itemPrice = document.createElement("strong");

        itemPrice.textContent = formatPrice(
            Number(item.price || 0) * Number(item.quantity || 1)
        );


        itemRow.appendChild(itemName);

        itemRow.appendChild(itemPrice);

        detailItems.appendChild(itemRow);

    });


    document.getElementById("detailTotal").textContent =
        formatPrice(getOrderTotal(order));


    openModal(orderModal);

}


// ============================================
// REJECT ORDER
// ============================================

let rejectingOrderId = null;


function openRejectModal(orderId) {

    rejectingOrderId = orderId;

    document.getElementById("rejectReason").value = "";

    document.getElementById("rejectError").textContent = "";

    openModal(rejectModal);

}


document.getElementById("confirmRejectButton").addEventListener(
    "click",
    function () {

        const reason = document.getElementById("rejectReason")
            .value.trim();

        if (!reason) {

            document.getElementById("rejectError").textContent =
                "Please enter a reason for rejecting this order.";

            return;

        }


        const orders = getAllOrders();

        const order = orders.find(function (item) {

            return getOrderId(item) === rejectingOrderId &&
                   item.shopId === loggedInShopId;

        });


        if (!order || getStatus(order) !== "Placed") {

            closeModal(rejectModal);

            return;

        }


       order.status = "Rejected";

order.rejectionReason = reason;

order.updatedAt = new Date().toISOString();

// Notify customer about rejection
sendCustomerNotification(order, "Rejected", reason);

// Save updated orders
saveAllOrders(orders);


        rejectingOrderId = null;

        closeModal(rejectModal);

        renderEverything();

    }
);


document.getElementById("cancelRejectButton").addEventListener(
    "click",
    function () {

        rejectingOrderId = null;

        closeModal(rejectModal);

    }
);


// ============================================
// MODAL HELPERS
// ============================================

function openModal(modal) {

    modal.classList.add("show");

}


function closeModal(modal) {

    modal.classList.remove("show");

}


document.getElementById("closeOrderModal").addEventListener(
    "click",
    function () {
        closeModal(orderModal);
    }
);


document.getElementById("closeDetailsButton").addEventListener(
    "click",
    function () {
        closeModal(orderModal);
    }
);


[orderModal, rejectModal].forEach(function (modal) {

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            closeModal(modal);
        }

    });

});


// ============================================
// SEARCH AND FILTER
// ============================================

searchInput.addEventListener("input", renderOrders);

statusFilter.addEventListener("change", renderOrders);

sortFilter.addEventListener("change", renderOrders);


// ============================================
// REFRESH
// ============================================

document.getElementById("refreshButton").addEventListener(
    "click",
    function () {

        renderEverything();

    }
);


// ============================================
// UPDATE EVERYTHING
// ============================================

function renderEverything() {

    updateSummary();

    renderQueue();

    renderOrders();

}


// ============================================
// LOGOUT
// ============================================

document.getElementById("logoutButton").addEventListener(
    "click",
    function () {

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (confirmLogout) {

            localStorage.removeItem("shopOwnerLoggedIn");

            localStorage.removeItem("shopOwnerEmail");

            localStorage.removeItem("shopOwnerShopId");

            window.location.replace("index.html");

        }

    }
);


// ============================================
// INITIAL PAGE LOAD
// ============================================

renderEverything();