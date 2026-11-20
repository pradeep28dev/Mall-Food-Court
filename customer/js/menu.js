// =====================================
// CUSTOMER MENU PAGE
// =====================================


// =====================================
// AUTHENTICATION CHECK
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

const customers = JSON.parse(
    localStorage.getItem("customers") || "[]"
);

const currentCustomer = customers.find(customer =>
    customer.email.toLowerCase() === customerEmail.toLowerCase()
);

if (!currentCustomer) {

    localStorage.removeItem("customerLoggedIn");
    localStorage.removeItem("customerEmail");

    window.location.href = "index.html";

}


// =====================================
// GET SHOP ID FROM URL
// =====================================

const urlParams = new URLSearchParams(window.location.search);

const shopId = urlParams.get("shopId");

if (!shopId) {
    window.location.href = "home.html";
}


// =====================================
// HTML ELEMENTS
// =====================================

const shopNameElement = document.getElementById("shopName");
const shopDescriptionElement = document.getElementById("shopDescription");
const shopIdElement = document.getElementById("shopId");
const shopIconElement = document.getElementById("shopIcon");
const shopStatusElement = document.getElementById("shopStatus");

const foodGrid = document.getElementById("foodGrid");
const emptyState = document.getElementById("emptyState");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

const categoryFilters = document.getElementById("categoryFilters");


// =====================================
// LOAD SHOP INFORMATION
// =====================================

const foodShops = JSON.parse(
    localStorage.getItem("foodShops") || "[]"
);

const currentShop = foodShops.find(shop =>
    shop.shopId === shopId
);

if (!currentShop || currentShop.status !== "Active") {

    alert("This food shop is currently unavailable.");

    window.location.href = "home.html";

}


// =====================================
// CHECK SHOP SETTINGS
// =====================================

const settingsKey = `shopSettings_${shopId}`;

const shopSettings = JSON.parse(
    localStorage.getItem(settingsKey) || "{}"
);

const acceptsOrders = shopSettings.acceptOrders !== false;

if (!acceptsOrders) {

    shopStatusElement.textContent = "Not Accepting Orders";
    shopStatusElement.classList.add("closed");

} else {

    shopStatusElement.textContent = "Accepting Orders";
    shopStatusElement.classList.remove("closed");

}


// =====================================
// DISPLAY SHOP INFORMATION
// =====================================

shopNameElement.textContent = currentShop.shopName;

shopDescriptionElement.textContent =
    currentShop.description || "Explore our delicious food menu.";

shopIdElement.textContent = `Shop ID: ${currentShop.shopId}`;


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

    return "🍽️";

}


shopIconElement.textContent = getShopIcon(currentShop.shopName);

document.getElementById("profileAvatar").textContent =
    currentCustomer.name.charAt(0).toUpperCase();


// =====================================
// LOAD SHOP-SPECIFIC MENU
// =====================================

let allFoodItems = [];

let selectedCategory = "All";

let searchTerm = "";


function loadMenuItems() {

    // Same storage key used by Shop Owner portal

    const menuStorageKey = `shopMenu_${shopId}`;

    const menuData = JSON.parse(
        localStorage.getItem(menuStorageKey) || "null"
    );

    if (!menuData || !Array.isArray(menuData.items)) {

        allFoodItems = [];

        createCategoryFilters();

        displayFoodItems();

        return;

    }


    // Read items belonging to this shop

    allFoodItems = menuData.items.filter(item => {

        return (
            item.shopId === shopId &&
            item.status === "Available"
        );

    });


    createCategoryFilters();

    displayFoodItems();

}


// =====================================
// CATEGORY FILTERS
// =====================================

function createCategoryFilters() {

    categoryFilters.innerHTML = "";

    const categories = [
        "All",
        ...new Set(
            allFoodItems
                .map(item => item.category)
                .filter(Boolean)
        )
    ];


    // Reset selected category if no longer available

    if (!categories.includes(selectedCategory)) {
        selectedCategory = "All";
    }


    categories.forEach(category => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "category-button";

        if (category === selectedCategory) {
            button.classList.add("active");
        }

        button.textContent = category;

        button.addEventListener("click", () => {

            selectedCategory = category;

            createCategoryFilters();

            displayFoodItems();

        });

        categoryFilters.appendChild(button);

    });

}


// =====================================
// FILTER FOOD ITEMS
// =====================================

function getFilteredItems() {

    return allFoodItems.filter(item => {

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const matchesSearch =
            (item.name || "").toLowerCase().includes(searchTerm) ||
            (item.description || "").toLowerCase().includes(searchTerm) ||
            (item.category || "").toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;

    });

}


