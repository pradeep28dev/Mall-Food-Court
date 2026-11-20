// ============================================
// SHOP OWNER AUTHENTICATION
// ============================================

const isLoggedIn = localStorage.getItem("shopOwnerLoggedIn");

if (isLoggedIn !== "true") {
    window.location.replace("index.html");
}


// ============================================
// GET LOGGED-IN OWNER
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
// SHOP-SPECIFIC MENU STORAGE
// ============================================

// Every shop gets its own menu storage key.
// Example: shopMenu_MALL001

const menuStorageKey = "shopMenu_" + loggedInShopId;


// ============================================
// DEFAULT MENU DATA
// ============================================

const defaultCategories = [
    "Burgers",
    "Pizza",
    "Drinks",
    "Sides",
    "Desserts"
];

let menuData = JSON.parse(
    localStorage.getItem(menuStorageKey) || "null"
);

if (!menuData) {

    menuData = {
        categories: [...defaultCategories],
        items: []
    };

    saveMenu();

}


// ============================================
// SAVE MENU
// ============================================

function saveMenu() {

    localStorage.setItem(
        menuStorageKey,
        JSON.stringify(menuData)
    );

}


// ============================================
// GET HTML ELEMENTS
// ============================================

const foodGrid = document.getElementById("foodGrid");

const emptyState = document.getElementById("emptyState");

const itemModal = document.getElementById("itemModal");

const categoryModal = document.getElementById("categoryModal");

const deleteModal = document.getElementById("deleteModal");

const itemForm = document.getElementById("itemForm");

const categoryForm = document.getElementById("categoryForm");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const availabilityFilter = document.getElementById("availabilityFilter");


// ============================================
// MODAL HELPERS
// ============================================

function openModal(modal) {
    modal.classList.add("show");
}

function closeModal(modal) {
    modal.classList.remove("show");
}

document.getElementById("addItemButton").addEventListener("click", function () {
    openAddItemModal();
});

document.getElementById("emptyAddButton").addEventListener("click", function () {
    openAddItemModal();
});

document.getElementById("closeItemModal").addEventListener("click", function () {
    closeModal(itemModal);
});

document.getElementById("cancelItemButton").addEventListener("click", function () {
    closeModal(itemModal);
});

document.getElementById("addCategoryButton").addEventListener("click", function () {
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryError").textContent = "";
    openModal(categoryModal);
});

document.getElementById("closeCategoryModal").addEventListener("click", function () {
    closeModal(categoryModal);
});

document.getElementById("cancelCategoryButton").addEventListener("click", function () {
    closeModal(categoryModal);
});


// Close modal when clicking outside

[itemModal, categoryModal, deleteModal].forEach(function (modal) {

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            closeModal(modal);
        }

    });

});


// ============================================
// UPDATE SUMMARY
// ============================================

function updateSummary() {

    const total = menuData.items.length;

    const available = menuData.items.filter(function (item) {
        return item.status === "Available";
    }).length;

    const unavailable = total - available;

    document.getElementById("totalItems").textContent = total;

    document.getElementById("availableItems").textContent = available;

    document.getElementById("unavailableItems").textContent = unavailable;

    document.getElementById("totalCategories").textContent =
        menuData.categories.length;

}


// ============================================
// CATEGORY FILTERS
// ============================================

