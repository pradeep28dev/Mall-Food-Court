// =====================================
// CUSTOMER HOME PAGE
// =====================================


// =====================================
// CUSTOMER AUTHENTICATION CHECK
// =====================================

const isLoggedIn = localStorage.getItem("customerLoggedIn");
const customerEmail = localStorage.getItem("customerEmail");

if (isLoggedIn !== "true" || !customerEmail) {
    window.location.href = "index.html";
}


// =====================================
// CUSTOMER INFORMATION
// =====================================

const customers = JSON.parse(
    localStorage.getItem("customers") || "[]"
);

const currentCustomer = customers.find(
    customer => customer.email.toLowerCase() === customerEmail.toLowerCase()
);

if (!currentCustomer) {

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

}

document.getElementById("customerName").textContent =
    currentCustomer.name;

document.getElementById("profileAvatar").textContent =
    currentCustomer.name.charAt(0).toUpperCase();


// =====================================
// LOAD FOOD SHOPS
// =====================================

const shopsGrid = document.getElementById("shopsGrid");
const emptyState = document.getElementById("emptyState");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

let availableShops = [];

function getFoodShops() {

    const foodShops = JSON.parse(
        localStorage.getItem("foodShops") || "[]"
    );

    // Show only active shops that have completed registration.

    availableShops = foodShops.filter(shop =>
        shop.status === "Active" && shop.registered === true
    );

    displayShops(availableShops);

}


// =====================================
// SHOP ICON
// =====================================

function getShopIcon(shopName) {

    const name = shopName.toLowerCase();

    if (name.includes("pizza")) return "🍕";
    if (name.includes("burger")) return "🍔";
    if (name.includes("coffee") || name.includes("cafe")) return "☕";
    if (name.includes("juice")) return "🧃";
    if (name.includes("ice cream")) return "🍨";
    if (name.includes("chicken")) return "🍗";
    if (name.includes("biryani")) return "🍛";
    if (name.includes("bakery")) return "🥐";
    if (name.includes("sweet")) return "🍰";

    return "🍽️";

}


// =====================================
// DISPLAY SHOPS
// =====================================

function displayShops(shops) {

    shopsGrid.innerHTML = "";

    document.getElementById("shopCount").textContent =
        `${shops.length} ${shops.length === 1 ? "Shop" : "Shops"}`;

    if (shops.length === 0) {

        emptyState.style.display = "block";

        emptyMessage.textContent =
            availableShops.length === 0
                ? "No registered food shops are available right now. Please check again later."
                : "We couldn't find a shop matching your search.";

        return;

    }

    emptyState.style.display = "none";

    shops.forEach(shop => {

        const card = document.createElement("article");
        card.className = "shop-card";

        const description = shop.description || "Explore delicious food and discover your favourites.";

        card.innerHTML = `
            <div class="shop-banner">

                <span class="shop-status">● Available</span>

                <span class="shop-icon">
                    ${getShopIcon(shop.shopName)}
                </span>

            </div>

            <div class="shop-information">

                <h3></h3>

                <p></p>

                <span class="shop-id"></span>

                <button class="view-menu-button" type="button">
                    Explore Menu →
                </button>

            </div>
        `;

        // Use textContent for data from LocalStorage.

        card.querySelector("h3").textContent = shop.shopName;
        card.querySelector(".shop-information p").textContent = description;
        card.querySelector(".shop-id").textContent = `Shop ID: ${shop.shopId}`;

        card.querySelector(".view-menu-button").addEventListener("click", () => {

            window.location.href =
                `menu.html?shopId=${encodeURIComponent(shop.shopId)}`;

        });

        shopsGrid.appendChild(card);

    });

}


// =====================================
// SEARCH FOOD SHOPS
// =====================================

searchInput.addEventListener("input", () => {

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredShops = availableShops.filter(shop => {

        const shopName = (shop.shopName || "").toLowerCase();
        const description = (shop.description || "").toLowerCase();
        const shopId = (shop.shopId || "").toLowerCase();

        return (
            shopName.includes(searchTerm) ||
            description.includes(searchTerm) ||
            shopId.includes(searchTerm)
        );

    });

    displayShops(filteredShops);

});


// =====================================
// CLEAR SEARCH
// =====================================

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    displayShops(availableShops);

});


// =====================================
// CART COUNT
// =====================================

function updateCartCount() {

    const cartKey = `cart_${currentCustomer.customerId}`;

    const cart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
    );

    const totalItems = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    document.getElementById("cartCount").textContent = totalItems;

}


// =====================================
// LOGOUT
// =====================================

document.getElementById("logoutButton").addEventListener("click", () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

});


// =====================================
// INITIALIZE PAGE
// =====================================

getFoodShops();
updateCartCount();