// =====================================
// DISPLAY FOOD ITEMS
// =====================================

function displayFoodItems() {

    foodGrid.innerHTML = "";

    const filteredItems = getFilteredItems();

    document.getElementById("itemCount").textContent =
        `${filteredItems.length} ${filteredItems.length === 1 ? "Item" : "Items"}`;


    if (filteredItems.length === 0) {

        emptyState.style.display = "block";

        emptyMessage.textContent =
            allFoodItems.length === 0
                ? "This shop has not added any available food items yet."
                : "No food items match your search or category.";

        return;

    }


    emptyState.style.display = "none";


    filteredItems.forEach(item => {

        const card = document.createElement("article");

        card.className = "food-card";


        // FOOD IMAGE

        const imageContainer = document.createElement("div");

        imageContainer.className = "food-image";


        if (item.image) {

            const image = document.createElement("img");

            image.src = item.image;

            image.alt = item.name || "Food item";

            image.onerror = () => {

                image.remove();

                const placeholder = document.createElement("span");

                placeholder.className = "food-placeholder";

                placeholder.textContent = "🍽️";

                imageContainer.prepend(placeholder);

            };

            imageContainer.appendChild(image);

        } else {

            const placeholder = document.createElement("span");

            placeholder.className = "food-placeholder";

            placeholder.textContent = "🍽️";

            imageContainer.appendChild(placeholder);

        }


        const category = document.createElement("span");

        category.className = "food-category";

        category.textContent = item.category || "Food";

        imageContainer.appendChild(category);


        // FOOD INFORMATION

        const information = document.createElement("div");

        information.className = "food-information";


        const title = document.createElement("h3");

        title.textContent = item.name || "Food Item";


        const description = document.createElement("p");

        description.className = "food-description";

        description.textContent =
            item.description || "Delicious food prepared fresh.";


        // PRICE AND PREPARATION TIME

        const extra = document.createElement("div");

        extra.className = "food-extra";


        const price = document.createElement("span");

        price.className = "food-price";

        price.textContent =
            `₹${Number(item.price || 0).toFixed(2)}`;


        const preparation = document.createElement("span");

        preparation.className = "preparation-time";

        preparation.textContent = "⏱ Preparation time varies";


        extra.append(price, preparation);


        // ACTIONS

        const actions = document.createElement("div");

        actions.className = "food-actions";


        const availability = document.createElement("span");

        availability.className = "availability";

        availability.textContent = "● Available";


        const addButton = document.createElement("button");

        addButton.type = "button";

        addButton.className = "add-cart-button";

        addButton.textContent = "+ Add";

        addButton.disabled = !acceptsOrders;


        if (!acceptsOrders) {

            addButton.textContent = "Shop Closed";

        }


        addButton.addEventListener("click", () => {

            addToCart(item);

        });


        actions.append(availability, addButton);


        information.append(
            title,
            description,
            extra,
            actions
        );


        card.append(imageContainer, information);

        foodGrid.appendChild(card);

    });

}


// =====================================
// ADD ITEM TO CART
// =====================================

function addToCart(item) {

    if (!acceptsOrders) {

        showToast("This shop is currently not accepting orders.");

        return;

    }


    if (item.status !== "Available") {

        showToast("This item is currently unavailable.");

        return;

    }


    const cartKey = `cart_${currentCustomer.customerId}`;

    let cart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
    );


    const existingItem = cart.find(cartItem =>

        cartItem.itemId === item.id &&
        cartItem.shopId === shopId

    );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            itemId: item.id,

            shopId: shopId,

            shopName: currentShop.shopName,

            name: item.name,

            price: Number(item.price),

            image: item.image || "",

            quantity: 1

        });

    }


    localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
    );


    updateCartCount();

    showToast(`${item.name} added to your cart!`);

}


// =====================================
// UPDATE CART COUNT
// =====================================

function updateCartCount() {

    const cartKey = `cart_${currentCustomer.customerId}`;

    const cart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
    );


    const count = cart.reduce(

        (total, item) => total + Number(item.quantity || 0),

        0

    );


    document.getElementById("cartCount").textContent = count;

}


// =====================================
// SEARCH
// =====================================

searchInput.addEventListener("input", () => {

    searchTerm = searchInput.value.trim().toLowerCase();

    displayFoodItems();

});


// =====================================
// CLEAR SEARCH
// =====================================

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    searchTerm = "";

    displayFoodItems();

});


// =====================================
// TOAST MESSAGE
// =====================================

let toastTimer;


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// =====================================
// INITIALIZE
// =====================================

loadMenuItems();

updateCartCount();