function renderCategories() {

    const categoryList = document.getElementById("categoryList");

    categoryList.replaceChildren();

    categoryFilter.replaceChildren();

    const allOption = document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Categories";

    categoryFilter.appendChild(allOption);


    const selectedCategory = categoryFilter.value;

    menuData.categories.forEach(function (category) {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);


        const chip = document.createElement("button");

        chip.type = "button";
        chip.className = "category-chip";
        chip.textContent = category;

        if (selectedCategory === category) {
            chip.classList.add("active");
        }

        chip.addEventListener("click", function () {

            categoryFilter.value =
                categoryFilter.value === category ? "all" : category;

            renderCategories();
            renderFoodItems();

        });

        categoryList.appendChild(chip);

    });


    const allChip = document.createElement("button");

    allChip.type = "button";
    allChip.className = "category-chip";
    allChip.textContent = "All";

    if (categoryFilter.value === "all") {
        allChip.classList.add("active");
    }

    allChip.addEventListener("click", function () {

        categoryFilter.value = "all";

        renderCategories();
        renderFoodItems();

    });

    categoryList.prepend(allChip);


    // Update category dropdown in item form

    const foodCategory = document.getElementById("foodCategory");

    const previousValue = foodCategory.value;

    foodCategory.replaceChildren();

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Select Category";

    foodCategory.appendChild(placeholder);

    menuData.categories.forEach(function (category) {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        foodCategory.appendChild(option);

    });

    if (menuData.categories.includes(previousValue)) {
        foodCategory.value = previousValue;
    }

}


// ============================================
// RENDER FOOD ITEMS
// ============================================

function renderFoodItems() {

    foodGrid.replaceChildren();

    const searchValue = searchInput.value.trim().toLowerCase();

    const selectedCategory = categoryFilter.value;

    const selectedAvailability = availabilityFilter.value;


    const filteredItems = menuData.items.filter(function (item) {

        const matchesSearch =
            item.name.toLowerCase().includes(searchValue) ||
            item.description.toLowerCase().includes(searchValue);

        const matchesCategory =
            selectedCategory === "all" ||
            item.category === selectedCategory;

        const matchesAvailability =
            selectedAvailability === "all" ||
            item.status === selectedAvailability;

        return matchesSearch && matchesCategory && matchesAvailability;

    });


    document.getElementById("itemCount").textContent =
        filteredItems.length + (filteredItems.length === 1 ? " item" : " items");


    if (filteredItems.length === 0) {

        emptyState.style.display = "block";
        foodGrid.style.display = "none";

    } else {

        emptyState.style.display = "none";
        foodGrid.style.display = "grid";

    }


    filteredItems.forEach(function (item) {

        const card = document.createElement("article");

        card.className = "food-card";


        // IMAGE

        const imageContainer = document.createElement("div");

        imageContainer.className = "food-image";

        if (item.image) {

            const image = document.createElement("img");

            image.src = item.image;
            image.alt = item.name;

            imageContainer.appendChild(image);

        } else {

            const placeholder = document.createElement("div");

            placeholder.className = "image-placeholder";
            placeholder.textContent = "▧";

            imageContainer.appendChild(placeholder);

        }


        // CONTENT

        const content = document.createElement("div");

        content.className = "food-content";


        const category = document.createElement("span");

        category.className = "food-category";
        category.textContent = item.category;


        const name = document.createElement("h4");

        name.textContent = item.name;


        const description = document.createElement("p");

        description.className = "food-description";

        description.textContent =
            item.description || "No description available.";


        // PRICE AND AVAILABILITY

        const bottom = document.createElement("div");

        bottom.className = "food-card-bottom";


        const price = document.createElement("strong");

        price.className = "food-price";

        price.textContent = "₹" + Number(item.price).toFixed(2);


        const badge = document.createElement("span");

        badge.className = "availability-badge";

        if (item.status === "Available") {

            badge.classList.add("available-badge");

        } else {

            badge.classList.add("unavailable-badge");

        }

        badge.textContent = item.status;


        bottom.appendChild(price);
        bottom.appendChild(badge);


        // ACTION BUTTONS

        const actions = document.createElement("div");

        actions.className = "food-actions";


        const editButton = document.createElement("button");

        editButton.className = "food-action-button edit-action";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            openEditItemModal(item.id);
        });


        const toggleButton = document.createElement("button");

        toggleButton.className = "food-action-button toggle-action";

        toggleButton.textContent =
            item.status === "Available" ? "Disable" : "Enable";

        toggleButton.addEventListener("click", function () {
            toggleAvailability(item.id);
        });


        const deleteButton = document.createElement("button");

        deleteButton.className = "food-action-button delete-action";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            openDeleteModal(item.id);
        });


        actions.appendChild(editButton);
        actions.appendChild(toggleButton);
        actions.appendChild(deleteButton);


        content.appendChild(category);
        content.appendChild(name);
        content.appendChild(description);
        content.appendChild(bottom);
        content.appendChild(actions);


        card.appendChild(imageContainer);
        card.appendChild(content);

        foodGrid.appendChild(card);

    });


    updateSummary();

}


