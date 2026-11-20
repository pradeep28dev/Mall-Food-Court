// ==========================================
// CUSTOMER ORDERS PAGE
// ==========================================


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

const customerEmail = localStorage.getItem("customerEmail");

if (
    localStorage.getItem("customerLoggedIn") !== "true" ||
    !customerEmail
) {
    window.location.href = "index.html";
}


// ==========================================
// GET CURRENT CUSTOMER
// ==========================================

const customers = JSON.parse(
    localStorage.getItem("customers") || "[]"
);

const currentCustomer = customers.find(
    customer => customer.email === customerEmail
);

if (!currentCustomer) {

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const ordersContainer = document.getElementById("ordersContainer");

const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const sortFilter = document.getElementById("sortFilter");

const totalOrdersElement = document.getElementById("totalOrders");

const activeOrdersElement = document.getElementById("activeOrders");

const readyOrdersElement = document.getElementById("readyOrders");

const completedOrdersElement = document.getElementById("completedOrders");

const orderCountText = document.getElementById("orderCountText");

const orderModal = document.getElementById("orderModal");

const modalOrderId = document.getElementById("modalOrderId");

const modalContent = document.getElementById("modalContent");

const closeModal = document.getElementById("closeModal");

const closeModalButton = document.getElementById("closeModalButton");

const cartCount = document.getElementById("cartCount");

const logoutButton = document.getElementById("logoutButton");

const toast = document.getElementById("toast");


// ==========================================
// CART COUNT
// ==========================================

const cartStorageKey = "cart_" + currentCustomer.customerId;

function updateCartCount() {

    const cart = JSON.parse(
        localStorage.getItem(cartStorageKey) || "[]"
    );

    const count = cart.reduce((total, item) => {

        return total + Number(item.quantity || 0);

    }, 0);

    cartCount.textContent = count;

}


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


function formatCurrency(amount) {

    return "₹" + Number(amount || 0).toFixed(2);

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

function getCustomerOrders() {

    const allOrders = JSON.parse(
        localStorage.getItem("foodOrders") || "[]"
    );

    return allOrders.filter(order => {

        return (
            String(order.customerId) ===
            String(currentCustomer.customerId)
        );

    });

}


// ==========================================
// ORDER STATUS INFORMATION
// ==========================================

const orderStatuses = [
    "Placed",
    "Accepted",
    "Preparing",
    "Ready",
    "Completed"
];


function getStatusClass(status) {

    const classes = {
        Placed: "status-placed",
        Accepted: "status-accepted",
        Preparing: "status-preparing",
        Ready: "status-ready",
        Completed: "status-completed",
        Rejected: "status-rejected",
        Cancelled: "status-cancelled"
    };

    return classes[status] || "status-placed";

}


// ==========================================
// ORDER TRACKING
// ==========================================

function createTrackingHTML(status) {

    if (status === "Rejected") {

        return `
            <div class="rejection-message">
                ❌ This order was rejected by the food shop.
                Please check the order details for more information.
            </div>
        `;

    }

    if (status === "Cancelled") {

        return `
            <div class="cancellation-message">
                <strong>✕ Order Cancelled</strong>
                <p>You cancelled this order before the shop accepted it.</p>
            </div>
        `;

    }

    const currentIndex = orderStatuses.indexOf(status);

    return `

        <div class="tracking-section">

            <div class="tracking-heading">
                Order Progress
            </div>

            <div class="tracking-steps">

                ${orderStatuses.map((step, index) => {

                    const done = index <= currentIndex;

                    const current = index === currentIndex;

                    return `

                        <div class="
                            tracking-step
                            ${done ? "done" : ""}
                            ${current ? "current" : ""}
                        ">

                            <div class="step-circle">
                                ${done ? "✓" : index + 1}
                            </div>

                            <span class="step-label">
                                ${step}
                            </span>

                        </div>

                    `;

                }).join("")}

            </div>

        </div>

    `;

}


// ==========================================
// ORDER ITEMS HTML
// ==========================================

function createOrderItemsHTML(items) {

    if (!Array.isArray(items) || items.length === 0) {

        return `
            <div class="order-items">
                <p>No item details available.</p>
            </div>
        `;

    }

    return `

        <div class="order-items">

            ${items.map(item => `

                <div class="order-item-row">

                    <span>
                        ${escapeHTML(item.name)}
                        × ${Number(item.quantity || 1)}
                    </span>

                    <strong>
                        ${formatCurrency(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                        )}
                    </strong>

                </div>

            `).join("")}

        </div>

    `;

}


// ==========================================
// RENDER ORDER CARD
// ==========================================

function createOrderCard(order) {

    const status = order.status || "Placed";

    const orderId = order.orderId || order.id || "N/A";

    const shopName = order.shopName || "Food Shop";

    const total = Number(
        order.totalAmount ?? order.total ?? 0
    );

    const items = Array.isArray(order.items) ? order.items : [];

    const itemCount = items.reduce((total, item) => {

        return total + Number(item.quantity || 1);

    }, 0);

    const orderCard = document.createElement("article");

    orderCard.className = "order-card";


    const rejectionReason =
        order.rejectionReason || order.rejectReason || "";


    orderCard.innerHTML = `

        <div class="order-header">

            <div class="order-shop">

                <div class="order-shop-icon">
                    🏪
                </div>

                <div>

                    <h3>${escapeHTML(shopName)}</h3>

                    <p>Order ID: ${escapeHTML(orderId)}</p>

                </div>

            </div>

            <span class="status-badge ${getStatusClass(status)}">
                ${escapeHTML(status)}
            </span>

        </div>


        <div class="order-info">

            <div>
                <span>Order Date</span>
                <strong>${formatDate(order.createdAt || order.orderDate)}</strong>
            </div>

            <div>
                <span>Total Items</span>
                <strong>${itemCount}</strong>
            </div>

            <div>
                <span>Payment Method</span>
                <strong>${escapeHTML(order.paymentMethod || "Not specified")}</strong>
            </div>

        </div>


        ${createOrderItemsHTML(items)}


        ${createTrackingHTML(status)}


        ${status === "Rejected" && rejectionReason ? `
            <div class="rejection-message">
                <strong>Reason:</strong>
                ${escapeHTML(rejectionReason)}
            </div>
        ` : ""}


        <div class="order-footer">

            <div class="order-total">
                Order Total
                <strong>${formatCurrency(total)}</strong>
            </div>

            <div class="order-actions">

                <button
                    class="view-details-button"
                    data-order-id="${escapeHTML(orderId)}"
                >
                    View Details
                </button>

                ${status === "Placed" ? `

                    <button
                        class="cancel-order-button"
                        data-order-id="${escapeHTML(orderId)}"
                    >
                        Cancel Order
                    </button>

                ` : ""}

            </div>

        </div>

    `;


    return orderCard;

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(orders) {

    const total = orders.length;

    const active = orders.filter(order => {

        return [
            "Placed",
            "Accepted",
            "Preparing"
        ].includes(order.status || "Placed");

    }).length;

    const ready = orders.filter(order => {

        return order.status === "Ready";

    }).length;

    const completed = orders.filter(order => {

        return order.status === "Completed";

    }).length;


    totalOrdersElement.textContent = total;

    activeOrdersElement.textContent = active;

    readyOrdersElement.textContent = ready;

    completedOrdersElement.textContent = completed;

}


// ==========================================
// RENDER ALL ORDERS
// ==========================================

function renderOrders() {

    const allOrders = getCustomerOrders();

    updateStatistics(allOrders);


    // SEARCH FILTER

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    let filteredOrders = allOrders.filter(order => {

        const orderId = String(
            order.orderId || order.id || ""
        ).toLowerCase();

        const shopName = String(
            order.shopName || ""
        ).toLowerCase();

        return (
            orderId.includes(searchTerm) ||
            shopName.includes(searchTerm)
        );

    });


    // STATUS FILTER

    const selectedStatus = statusFilter.value;

    if (selectedStatus !== "All") {

        filteredOrders = filteredOrders.filter(order => {

            return (order.status || "Placed") === selectedStatus;

        });

    }


    // SORT ORDERS

    filteredOrders.sort((a, b) => {

        const dateA = new Date(
            a.createdAt || a.orderDate || 0
        ).getTime();

        const dateB = new Date(
            b.createdAt || b.orderDate || 0
        ).getTime();

        if (sortFilter.value === "oldest") {

            return dateA - dateB;

        }

        return dateB - dateA;

    });


    // UPDATE COUNT

    orderCountText.textContent =
        `Showing ${filteredOrders.length} of ${allOrders.length} orders`;


    ordersContainer.innerHTML = "";


    // EMPTY STATE

    if (filteredOrders.length === 0) {

        emptyState.style.display = "block";

        if (allOrders.length > 0) {

            emptyState.querySelector("h2").textContent =
                "No Matching Orders";

            emptyState.querySelector("p").textContent =
                "Try changing your search or status filter.";

        } else {

            emptyState.querySelector("h2").textContent =
                "No Orders Found";

            emptyState.querySelector("p").textContent =
                "You haven't placed any orders yet. Explore food shops and order something delicious!";

        }

        return;

    }


    emptyState.style.display = "none";


    // DISPLAY ORDERS

    filteredOrders.forEach(order => {

        ordersContainer.appendChild(
            createOrderCard(order)
        );

    });

}


// ==========================================
// VIEW ORDER DETAILS
// ==========================================

function openOrderDetails(orderId) {

    const orders = getCustomerOrders();

    const order = orders.find(item => {

        return String(item.orderId || item.id) === String(orderId);

    });

    if (!order) {

        showToast("Order details could not be found.");

        return;

    }


    modalOrderId.textContent =
        order.orderId || order.id || "Order Details";

    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHTML = items.map(item => {

        return `
            <div class="order-item-row">

                <span>
                    ${escapeHTML(item.name)}
                    × ${Number(item.quantity || 1)}
                </span>

                <strong>
                    ${formatCurrency(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                    )}
                </strong>

            </div>
        `;

    }).join("");


    modalContent.innerHTML = `

        <div class="modal-section">

            <h3>Shop Information</h3>

            <p>
                <strong>Shop:</strong>
                ${escapeHTML(order.shopName || "Food Shop")}
            </p>

            <p>
                <strong>Shop ID:</strong>
                ${escapeHTML(order.shopId || "N/A")}
            </p>

        </div>


        <div class="modal-section">

            <h3>Customer Information</h3>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(order.customerName || currentCustomer.name)}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(order.customerEmail || currentCustomer.email)}
            </p>

            <p>
                <strong>Mobile:</strong>
                ${escapeHTML(order.customerPhone || currentCustomer.phone)}
            </p>

        </div>


        <div class="modal-section">

            <h3>Ordered Items</h3>

            ${itemsHTML || "<p>No item details available.</p>"}

        </div>


        <div class="modal-section">

            <h3>Payment Information</h3>

            <p>
                <strong>Method:</strong>
                ${escapeHTML(order.paymentMethod || "Not specified")}
            </p>

            <p>
                <strong>Payment Status:</strong>
                ${escapeHTML(order.paymentStatus || "Pending")}
            </p>

            <p>
                <strong>Total Amount:</strong>
                ${formatCurrency(order.totalAmount ?? order.total ?? 0)}
            </p>

        </div>


        <div class="modal-section">

            <h3>Order Information</h3>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(order.status || "Placed")}
            </p>

            <p>
                <strong>Order Date:</strong>
                ${formatDate(order.createdAt || order.orderDate)}
            </p>

            <p>
                <strong>Special Instructions:</strong>
                ${escapeHTML(order.specialInstructions || "None")}
            </p>

            ${order.rejectionReason || order.rejectReason ? `
                <p>
                    <strong>Rejection Reason:</strong>
                    ${escapeHTML(order.rejectionReason || order.rejectReason)}
                </p>
            ` : ""}

            ${order.status === "Cancelled" ? `
                <p>
                    <strong>Cancellation Date:</strong>
                    ${formatDate(order.cancelledAt)}
                </p>
            ` : ""}

        </div>

    `;


    orderModal.classList.add("show");

}


// ==========================================
// CUSTOMER ORDER CANCELLATION
// ==========================================

function cancelCustomerOrder(orderId) {

    const confirmCancel = confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;


    const allOrders = JSON.parse(
        localStorage.getItem("foodOrders") || "[]"
    );


    // Find customer's order

    const orderIndex = allOrders.findIndex(order => {

        return (
            String(order.orderId || order.id) === String(orderId) &&
            String(order.customerId) ===
            String(currentCustomer.customerId)
        );

    });


    if (orderIndex === -1) {

        showToast("Order could not be found.");

        return;

    }


    const order = allOrders[orderIndex];


    // Only Placed orders can be cancelled

    if (order.status !== "Placed") {

        showToast(
            "Sorry! This order can no longer be cancelled."
        );

        renderOrders();

        return;

    }


    // Update status

    order.status = "Cancelled";

    order.cancelledAt = new Date().toISOString();

    order.updatedAt = new Date().toISOString();


    // Save updated orders

    localStorage.setItem(
        "foodOrders",
        JSON.stringify(allOrders)
    );


    // ======================================
    // CUSTOMER CANCELLATION NOTIFICATION
    // ======================================

    const notificationKey =
        `customerNotifications_${currentCustomer.customerId}`;

    const notifications = JSON.parse(
        localStorage.getItem(notificationKey) || "[]"
    );


    notifications.push({

        id: "NOTIF" + Date.now(),

        customerId: currentCustomer.customerId,

        orderId: order.orderId || order.id,

        shopId: order.shopId,

        shopName: order.shopName || "Food Shop",

        status: "Cancelled",

        title: "Order Cancelled",

        message: "Your order has been successfully cancelled.",

        read: false,

        createdAt: new Date().toISOString()

    });


    localStorage.setItem(
        notificationKey,
        JSON.stringify(notifications)
    );


    showToast("Your order has been cancelled successfully.");

    renderOrders();

}


// ==========================================
// ORDER CARD CLICK EVENTS
// ==========================================

ordersContainer.addEventListener("click", function(event) {

    const viewButton = event.target.closest(".view-details-button");

    const cancelButton = event.target.closest(".cancel-order-button");


    if (viewButton) {

        openOrderDetails(viewButton.dataset.orderId);

        return;

    }


    if (cancelButton) {

        cancelCustomerOrder(cancelButton.dataset.orderId);

    }

});


// ==========================================
// CLOSE MODAL
// ==========================================

function closeOrderModal() {

    orderModal.classList.remove("show");

}

closeModal.addEventListener("click", closeOrderModal);

closeModalButton.addEventListener("click", closeOrderModal);

orderModal.addEventListener("click", function(event) {

    if (event.target === orderModal) {

        closeOrderModal();

    }

});

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeOrderModal();

    }

});


// ==========================================
// SEARCH AND FILTER EVENTS
// ==========================================

searchInput.addEventListener("input", renderOrders);

statusFilter.addEventListener("change", renderOrders);

sortFilter.addEventListener("change", renderOrders);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", function() {

    localStorage.removeItem("customerLoggedIn");

    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

});


// ==========================================
// AUTO REFRESH
// ==========================================

function refreshOrders() {

    updateCartCount();

    renderOrders();

}


window.addEventListener("storage", function(event) {

    if (
        event.key === "foodOrders" ||
        event.key === cartStorageKey
    ) {

        refreshOrders();

    }

});


// ==========================================
// INITIALIZE
// ==========================================

updateCartCount();

renderOrders();

setInterval(refreshOrders, 5000);