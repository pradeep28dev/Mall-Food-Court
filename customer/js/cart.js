


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


// =====================================
// GET CURRENT CUSTOMER
// =====================================

let customers = JSON.parse(
    localStorage.getItem("customers") || "[]"
);

const currentCustomer = customers.find(customer =>
    customer.email.toLowerCase() === customerEmail.toLowerCase()
);

if (!currentCustomer) {

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

    throw new Error("Customer account not found.");
}


// =====================================
// CART STORAGE
// =====================================

const cartKey = `cart_${currentCustomer.customerId}`;

let cart = JSON.parse(
    localStorage.getItem(cartKey) || "[]"
);


// =====================================
// HTML ELEMENTS
// =====================================

const cartItemsContainer = document.getElementById("cartItems");

const emptyCart = document.getElementById("emptyCart");

const cartItemCount = document.getElementById("cartItemCount");

const summaryItemCount = document.getElementById("summaryItemCount");

const subtotalElement = document.getElementById("subtotal");

const platformFeeElement = document.getElementById("platformFee");

const grandTotalElement = document.getElementById("grandTotal");

const checkoutButton = document.getElementById("checkoutButton");

const checkoutModal = document.getElementById("checkoutModal");

const checkoutForm = document.getElementById("checkoutForm");

const checkoutTotal = document.getElementById("checkoutTotal");

const orderType = document.getElementById("orderType");

const tableGroup = document.getElementById("tableGroup");

const tableNumber = document.getElementById("tableNumber");

const toast = document.getElementById("toast");
const orderSuccessModal = document.getElementById("orderSuccessModal");

const successOrderId = document.getElementById("successOrderId");

const successShopName = document.getElementById("successShopName");

const successOrderAmount = document.getElementById("successOrderAmount");

let latestCreatedOrders = [];

// =====================================
// CONSTANTS
// =====================================

// Demonstration platform fee.
// This is a fixed fee, not a real payment charge.

const PLATFORM_FEE = 5;


// =====================================
// SAVE CART
// =====================================

function saveCart() {

    localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
    );

}


// =====================================
// FORMAT CURRENCY
// =====================================

function formatCurrency(amount) {

    return `₹${Number(amount).toFixed(2)}`;

}


// =====================================
// CALCULATE TOTALS
// =====================================

function calculateSubtotal() {

    return cart.reduce((total, item) => {

        return total +
            Number(item.price) * Number(item.quantity);

    }, 0);

}


function calculateItemCount() {

    return cart.reduce((total, item) => {

        return total + Number(item.quantity);

    }, 0);

}


function calculateGrandTotal() {

    return calculateSubtotal() + (cart.length > 0 ? PLATFORM_FEE : 0);

}


// =====================================
// DISPLAY CART
// =====================================

function displayCart() {

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {

        emptyCart.style.display = "block";

        cartItemsContainer.style.display = "none";

        checkoutButton.disabled = true;

        updateSummary();

        return;

    }


    emptyCart.style.display = "none";

    cartItemsContainer.style.display = "block";

    checkoutButton.disabled = false;


    cart.forEach((item, index) => {

        const cartItem = document.createElement("article");

        cartItem.className = "cart-item";


        // IMAGE

        const imageContainer = document.createElement("div");

        imageContainer.className = "cart-item-image";

        if (item.image) {

            const image = document.createElement("img");

            image.src = item.image;

            image.alt = item.name;

            image.onerror = () => {
                image.remove();
                imageContainer.textContent = "🍽️";
            };

            imageContainer.appendChild(image);

        } else {

            imageContainer.textContent = "🍽️";

        }


        // INFORMATION

        const information = document.createElement("div");

        information.className = "cart-item-info";


        const shopLabel = document.createElement("span");

        shopLabel.className = "shop-label";

        shopLabel.textContent = item.shopName || item.shopId;


        const name = document.createElement("h3");

        name.textContent = item.name;


        const price = document.createElement("p");

        price.className = "cart-item-price";

        price.textContent = formatCurrency(item.price);


        // QUANTITY CONTROLS

        const quantityControls = document.createElement("div");

        quantityControls.className = "quantity-controls";


        const decreaseButton = document.createElement("button");

        decreaseButton.type = "button";

        decreaseButton.textContent = "−";

        decreaseButton.addEventListener("click", () => {

            updateQuantity(index, -1);

        });


        const quantity = document.createElement("span");

        quantity.textContent = item.quantity;


        const increaseButton = document.createElement("button");

        increaseButton.type = "button";

        increaseButton.textContent = "+";

        increaseButton.addEventListener("click", () => {

            updateQuantity(index, 1);

        });


        quantityControls.append(
            decreaseButton,
            quantity,
            increaseButton
        );


        information.append(
            shopLabel,
            name,
            price,
            quantityControls
        );


        // ITEM TOTAL AND REMOVE

        const actions = document.createElement("div");

        actions.className = "cart-item-actions";


        const itemTotal = document.createElement("div");

        itemTotal.className = "item-total";

        itemTotal.textContent = formatCurrency(
            Number(item.price) * Number(item.quantity)
        );


        const removeButton = document.createElement("button");

        removeButton.type = "button";

        removeButton.className = "remove-btn";

        removeButton.innerHTML =
            '<i class="fas fa-trash"></i> Remove';

        removeButton.addEventListener("click", () => {

            removeItem(index);

        });


        actions.append(itemTotal, removeButton);


        cartItem.append(
            imageContainer,
            information,
            actions
        );


        cartItemsContainer.appendChild(cartItem);

    });


    updateSummary();

}


