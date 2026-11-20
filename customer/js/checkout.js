// ==========================================
// CUSTOMER CHECKOUT
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const customerEmail = localStorage.getItem("customerEmail");

if (
    localStorage.getItem("customerLoggedIn") !== "true" ||
    !customerEmail
) {
    window.location.href = "index.html";
}


// ==========================================
// GET CUSTOMER
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
// CART
// ==========================================

const cartStorageKey = "cart_" + currentCustomer.customerId;

let cart = JSON.parse(
    localStorage.getItem(cartStorageKey) || "[]"
);


// ==========================================
// DOM ELEMENTS
// ==========================================

const checkoutForm = document.getElementById("checkoutForm");

const customerNameInput = document.getElementById("customerName");

const customerPhoneInput = document.getElementById("customerPhone");

const customerEmailInput = document.getElementById("customerEmail");

const instructionsInput = document.getElementById("specialInstructions");

const checkoutItems = document.getElementById("checkoutItems");

const totalItemsElement = document.getElementById("totalItems");

const subtotalElement = document.getElementById("subtotal");

const grandTotalElement = document.getElementById("grandTotal");

const placeOrderButton = document.getElementById("placeOrderButton");

const successModal = document.getElementById("successModal");

const generatedOrders = document.getElementById("generatedOrders");

const viewOrdersButton = document.getElementById("viewOrdersButton");

const logoutButton = document.getElementById("logoutButton");

const toast = document.getElementById("toast");


// ==========================================
// HELPERS
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

    return "₹" + Number(amount).toFixed(2);

}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}


function getTotalQuantity() {

    return cart.reduce((total, item) => {
        return total + Number(item.quantity || 0);
    }, 0);

}


function calculateSubtotal() {

    return cart.reduce((total, item) => {

        return total +
            Number(item.price) * Number(item.quantity);

    }, 0);

}


// ==========================================
// LOAD CUSTOMER DETAILS
// ==========================================

customerNameInput.value = currentCustomer.name || "";

customerPhoneInput.value = currentCustomer.phone || "";

customerEmailInput.value = currentCustomer.email || "";


// ==========================================
// VALIDATE CART
// ==========================================

function validateCart() {

    if (!Array.isArray(cart) || cart.length === 0) {
        return false;
    }

    return cart.every(item => {

        return (
            item &&
            item.itemId &&
            item.shopId &&
            item.name &&
            Number.isFinite(Number(item.price)) &&
            Number(item.price) >= 0 &&
            Number.isInteger(Number(item.quantity)) &&
            Number(item.quantity) > 0
        );

    });

}


// ==========================================
// GROUP CART ITEMS BY SHOP
// ==========================================

function groupCartByShop() {

    const groups = {};

    cart.forEach(item => {

        if (!groups[item.shopId]) {
            groups[item.shopId] = [];
        }

        groups[item.shopId].push(item);

    });

    return groups;

}


// ==========================================
// DISPLAY ORDER SUMMARY
// ==========================================

function renderCheckout() {

    if (!validateCart()) {

        placeOrderButton.disabled = true;

        checkoutItems.innerHTML = `
            <p class="empty-message">
                Your cart is empty or contains invalid items.
                <a href="home.html">Explore food shops</a>
            </p>
        `;

        totalItemsElement.textContent = "0";

        subtotalElement.textContent = "₹0.00";

        grandTotalElement.textContent = "₹0.00";

        return;

    }

    placeOrderButton.disabled = false;

    checkoutItems.innerHTML = "";

    const groups = groupCartByShop();

    Object.keys(groups).forEach(shopId => {

        const shopItems = groups[shopId];

        const shopName = shopItems[0].shopName || "Food Shop";

        const shopSection = document.createElement("div");

        shopSection.className = "summary-shop";

        let itemsHTML = `
            <h3>🏪 ${escapeHTML(shopName)}</h3>
        `;

        shopItems.forEach(item => {

            itemsHTML += `
                <div class="summary-item">

                    <span>
                        ${escapeHTML(item.name)}
                        × ${Number(item.quantity)}
                    </span>

                    <span>
                        ${formatCurrency(
                            Number(item.price) * Number(item.quantity)
                        )}
                    </span>

                </div>
            `;

        });

        shopSection.innerHTML = itemsHTML;

        checkoutItems.appendChild(shopSection);

    });

    totalItemsElement.textContent = getTotalQuantity();

    subtotalElement.textContent = formatCurrency(calculateSubtotal());

    grandTotalElement.textContent = formatCurrency(calculateSubtotal());

}


// ==========================================
// CHECK SHOP AND MENU AVAILABILITY
// ==========================================

