// =====================================
// CUSTOMER AUTHENTICATION
// =====================================

const customerEmail = localStorage.getItem("customerEmail");

if (
    localStorage.getItem("customerLoggedIn") !== "true" ||
    !customerEmail
) {
    window.location.href = "index.html";
}

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

const notificationStorageKey =
    `customerNotifications_${currentCustomer.customerId}`;


// =====================================
// DOM ELEMENTS
// =====================================

const notificationsList =
    document.getElementById("notificationsList");

const emptyState =
    document.getElementById("emptyState");

const notificationFilter =
    document.getElementById("notificationFilter");

const totalNotifications =
    document.getElementById("totalNotifications");

const unreadNotifications =
    document.getElementById("unreadNotifications");

const readNotifications =
    document.getElementById("readNotifications");

const navNotificationCount =
    document.getElementById("navNotificationCount");

const markAllReadButton =
    document.getElementById("markAllReadButton");

const toast = document.getElementById("toast");


// =====================================
// LOAD NOTIFICATIONS
// =====================================

function getNotifications() {
    return JSON.parse(
        localStorage.getItem(notificationStorageKey) || "[]"
    );
}


// =====================================
// SAVE NOTIFICATIONS
// =====================================

function saveNotifications(notifications) {
    localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(notifications)
    );
}


// =====================================
// NOTIFICATION DETAILS
// =====================================

function getNotificationDetails(notification) {
    const status = notification.status || "";

    const details = {
        Accepted: {
            icon: "✓",
            iconClass: "icon-accepted",
            title: "Order Accepted!",
            message: "The shop has accepted your order and will start preparing it soon."
        },

        Preparing: {
            icon: "🍳",
            iconClass: "icon-preparing",
            title: "Your Food Is Being Prepared!",
            message: "The shop is preparing your delicious food."
        },

        Ready: {
            icon: "🎉",
            iconClass: "icon-ready",
            title: "Your Order Is Ready!",
            message: "Your food is ready. Please collect your order."
        },

        Rejected: {
            icon: "✕",
            iconClass: "icon-rejected",
            title: "Order Rejected",
            message: notification.reason
                ? `Reason: ${notification.reason}`
                : "Unfortunately, the shop could not accept your order."
        },

        Completed: {
            icon: "✓",
            iconClass: "icon-completed",
            title: "Order Completed!",
            message: "Your order has been completed. Thank you for ordering!"
        }
    };

    return details[status] || {
        icon: "🔔",
        iconClass: "icon-accepted",
        title: notification.title || "Order Update",
        message: notification.message || "There is an update to your order."
    };
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateValue) {
    if (!dateValue) return "Just now";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// =====================================
// SHOW TOAST
// =====================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics(notifications) {
    const total = notifications.length;

    const unread = notifications.filter(
        notification => !notification.read
    ).length;

    const read = total - unread;

    totalNotifications.textContent = total;
    unreadNotifications.textContent = unread;
    readNotifications.textContent = read;

    navNotificationCount.textContent = unread;

    navNotificationCount.style.display =
        unread > 0 ? "inline-flex" : "none";
}


// =====================================
// RENDER NOTIFICATIONS
// =====================================

function renderNotifications() {
    const notifications = getNotifications();

    updateStatistics(notifications);

    const filter = notificationFilter.value;

    let filteredNotifications = notifications.filter(notification => {
        if (filter === "unread") return !notification.read;
        if (filter === "read") return notification.read;

        return true;
    });

    filteredNotifications.sort((a, b) => {
        return new Date(b.createdAt || 0) -
               new Date(a.createdAt || 0);
    });

    notificationsList.innerHTML = "";

    if (filteredNotifications.length === 0) {
        emptyState.style.display = "block";
        notificationsList.style.display = "none";

        return;
    }

    emptyState.style.display = "none";
    notificationsList.style.display = "block";

    filteredNotifications.forEach(notification => {
        const details = getNotificationDetails(notification);

        const item = document.createElement("div");

        item.className =
            `notification-item ${notification.read ? "" : "unread"}`;

        item.innerHTML = `
            <div class="notification-icon ${details.iconClass}">
                ${details.icon}
            </div>

            <div class="notification-content">
                <h3>${escapeHTML(details.title)}</h3>

                <p>${escapeHTML(details.message)}</p>

                <div class="notification-meta">
                    <span>Order: ${escapeHTML(notification.orderId || "N/A")}</span>

                    <span>${formatDate(notification.createdAt)}</span>

                    ${
                        !notification.read
                            ? '<span class="unread-label">● Unread</span>'
                            : ""
                    }
                </div>
            </div>

            <div class="notification-actions">
                ${
                    !notification.read
                        ? `<button class="notification-action"
                            data-action="read"
                            data-id="${escapeHTML(notification.id)}">
                            Mark read
                           </button>`
                        : ""
                }

                <button class="notification-action"
                    data-action="delete"
                    data-id="${escapeHTML(notification.id)}">
                    Delete
                </button>
            </div>
        `;

        notificationsList.appendChild(item);
    });
}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// =====================================
// MARK ONE AS READ / DELETE
// =====================================

notificationsList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const notificationId = button.dataset.id;

    let notifications = getNotifications();

    if (action === "read") {
        notifications = notifications.map(notification => {
            if (String(notification.id) === notificationId) {
                return {
                    ...notification,
                    read: true
                };
            }

            return notification;
        });

        saveNotifications(notifications);
        renderNotifications();

        showToast("Notification marked as read.");
    }

    if (action === "delete") {
        notifications = notifications.filter(
            notification =>
                String(notification.id) !== notificationId
        );

        saveNotifications(notifications);
        renderNotifications();

        showToast("Notification deleted.");
    }
});


// =====================================
// MARK ALL AS READ
// =====================================

markAllReadButton.addEventListener("click", () => {
    let notifications = getNotifications();

    notifications = notifications.map(notification => ({
        ...notification,
        read: true
    }));

    saveNotifications(notifications);
    renderNotifications();

    showToast("All notifications marked as read.");
});


// =====================================
// FILTER
// =====================================

notificationFilter.addEventListener("change", renderNotifications);


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";
});


// =====================================
// LIVE REFRESH
// =====================================

window.addEventListener("storage", event => {
    if (event.key === notificationStorageKey) {
        renderNotifications();
    }
});

setInterval(renderNotifications, 5000);


// =====================================
// INITIALIZE
// =====================================

renderNotifications();