// =====================================
// UPDATE QUANTITY
// =====================================

function updateQuantity(index, change) {

    if (!cart[index]) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    saveCart();

    displayCart();

}


// =====================================
// REMOVE ITEM
// =====================================

function removeItem(index) {

    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart();

    displayCart();

    showToast("Item removed from your cart.");

}


// =====================================
// UPDATE SUMMARY
// =====================================

function updateSummary() {

    const count = calculateItemCount();

    const subtotal = calculateSubtotal();

    const fee = cart.length > 0 ? PLATFORM_FEE : 0;

    const total = subtotal + fee;


    cartItemCount.textContent =
        `${count} ${count === 1 ? "Item" : "Items"}`;

    summaryItemCount.textContent = count;

    subtotalElement.textContent = formatCurrency(subtotal);

    platformFeeElement.textContent = formatCurrency(fee);

    grandTotalElement.textContent = formatCurrency(total);

    checkoutTotal.textContent = formatCurrency(total);

}


// =====================================
// OPEN CHECKOUT
// =====================================

checkoutButton.addEventListener("click", () => {

    if (cart.length === 0) {

        showToast("Your cart is empty.");

        return;

    }


    document.getElementById("customerName").value =
        currentCustomer.name || "";

    document.getElementById("customerPhone").value =
        currentCustomer.phone || "";


    checkoutModal.classList.add("show");

    document.body.style.overflow = "hidden";

});


// =====================================
// CLOSE CHECKOUT
// =====================================

function closeCheckout() {

    checkoutModal.classList.remove("show");

    document.body.style.overflow = "";

}


document.getElementById("closeCheckoutModal")
    .addEventListener("click", closeCheckout);


checkoutModal.addEventListener("click", event => {

    if (event.target === checkoutModal) {

        closeCheckout();

    }

});


// =====================================
// ORDER TYPE
// =====================================

orderType.addEventListener("change", () => {

    if (orderType.value === "Dine-in") {

        tableGroup.style.display = "block";

        tableNumber.required = true;

    } else {

        tableGroup.style.display = "none";

        tableNumber.required = false;

        tableNumber.value = "";

    }

});


// =====================================
// RECHECK SHOP AND MENU AVAILABILITY
// =====================================

function validateCartBeforeOrder() {

    const shops = JSON.parse(
        localStorage.getItem("foodShops") || "[]"
    );

    const unavailableItems = [];

    for (const item of cart) {

        const shop = shops.find(shop =>
            shop.shopId === item.shopId
        );

        if (!shop || shop.status !== "Active") {

            unavailableItems.push(item.name);

            continue;

        }


        const settings = JSON.parse(
            localStorage.getItem(`shopSettings_${item.shopId}`) || "{}"
        );

        if (settings.acceptOrders === false) {

            unavailableItems.push(item.name);

            continue;

        }


        const menuData = JSON.parse(
            localStorage.getItem(`shopMenu_${item.shopId}`) || "null"
        );

        const currentItem = menuData?.items?.find(menuItem =>
            menuItem.id === item.itemId
        );

        if (
            !currentItem ||
            currentItem.status !== "Available" ||
            Number(currentItem.price) !== Number(item.price)
        ) {

            unavailableItems.push(item.name);

        }

    }


    return unavailableItems;

}


// =====================================
// GENERATE ORDER ID
// =====================================

function generateOrderId() {

    const orderCounter = Number(
        localStorage.getItem("orderIdCounter") || "1000"
    ) + 1;

    localStorage.setItem(
        "orderIdCounter",
        String(orderCounter)
    );

    return "ORD" + orderCounter;

}


// =====================================
// PLACE ORDER
// =====================================

checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();


    if (cart.length === 0) {

        showToast("Your cart is empty.");

        closeCheckout();

        return;

    }


    const name = document.getElementById("customerName").value.trim();

    const phone = document.getElementById("customerPhone").value.trim();

    const selectedOrderType = orderType.value;

    const selectedTable = tableNumber.value.trim();

    const notes = document.getElementById("orderNotes").value.trim();


    if (name.length < 3) {

        showToast("Please enter a valid name.");

        return;

    }


    if (!/^[6-9]\d{9}$/.test(phone)) {

        showToast("Please enter a valid 10-digit mobile number.");

        return;

    }


    if (
        selectedOrderType === "Dine-in" &&
        !selectedTable
    ) {

        showToast("Please enter your table number.");

        return;

    }


    // Recheck all shops and food items.

    const unavailableItems = validateCartBeforeOrder();

    if (unavailableItems.length > 0) {

        showToast(
            "Some items are unavailable. Please review your cart."
        );

        displayCart();

        return;

    }


    // Update customer details.

    currentCustomer.name = name;

    currentCustomer.phone = phone;

    customers = customers.map(customer => {

        if (customer.customerId === currentCustomer.customerId) {

            return currentCustomer;

        }

        return customer;

    });

    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    // Read existing orders.

    const allOrders = JSON.parse(
        localStorage.getItem("foodOrders") || "[]"
    );


    // Group cart items by shop.
    // Each shop receives its own preparation queue.

    const shopGroups = {};

    cart.forEach(item => {

        if (!shopGroups[item.shopId]) {

            shopGroups[item.shopId] = [];

        }

        shopGroups[item.shopId].push(item);

    });


    const createdOrders = [];

    const timestamp = new Date().toISOString();


    Object.keys(shopGroups).forEach(shopId => {

        const shopItems = shopGroups[shopId];

        const shopName = shopItems[0].shopName || shopId;


        const itemsSubtotal = shopItems.reduce((total, item) => {

            return total +
                Number(item.price) * Number(item.quantity);

        }, 0);


        // Allocate the platform fee proportionally across shop orders.

        const overallSubtotal = calculateSubtotal();

        const shopPlatformFee = overallSubtotal > 0
            ? Number((PLATFORM_FEE * itemsSubtotal / overallSubtotal).toFixed(2))
            : 0;


        const order = {

            orderId: generateOrderId(),

            customerId: currentCustomer.customerId,

            customerEmail: currentCustomer.email,

            customerName: name,

            customerPhone: phone,

            shopId: shopId,

            shopName: shopName,

            items: shopItems.map(item => ({

                itemId: item.itemId,

                name: item.name,

                price: Number(item.price),

                quantity: Number(item.quantity)

            })),

            subtotal: Number(itemsSubtotal.toFixed(2)),

            platformFee: shopPlatformFee,

            totalAmount: Number(
                (itemsSubtotal + shopPlatformFee).toFixed(2)
            ),

            orderType: selectedOrderType,

            tableNumber:
                selectedOrderType === "Dine-in"
                    ? selectedTable
                    : "",

            notes: notes,

            status: "Placed",

            createdAt: timestamp

        };


        createdOrders.push(order);

    });


    // Save every shop order.

    const updatedOrders = [
        ...allOrders,
        ...createdOrders
    ];

    localStorage.setItem(
        "foodOrders",
        JSON.stringify(updatedOrders)
    );

// =====================================
// SHOW ORDER CONFIRMATION
// =====================================

// Save the created orders for the confirmation popup.

latestCreatedOrders = createdOrders;


// Clear cart after successfully saving orders.

cart = [];

saveCart();


// Close checkout modal.

closeCheckout();


// Refresh cart display.

displayCart();


// Display confirmation information.

const firstOrder = createdOrders[0];

successOrderId.textContent = createdOrders.length === 1
    ? firstOrder.orderId
    : `${createdOrders.length} orders created`;

successShopName.textContent = createdOrders.length === 1
    ? firstOrder.shopName
    : `${createdOrders.length} Food Shops`;

successOrderAmount.textContent =
    formatCurrency(
        createdOrders.reduce(
            (total, order) => total + Number(order.totalAmount),
            0
        )
    );


// Show success popup.

orderSuccessModal.classList.add("show");

document.body.style.overflow = "hidden";

});


// =====================================
// TOAST MESSAGE
// =====================================

let toastTimer;

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutButton")
    .addEventListener("click", () => {

        localStorage.removeItem("customerLoggedIn");

        localStorage.removeItem("customerEmail");

        window.location.href = "index.html";

    });


// =====================================
// INITIALIZE
// =====================================

displayCart();

// =====================================
// ORDER SUCCESS BUTTONS
// =====================================

function closeSuccessModal() {

    orderSuccessModal.classList.remove("show");

    document.body.style.overflow = "";

}


// Close popup.

document.getElementById("closeSuccessModal")
    .addEventListener("click", closeSuccessModal);


// Track order.

document.getElementById("trackOrderButton")
    .addEventListener("click", () => {

        window.location.href = "orders.html";

    });


// Continue shopping.

document.getElementById("continueShoppingButton")
    .addEventListener("click", () => {

        window.location.href = "home.html";

    });