function validateShopAvailability() {

    const foodShops = JSON.parse(
        localStorage.getItem("foodShops") || "[]"
    );

    const groups = groupCartByShop();

    for (const shopId of Object.keys(groups)) {

        const shop = foodShops.find(
            shop => shop.shopId === shopId
        );

        if (!shop || shop.status !== "Active" || shop.registered !== true) {

            return {
                valid: false,
                message: "A shop in your cart is no longer active."
            };

        }


        const settings = JSON.parse(
            localStorage.getItem("shopSettings_" + shopId) || "{}"
        );

        if (settings.acceptOrders === false) {

            return {
                valid: false,
                message: shop.shopName + " is currently not accepting orders."
            };

        }


        const menuData = JSON.parse(
            localStorage.getItem("shopMenu_" + shopId) || "{}"
        );

        const menuItems = Array.isArray(menuData.items)
            ? menuData.items
            : [];

        for (const cartItem of groups[shopId]) {

            const currentItem = menuItems.find(
                item => String(item.id) === String(cartItem.itemId)
            );

            if (!currentItem || currentItem.status !== "Available") {

                return {
                    valid: false,
                    message: cartItem.name + " is currently unavailable."
                };

            }

            if (
                Number(currentItem.price) !== Number(cartItem.price)
            ) {

                return {
                    valid: false,
                    message: cartItem.name + " has a changed price. Please update your cart."
                };

            }

        }

    }

    return {
        valid: true
    };

}


// ==========================================
// GENERATE ORDER ID
// ==========================================

function generateOrderId() {

    const counter = Number(
        localStorage.getItem("customerOrderCounter") || "1000"
    ) + 1;

    localStorage.setItem(
        "customerOrderCounter",
        String(counter)
    );

    return "ORD" + counter;

}


// ==========================================
// PLACE ORDERS
// ==========================================

checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!validateCart()) {

        showToast("Your cart is empty or invalid.");

        return;

    }


    // CUSTOMER VALIDATION

    const customerName = customerNameInput.value.trim();

    const customerPhone = customerPhoneInput.value.trim();

    const phonePattern = /^[6-9]\d{9}$/;

    if (customerName.length < 3) {

        showToast("Please enter a valid customer name.");

        customerNameInput.focus();

        return;

    }

    if (!phonePattern.test(customerPhone)) {

        showToast("Please enter a valid 10-digit mobile number.");

        customerPhoneInput.focus();

        return;

    }


    // SHOP VALIDATION

    const availability = validateShopAvailability();

    if (!availability.valid) {

        showToast(availability.message);

        return;

    }


    // PREVENT DOUBLE SUBMISSION

    placeOrderButton.disabled = true;

    placeOrderButton.textContent = "Placing Order...";


    try {

        const existingOrders = JSON.parse(
            localStorage.getItem("foodOrders") || "[]"
        );

        const groups = groupCartByShop();

        const createdOrders = [];

        const now = new Date().toISOString();

        const paymentMethod = document.querySelector(
            'input[name="paymentMethod"]:checked'
        ).value;

        const instructions = instructionsInput.value.trim();


        // CREATE ONE ORDER PER SHOP

        Object.keys(groups).forEach(shopId => {

            const shopItems = groups[shopId];

            const shopName = shopItems[0].shopName || "Food Shop";

            const orderTotal = shopItems.reduce((total, item) => {

                return total +
                    Number(item.price) * Number(item.quantity);

            }, 0);


            const order = {

                orderId: generateOrderId(),

                shopId: shopId,

                shopName: shopName,

                customerId: currentCustomer.customerId,

                customerName: customerName,

                customerEmail: currentCustomer.email,

                customerPhone: customerPhone,

                items: shopItems.map(item => ({

                    itemId: item.itemId,

                    name: item.name,

                    price: Number(item.price),

                    quantity: Number(item.quantity),

                    image: item.image || ""

                })),

                totalAmount: orderTotal,

                status: "Placed",

                paymentMethod: paymentMethod,

                paymentStatus: "Pending",

                specialInstructions: instructions,

                createdAt: now

            };


            existingOrders.push(order);

            createdOrders.push(order);

        });


        // SAVE ALL ORDERS

        localStorage.setItem(
            "foodOrders",
            JSON.stringify(existingOrders)
        );


        // CLEAR CUSTOMER CART

        cart = [];

        localStorage.removeItem(cartStorageKey);


        // DISPLAY SUCCESS

        generatedOrders.innerHTML = "";

        createdOrders.forEach(order => {

            const orderElement = document.createElement("div");

            orderElement.className = "generated-order";

            orderElement.innerHTML = `

                <strong>${escapeHTML(order.shopName)}</strong>

                <span>
                    Order ID: ${escapeHTML(order.orderId)}
                </span>

                <span>
                    Total: ${formatCurrency(order.totalAmount)}
                </span>

            `;

            generatedOrders.appendChild(orderElement);

        });


        successModal.classList.add("show");

        checkoutForm.reset();

    } catch (error) {

        console.error("Order creation error:", error);

        showToast("Unable to place order. Please try again.");

        placeOrderButton.disabled = false;

        placeOrderButton.textContent = "Place Order →";

    }

});


// ==========================================
// VIEW ORDERS
// ==========================================

viewOrdersButton.addEventListener("click", function() {

    window.location.href = "orders.html";

});


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", function() {

    localStorage.removeItem("customerLoggedIn");

    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

});


// ==========================================
// INITIALIZE
// ==========================================

renderCheckout();