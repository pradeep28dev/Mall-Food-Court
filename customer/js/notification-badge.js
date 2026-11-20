// =====================================
// CUSTOMER NOTIFICATION BADGE
// =====================================

function updateNotificationBadge() {

    const customerEmail = localStorage.getItem("customerEmail");

    if (!customerEmail) return;

    const customers = JSON.parse(
        localStorage.getItem("customers") || "[]"
    );

    const currentCustomer = customers.find(
        customer => customer.email === customerEmail
    );

    if (!currentCustomer) return;

    const notificationKey =
        `customerNotifications_${currentCustomer.customerId}`;

    const notifications = JSON.parse(
        localStorage.getItem(notificationKey) || "[]"
    );

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    const badges = document.querySelectorAll(".notification-badge");

    badges.forEach(badge => {

        badge.textContent = unreadCount;

        badge.style.display =
            unreadCount > 0 ? "inline-flex" : "none";

    });
}


// Initial update
updateNotificationBadge();


// Automatically update every second
setInterval(updateNotificationBadge, 1000);


// Update when LocalStorage changes in another tab
window.addEventListener("storage", updateNotificationBadge);