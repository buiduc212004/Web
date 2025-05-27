import {
  cart,
  loadCart,
  saveCart,
  addItemToCart,
  removeItemFromCart,
  updateCartUI,
  updateCartTotals,
  getCategoryIcon,
  formatPrice
} from './cart.js';

// Import hàm lấy ảnh từ API
import { getMainImage, displayImage, FOOD_IMAGES } from './image-utils.js';

document.addEventListener("DOMContentLoaded", async () => {
  let foods = [];
  try {
    const res = await fetch('http://localhost:5000/api/foods');
    foods = await res.json();
  } catch (e) {
    // fallback sample data nếu fetch lỗi
    foods = [
      { id: "combo-1", name: "Mixed Tropical Fruit Salad with Superfood Berries", price: 120000, category: "all", image: "../image/Combo_1.png", rating: 4.8, reviews: 74 },
      // ... các món mẫu khác ...
    ];
  }
  // Đảm bảo foods luôn là array
  if (!Array.isArray(foods)) {
    if (foods && Array.isArray(foods.foods)) {
      foods = foods.foods;
    } else {
      foods = [];
    }
  }
  foods = foods.map((food, idx) => ({ ...food, image: FOOD_IMAGES[idx % FOOD_IMAGES.length] }));
  // Phân trang foods trên client, render ra giao diện như cũ
  // ...

  // Load cart from localStorage
  loadCart();

  // Minimum order amount
  const minimumOrderAmount = 100000

  // Promo code claimed status
  let promoCodeClaimed = false

  // Food items data for pagination
  const foodPages = {
    all: [
      [
        {
          id: "combo-1",
          name: "Mixed Tropical Fruit Salad with Superfood Berries",
          price: 120000,
          category: "all",
          image: "../image/Combo_1.png",
          rating: 4.8,
          reviews: 74,
        },
        {
          id: "combo-2",
          name: "Big and Juicy Wagyu Beef Cheeseburger",
          price: 150000,
          category: "all",
          image: "../image/combo_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "combo-3",
          name: "Healthy Japanese Fried Rice with Egg",
          price: 110000,
          category: "all",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
        {
          id: "combo-4",
          name: "Cauliflower Walnut Vegetarian Taco Meat",
          price: 130000,
          category: "all",
          image: "../image/combo_4.png",
          rating: 4.8,
          reviews: 70,
        },
      ],
      [
        {
          id: "combo-5",
          name: "Grilled Chicken Caesar Salad",
          price: 125000,
          category: "all",
          image: "../image/combo_5.png",
          rating: 4.6,
          reviews: 62,
        },
        {
          id: "combo-6",
          name: "Spicy Thai Basil Noodles",
          price: 135000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.7,
          reviews: 58,
        },
        {
          id: "combo-7",
          name: "Mediterranean Falafel Wrap",
          price: 115000,
          category: "all",
          image: "../image/combo_7.png",
          rating: 4.5,
          reviews: 50,
        },
        {
          id: "combo-8",
          name: "Classic Margherita Pizza",
          price: 140000,
          category: "all",
          image: "../image/combo_8.png",
          rating: 4.8,
          reviews: 75,
        },
      ],
      [
        {
          id: "combo-9",
          name: "Teriyaki Salmon Bowl",
          price: 160000,
          category: "all",
          image: "../image/combo_5.png",
          rating: 4.9,
          reviews: 80,
        },
        {
          id: "combo-10",
          name: "Mushroom Risotto",
          price: 130000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.6,
          reviews: 55,
        },
        {
          id: "combo-11",
          name: "BBQ Pulled Pork Sandwich",
          price: 145000,
          category: "all",
          image: "../image/combo_7.png",
          rating: 4.7,
          reviews: 68,
        },
        {
          id: "combo-12",
          name: "Shrimp Pad Thai",
          price: 155000,
          category: "all",
          image: "../image/combo_8.png",
          rating: 4.8,
          reviews: 72,
        },
      ],
      [
        {
          id: "combo-13",
          name: "Beef Stroganoff with Rice",
          price: 165000,
          category: "all",
          image: "../image/combo_5.png",
          rating: 4.7,
          reviews: 65,
        },
        {
          id: "combo-14",
          name: "Vegetable Lasagna",
          price: 140000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.6,
          reviews: 60,
        },
        {
          id: "combo-15",
          name: "Chicken Tikka Masala",
          price: 155000,
          category: "all",
          image: "../image/combo_7.png",
          rating: 4.8,
          reviews: 70,
        },
        {
          id: "combo-16",
          name: "Seafood Paella",
          price: 175000,
          category: "all",
          image: "../image/combo_8.png",
          rating: 4.9,
          reviews: 85,
        },
      ],
      [
        {
          id: "combo-17",
          name: "Beef Bulgogi Bowl",
          price: 160000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.8,
          reviews: 75,
        },
        {
          id: "combo-18",
          name: "Spinach and Feta Stuffed Chicken",
          price: 150000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.7,
          reviews: 65,
        },
        {
          id: "combo-19",
          name: "Eggplant Parmesan",
          price: 135000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.6,
          reviews: 55,
        },
        {
          id: "combo-20",
          name: "Lobster Mac and Cheese",
          price: 185000,
          category: "all",
          image: "../image/combo_6.png",
          rating: 4.9,
          reviews: 90,
        },
      ],
    ],
  }

  // Vouchers data
  const vouchers = {
    all: [
      {
        code: "WELCOME10",
        discount: 10,
        type: "percentage",
        minOrder: 150000,
        description: "10% off your first order",
      },
      {
        code: "FREESHIP",
        discount: 25000,
        type: "fixed",
        minOrder: 200000,
        description: "Free shipping on orders over 200.000đ",
      },
      {
        code: "COMBO50K",
        discount: 50000,
        type: "fixed",
        minOrder: 300000,
        description: "50.000đ off on orders over 300.000đ",
      },
    ],
  }

  // Current category and page
  let currentCategory = "all"
  let currentPage = 1

  // DOM Elements
  const cartToggle = document.getElementById("cart-toggle")
  const cartDropdown = document.getElementById("cart-dropdown")
  const closeCart = document.getElementById("close-cart")
  const cartItems = document.getElementById("cart-items")
  const promoCode = document.getElementById("promo-code")
  const changeLocation = document.getElementById("change-location")
  const locationModal = document.getElementById("location-modal")
  const closeLocationModal = document.getElementById("close-location-modal")
  const saveLocationBtn = document.getElementById("save-location-btn")
  const promoModal = document.getElementById("promo-modal")
  const closePromoModal = document.getElementById("close-promo-modal")
  const claimPromoBtn = document.getElementById("claim-promo-btn")
  const copyCodeBtn = document.getElementById("copy-code-btn")
  const viewFullBasket = document.getElementById("view-full-basket")
  const categories = document.querySelectorAll(".category")
  const pageBtns = document.querySelectorAll(".page-btn")
  const comboCards = document.querySelector(".combo-cards")
  const selectLocationBtns = document.querySelectorAll(".select-location-btn")

  // Initialize the page
  initializePage()

  // Event Listeners
  function setupEventListeners() {
    // Cart toggle
    cartToggle.addEventListener("click", toggleCart)
    closeCart.addEventListener("click", closeCartDropdown)

    // Close cart when clicking outside
    document.addEventListener("click", handleOutsideClick)

    // Location modal
    changeLocation.addEventListener("click", openLocationModal)
    closeLocationModal.addEventListener("click", closeLocModal)
    saveLocationBtn.addEventListener("click", saveLocation)

    // Select location buttons
    selectLocationBtns.forEach((btn) => {
      btn.addEventListener("click", selectLocation)
    })

    // Promo code
    promoCode.addEventListener("click", openPromoModal)
    closePromoModal.addEventListener("click", closePromModal)
    claimPromoBtn.addEventListener("click", claimPromo)
    copyCodeBtn.addEventListener("click", copyPromoCode)

    // Category selection
    categories.forEach((category) => {
      category.addEventListener("click", switchCategory)
    })

    // Pagination
    pageBtns.forEach((btn) => {
      btn.addEventListener("click", changePage)
    })

    // Add to cart buttons (will be added dynamically)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-btn")) {
        addToCart(e.target)
      }
    })

    // Food cards in deals section
    document.querySelectorAll(".food-card").forEach((card) => {
      const addBtn = card.querySelector(".add-to-cart")
      if (addBtn) {
        addBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          const foodName = card.querySelector(".food-card-overlay span").textContent
          const discountText = card.querySelector(".discount-badge").textContent
          const discount = Number.parseInt(discountText.replace(/[^0-9]/g, ""))

          // Just show notification without adding to cart
          showNotification(`${foodName} deal claimed successfully!`)

          // Change button text to "Claimed"
          addBtn.textContent = "Claimed"
          addBtn.disabled = true
          addBtn.style.backgroundColor = "#00c853"

          // Reset after 3 seconds
          setTimeout(() => {
            addBtn.textContent = "Add to Cart"
            addBtn.disabled = false
            addBtn.style.backgroundColor = ""
          }, 3000)
        })
      }
    })
  }

  // Initialize the page
  function initializePage() {
    // Load first page of default category
    loadComboItems("all", 1)
    setupEventListeners()

    // Initialize cart UI
    updateCartUI();
    updateCartTotals();
    updateCartCount();
  }

  // Toggle cart dropdown
  function toggleCart() {
    cartDropdown.classList.toggle("active")
    const chevron = cartToggle.querySelector(".fa-chevron-down, .fa-chevron-up")
    if (chevron) {
      chevron.classList.toggle("fa-chevron-up")
      chevron.classList.toggle("fa-chevron-down")
    }
  }

  // Close cart dropdown
  function closeCartDropdown() {
    cartDropdown.classList.remove("active")
    const chevron = cartToggle.querySelector(".fa-chevron-down, .fa-chevron-up")
    if (chevron) {
      chevron.className = "fas fa-chevron-down"
    }
  }

  // Handle clicks outside the cart
  function handleOutsideClick(event) {
    if (!cartToggle.contains(event.target) && !cartDropdown.contains(event.target)) {
      closeCartDropdown()
    }
  }

  // Open location modal
  function openLocationModal() {
    locationModal.style.display = "flex"
  }

  // Close location modal
  function closeLocModal() {
    locationModal.style.display = "none"
  }

  // Save location
  function saveLocation() {
    const locationInput = document.getElementById("location-input")
    if (locationInput.value.trim() !== "") {
      document.querySelector(".promo-center span").textContent = locationInput.value
      showNotification("Location updated successfully!")
    }
    locationModal.style.display = "none"
  }

  // Select location
  function selectLocation() {
    const locationDetails = this.closest(".location-item").querySelector(".location-details p").textContent
    document.querySelector(".promo-center span").textContent = locationDetails
    locationModal.style.display = "none"
    showNotification("Location updated successfully!")
  }

  // Open promo modal
  function openPromoModal() {
    if (!promoCodeClaimed) {
      promoModal.style.display = "flex"
    }
  }

  // Close promo modal
  function closePromModal() {
    promoModal.style.display = "none"
  }

  // Claim promo code
  function claimPromo() {
    promoCodeClaimed = true
    promoCode.innerHTML = 'Promo: ORDERS <i class="fas fa-check-circle"></i>'
    promoCode.classList.add("claimed")
    promoModal.style.display = "none"

    // Apply the voucher to cart
    applyVoucher("ORDERS", 5, "percentage")

    showNotification("Promo code claimed successfully!")
  }

  // Copy promo code
  function copyPromoCode() {
    navigator.clipboard.writeText("ORDERS")
    this.innerHTML = '<i class="fas fa-check"></i> Copied!'
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-copy"></i> Copy'
    }, 2000)
  }

  // View full basket - No longer needed as it's a direct link now
  // viewFullBasket.addEventListener("click", viewBasket)

  // Switch category
  function switchCategory() {
    // Remove active class from all categories
    categories.forEach((cat) => cat.classList.remove("active"))

    // Add active class to clicked category
    this.classList.add("active")

    // Get category name
    const categoryText = this.textContent.trim().toLowerCase()

    // Map category text to category key
    if (categoryText === "vegan") {
      currentCategory = "vegan"
    } else if (categoryText === "sushi") {
      currentCategory = "sushi"
    } else if (categoryText === "all food categories") {
      currentCategory = "all"
    } else if (categoryText === "others") {
      currentCategory = "others"
    }

    // Reset to page 1
    currentPage = 1

    // Update active page button
    pageBtns.forEach((btn) => {
      btn.classList.remove("active")
      if (btn.getAttribute("data-page") === "1") {
        btn.classList.add("active")
      }
    })

    // Load items for this category
    loadComboItems(currentCategory, 1)

    // Show notification about available vouchers
    if (currentCategory !== "all") {
      const availableVouchers = vouchers[currentCategory]
      if (availableVouchers && availableVouchers.length > 0) {
        showNotification(`${availableVouchers.length} vouchers available for ${currentCategory} category!`)
      }
    }
  }

  // Change page
  function changePage() {
    // Remove active class from all page buttons
    pageBtns.forEach((btn) => btn.classList.remove("active"))

    // Add active class to clicked button
    this.classList.add("active")

    // Get page number
    currentPage = Number.parseInt(this.getAttribute("data-page"))

    // Load items for this page
    loadComboItems(currentCategory, currentPage)

    // Add bounce animation
    this.classList.add("bounce")
    setTimeout(() => {
      this.classList.remove("bounce")
    }, 500)
  }

  // Load combo items
  function loadComboItems(category, page) {
    // Clear current items
    comboCards.innerHTML = ""

    // Get items for this category and page
    const items = foodPages[category] && foodPages[category][page - 1]

    if (!items) {
      comboCards.innerHTML = "<p>No items found for this category.</p>"
      return
    }

    // Create cards for each item
    items.forEach((item, idx) => {
      // Lấy ID số từ item.id (ví dụ "combo-1" -> "1")
      const itemId = item.id.replace(/[^\d]/g, '');
      // Dùng ảnh local đã gán ở item.image
      const imageSrc = item.image;
      const card = document.createElement("div")
      card.className = "combo-card"
      card.innerHTML = `
                  <img id="combo-image-${itemId}" src="${imageSrc}" alt="${item.name}">
                  <div class="combo-card-content">
                      <h3 class="combo-card-title">${item.name}</h3>
                      <div class="combo-card-footer">
                          <div class="combo-card-rating">
                              <div class="rating">
                                  <i class="fas fa-star star"></i>
                                  <span>${item.rating}</span>
                              </div>
                              <div class="reviews">${item.reviews} Reviews</div>
                          </div>
                          <button class="add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-category="${item.category}">Add</button>
                      </div>
                  </div>
              `
      comboCards.appendChild(card)
    })
    // Sau khi render xong, gán lại event cho các nút động
    setupEventListeners();
  }

  // Add to cart from combo section
  function addToCart(button) {
    const id = button.getAttribute("data-id");
    const name = button.getAttribute("data-name");
    const price = Number.parseInt(button.getAttribute("data-price"));
    const category = button.getAttribute("data-category");
    
    // Lấy đúng đường dẫn ảnh từ DOM
    const itemId = id.replace(/[^\d]/g, '');
    const img = document.getElementById(`combo-image-${itemId}`);
    const image = img ? img.getAttribute("src") : "../image/error.png";

    // Add animation
    button.classList.add("added");
    const originalText = button.textContent;
    button.textContent = "Added!";

    setTimeout(() => {
      button.classList.remove("added");
      button.textContent = originalText;
    }, 1500);

    // Add to cart với ảnh từ API
    addItemToCart(id, name, category, "Regular", price, 1, image);

    showNotification(`${name} added to cart!`);
  }

  // Update cart count
  function updateCartCount() {
    const cartCount = document.querySelector(".cart-count")
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0)
    cartCount.textContent = totalItems

    // Update cart dropdown title
    const cartTitle = document.querySelector(".cart-header h3")
    if (cartTitle) {
      cartTitle.textContent = `My Basket (${totalItems})`
    }

    // Add pulse animation to cart button
    cartToggle.classList.add("pulse")
    setTimeout(() => {
      cartToggle.classList.remove("pulse")
    }, 500)
  }

  // Check minimum order
  function checkMinimumOrder() {
    if (cart.subtotal < minimumOrderAmount && cart.items.length > 0) {
      const remaining = minimumOrderAmount - cart.subtotal
      showNotification(`Add ${formatPrice(remaining)} more to reach minimum order amount`)
    }
  }

  // Check voucher eligibility
  function checkVoucherEligibility() {
    if (cart.items.length > 0) {
      // Check if eligible for any vouchers in current category
      const eligibleVouchers = vouchers[currentCategory].filter((v) => cart.subtotal >= v.minOrder)

      if (eligibleVouchers.length > 0 && !cart.appliedVoucher) {
        const bestVoucher = eligibleVouchers.reduce((best, current) => {
          const bestValue = best.type === "percentage" ? (cart.subtotal * best.discount) / 100 : best.discount

          const currentValue =
            current.type === "percentage" ? (cart.subtotal * current.discount) / 100 : current.discount

          return currentValue > bestValue ? current : best
        }, eligibleVouchers[0])

        showNotification(`You're eligible for voucher ${bestVoucher.code}: ${bestVoucher.description}`)
      }
    }
  }

  // Apply voucher
  function applyVoucher(code, value, type) {
    cart.appliedVoucher = {
      code,
      value,
      type,
    }
    updateCartTotals();
    saveCart();
    updateCartUI();
    updateCartCount();
    if (typeof updateBasketUI === 'function') updateBasketUI();
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "notification"
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const loginButton = document.querySelector(".login-btn")

  // Add click event listener to the login button
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      // Redirect to the sign-in page
      window.location.href = "signin.html"
    })
  }
  
  function checkIfAdmin() {
    // Trong ứng dụng thực tế, bạn sẽ kiểm tra session hoặc localStorage
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    
    // Hiển thị hoặc ẩn chỉ báo admin dựa trên vai trò người dùng
    const adminIndicator = document.querySelector('.admin-indicator-button');
    if (adminIndicator) {
        adminIndicator.style.display = isAdmin ? 'flex' : 'none';
    }
  }
})