// ============================================
// ADD FOOD ITEM MODAL
// ============================================

let editingItemId = null;

let selectedImage = "";

let originalImage = "";


function openAddItemModal() {

    editingItemId = null;

    selectedImage = "";
    originalImage = "";

    itemForm.reset();

    document.getElementById("modalTitle").textContent = "Add Food Item";

    document.getElementById("saveItemButton").textContent = "Save Food Item";

    document.getElementById("foodAvailable").checked = true;

    document.getElementById("formError").textContent = "";

    document.getElementById("imagePreviewContainer").style.display = "none";

    document.getElementById("foodImage").value = "";

    renderCategories();

    openModal(itemModal);

}


// ============================================
// EDIT FOOD ITEM MODAL
// ============================================

function openEditItemModal(itemId) {

    const item = menuData.items.find(function (food) {
        return food.id === itemId;
    });

    if (!item) return;

    editingItemId = itemId;

    selectedImage = item.image || "";
    originalImage = item.image || "";

    itemForm.reset();

    renderCategories();

    document.getElementById("modalTitle").textContent = "Edit Food Item";

    document.getElementById("saveItemButton").textContent = "Update Food Item";

    document.getElementById("foodName").value = item.name;

    document.getElementById("foodPrice").value = item.price;

    document.getElementById("foodCategory").value = item.category;

    document.getElementById("foodDescription").value = item.description;

    document.getElementById("foodAvailable").checked =
        item.status === "Available";

    document.getElementById("formError").textContent = "";

    document.getElementById("foodImage").value = "";

    if (selectedImage) {

        document.getElementById("imagePreview").src = selectedImage;

        document.getElementById("imagePreviewContainer").style.display = "block";

    } else {

        document.getElementById("imagePreviewContainer").style.display = "none";

    }

    openModal(itemModal);

}


// ============================================
// IMAGE UPLOAD
// ============================================

const foodImageInput = document.getElementById("foodImage");

foodImageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        document.getElementById("formError").textContent =
            "Please upload a JPG, PNG or WEBP image.";

        this.value = "";

        return;

    }

    if (file.size > 1024 * 1024) {

        document.getElementById("formError").textContent =
            "Image size must be less than 1 MB.";

        this.value = "";

        return;

    }

    document.getElementById("formError").textContent = "";


    const reader = new FileReader();

    reader.onload = function (event) {

        selectedImage = event.target.result;

        document.getElementById("imagePreview").src = selectedImage;

        document.getElementById("imagePreviewContainer").style.display = "block";

    };

    reader.readAsDataURL(file);

});


// ============================================
// REMOVE IMAGE
// ============================================

document.getElementById("removeImageButton").addEventListener("click", function () {

    selectedImage = "";

    foodImageInput.value = "";

    document.getElementById("imagePreview").src = "";

    document.getElementById("imagePreviewContainer").style.display = "none";

});


// ============================================
// SAVE FOOD ITEM
// ============================================

itemForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("foodName").value.trim();

    const price = Number(document.getElementById("foodPrice").value);

    const category = document.getElementById("foodCategory").value;

    const description = document.getElementById("foodDescription").value.trim();

    const status = document.getElementById("foodAvailable").checked
        ? "Available"
        : "Unavailable";


    const formError = document.getElementById("formError");

    formError.textContent = "";


    if (!name || !category || !Number.isFinite(price) || price <= 0) {

        formError.textContent =
            "Please enter a valid name, price and category.";

        return;

    }


    const duplicateItem = menuData.items.some(function (item) {

        return item.name.toLowerCase() === name.toLowerCase() &&
               item.id !== editingItemId;

    });

    if (duplicateItem) {

        formError.textContent =
            "A food item with this name already exists in your menu.";

        return;

    }


    if (editingItemId) {

        const itemIndex = menuData.items.findIndex(function (item) {
            return item.id === editingItemId;
        });

        if (itemIndex === -1) return;

        menuData.items[itemIndex] = {

            ...menuData.items[itemIndex],

            name: name,
            price: price,
            category: category,
            description: description,
            image: selectedImage,
            status: status,

            updatedAt: new Date().toISOString()

        };

    } else {

        const newItem = {

            id: "ITEM" + Date.now(),

            shopId: loggedInShopId,

            name: name,

            price: price,

            category: category,

            description: description,

            image: selectedImage,

            status: status,

            createdAt: new Date().toISOString()

        };

        menuData.items.push(newItem);

    }


    saveMenu();

    renderFoodItems();

    closeModal(itemModal);

    itemForm.reset();

    selectedImage = "";
    originalImage = "";

});


// ============================================
// TOGGLE AVAILABILITY
// ============================================

function toggleAvailability(itemId) {

    const item = menuData.items.find(function (food) {
        return food.id === itemId;
    });

    if (!item) return;

    item.status = item.status === "Available"
        ? "Unavailable"
        : "Available";

    item.updatedAt = new Date().toISOString();

    saveMenu();

    renderFoodItems();

}


// ============================================
// DELETE FOOD ITEM
// ============================================

let deletingItemId = null;


function openDeleteModal(itemId) {

    deletingItemId = itemId;

    openModal(deleteModal);

}


document.getElementById("cancelDeleteButton").addEventListener("click", function () {

    deletingItemId = null;

    closeModal(deleteModal);

});


document.getElementById("confirmDeleteButton").addEventListener("click", function () {

    if (!deletingItemId) return;

    menuData.items = menuData.items.filter(function (item) {

        return item.id !== deletingItemId;

    });

    saveMenu();

    renderFoodItems();

    deletingItemId = null;

    closeModal(deleteModal);

});


// ============================================
// ADD CATEGORY
// ============================================

categoryForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const categoryName = document.getElementById("categoryName")
        .value.trim();

    const categoryError = document.getElementById("categoryError");

    categoryError.textContent = "";


    if (!categoryName) {

        categoryError.textContent = "Please enter a category name.";

        return;

    }


    const categoryExists = menuData.categories.some(function (category) {

        return category.toLowerCase() === categoryName.toLowerCase();

    });


    if (categoryExists) {

        categoryError.textContent = "This category already exists.";

        return;

    }


    menuData.categories.push(categoryName);

    saveMenu();

    renderCategories();

    renderFoodItems();

    closeModal(categoryModal);

    categoryForm.reset();

});


// ============================================
// SEARCH AND FILTER EVENTS
// ============================================

searchInput.addEventListener("input", renderFoodItems);


categoryFilter.addEventListener("change", function () {

    renderCategories();

    renderFoodItems();

});


availabilityFilter.addEventListener("change", renderFoodItems);


// ============================================
// LOGOUT
// ============================================

document.getElementById("logoutButton").addEventListener("click", function () {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        localStorage.removeItem("shopOwnerLoggedIn");

        localStorage.removeItem("shopOwnerEmail");

        localStorage.removeItem("shopOwnerShopId");

        window.location.replace("index.html");

    }

});


// ============================================
// INITIAL PAGE LOAD
// ============================================

renderCategories();

renderFoodItems();