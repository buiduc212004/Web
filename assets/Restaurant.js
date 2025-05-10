import {
  cart,
  loadCart,
  saveCart,
  addItemToCart,
  removeItemFromCart,
  updateCartUI,
  updateCartTotals,
  getCategoryIcon,
  formatPrice,
  updateBasketUI
} from './cart.js';

// Load cart from localStorage and update UI immediately
loadCart();
updateCartUI();
updateCartTotals();
updateBasketUI();

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
  // Phân trang foods trên client, render ra giao diện như cũ
  // ...

  // Minimum order amount
  const minimumOrderAmount = 100000

  // Promo code claimed status
  let promoCodeClaimed = false

  // Food items data for pagination
  const foodPages = {
    pizza: [
      [
        {
          id: "pizza-1",
          name: "Margherita Pizza",
          price: 120000,
          category: "pizza",
          image: "../image/Combo_1.png",
          rating: 4.8,
          reviews: 74,
        },
        {
          id: "pizza-2",
          name: "Pepperoni Pizza",
          price: 150000,
          category: "pizza",
          image: "../image/combo_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "pizza-3",
          name: "Vegetarian Pizza",
          price: 110000,
          category: "pizza",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
      ],
    ],
    salads: [
      [
        {
          id: "salad-1",
          name: "Caesar Salad",
          price: 85000,
          category: "salads",
          image: "../image/Combo_1.png",
          rating: 4.6,
          reviews: 62,
        },
        {
          id: "salad-2",
          name: "Greek Salad",
          price: 95000,
          category: "salads",
          image: "../image/combo_2.png",
          rating: 4.7,
          reviews: 58,
        },
        {
          id: "salad-3",
          name: "Cobb Salad",
          price: 105000,
          category: "salads",
          image: "../image/combo_3.png",
          rating: 4.5,
          reviews: 50,
        },
      ],
    ],
    burgers: [
      [
        {
          id: "burger-1",
          name: "Classic Cheeseburger",
          price: 110000,
          category: "burgers",
          image: "../image/Combo_1.png",
          rating: 4.8,
          reviews: 70,
        },
        {
          id: "burger-2",
          name: "Bacon Burger",
          price: 130000,
          category: "burgers",
          image: "../image/combo_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "burger-3",
          name: "Veggie Burger",
          price: 100000,
          category: "burgers",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
      ],
      [
        {
          id: "burger-3",
          name: "Veggie Burger",
          price: 100000,
          category: "burgers",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
        {
          id: "burger-3",
          name: "Veggie Burger",
          price: 100000,
          category: "burgers",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
        {
          id: "burger-3",
          name: "Veggie Burger",
          price: 100000,
          category: "burgers",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
        },
      ],
    ],
    cold: [
      [
        {
          id: "drink-1",
          name: "Pink Drink",
          price: 50000,
          category: "cold",
          image: "../image/drink_1.png",
          rating: 4.8,
          reviews: 74,
        },
        {
          id: "drink-2",
          name: "Lemonade",
          price: 45000,
          category: "cold",
          image: "../image/drink_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "drink-3",
          name: "Iced Tea",
          price: 40000,
          category: "cold",
          image: "../image/drink_3.png",
          rating: 4.7,
          reviews: 55,
        },
      ],
      [
        {
          id: "drink-4",
          name: "Milk Tea",
          price: 55000,
          category: "cold",
          image: "../image/drink_4.png",
          rating: 4.6,
          reviews: 62,
        },
        {
          id: "drink-5",
          name: "Beer",
          price: 60000,
          category: "cold",
          image: "../image/drink_5.png",
          rating: 4.7,
          reviews: 58,
        },
        {
          id: "drink-6",
          name: "Smoothie",
          price: 65000,
          category: "cold",
          image: "../image/drink_5.png",
          rating: 4.5,
          reviews: 50,
        },
      ],
    ],
    hot: [
      [
        {
          id: "drink-7",
          name: "Hot Coffee",
          price: 45000,
          category: "hot",
          image: "../image/drink_1.png",
          rating: 4.8,
          reviews: 70,
        },
        {
          id: "drink-8",
          name: "Hot Chocolate",
          price: 50000,
          category: "hot",
          image: "../image/drink_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "drink-9",
          name: "Hot Tea",
          price: 35000,
          category: "hot",
          image: "../image/drink_3.png",
          rating: 4.7,
          reviews: 55,
        },
      ],
    ],
    desserts: [
      [
        {
          id: "dessert-1",
          name: "Chocolate Cake",
          price: 65000,
          category: "desserts",
          image: "../image/Combo_1.png",
          rating: 4.8,
          reviews: 70,
        },
        {
          id: "dessert-2",
          name: "Cheesecake",
          price: 70000,
          category: "desserts",
          image: "../image/combo_2.png",
          rating: 4.9,
          reviews: 65,
        },
        {
          id: "dessert-3",
          name: "Ice Cream",
          price: 45000,
          category: "desserts",
          image: "../image/combo_3.png",
          rating: 4.7,
          reviews: 55,
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
    pizza: [
      {
        code: "PIZZA25",
        discount: 25,
        type: "percentage",
        minOrder: 200000,
        description: "25% off on pizza orders over 200.000đ",
      },
      {
        code: "PIZZAMANIA",
        discount: 100000,
        type: "fixed",
        minOrder: 350000,
        description: "100.000đ off on pizza orders over 350.000đ",
      },
    ],
    salads: [
      {
        code: "SALAD15",
        discount: 15,
        type: "percentage",
        minOrder: 100000,
        description: "15% off on salad orders over 100.000đ",
      },
      {
        code: "HEALTHYEATS",
        discount: 30000,
        type: "fixed",
        minOrder: 150000,
        description: "30.000đ off on salad orders over 150.000đ",
      },
    ],
    cold: [
      {
        code: "DRINKS20",
        discount: 20,
        type: "percentage",
        minOrder: 120000,
        description: "20% off on cold drinks over 120.000đ",
      },
      {
        code: "COOLDRINKS",
        discount: 25000,
        type: "fixed",
        minOrder: 100000,
        description: "25.000đ off on cold drinks over 100.000đ",
      },
    ],
    burgers: [
      {
        code: "BURGER30",
        discount: 30,
        type: "percentage",
        minOrder: 180000,
        description: "30% off on burger orders over 180.000đ",
      },
      {
        code: "BURGERFEAST",
        discount: 50000,
        type: "fixed",
        minOrder: 200000,
        description: "50.000đ off on burger orders over 200.000đ",
      },
    ],
  }

  // Current category and page
  let currentCategory = "pizza"
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
  const categoryTabs = document.querySelectorAll(".category-tabs .tab-btn")
  const secondaryTabs = document.querySelectorAll(".secondary-tabs .tab-btn")
  const pageBtns = document.querySelectorAll(".pagination .page-btn")
  const productsGrid = document.querySelector(".products-grid")
  const selectLocationBtns = document.querySelectorAll(".select-location-btn")
  const searchInput = document.querySelector(".search-input")
  const sectionTitle = document.querySelector(".section-title")
  const voucherContainer = document.querySelector(".voucher-container")
  const claimAllBtn = document.getElementById("claim-all-btn")

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

    // View full basket
    viewFullBasket.addEventListener("click", viewBasket)

    // Category selection
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", switchMainCategory)
    })

    // Secondary tabs
    secondaryTabs.forEach((tab) => {
      tab.addEventListener("click", switchSecondaryCategory)
    })

    // Pagination
    pageBtns.forEach((btn) => {
      btn.addEventListener("click", changePage)
    })

    // Search functionality
    searchInput.addEventListener("input", searchProducts)

    // Add to cart buttons (will be added dynamically)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-btn") || e.target.closest(".add-btn")) {
        const button = e.target.classList.contains("add-btn") ? e.target : e.target.closest(".add-btn")
        const productCard = button.closest(".product-card")
        const productName = productCard.querySelector("h3").textContent
        const productPrice = Number.parseInt(productCard.querySelector(".price").textContent.replace(/\D/g, ""))
        const productId = `product-${Date.now()}`

        addItemToCart(
          productId,
          productName,
          currentCategory,
          "Regular",
          productPrice,
          1,
          productCard.querySelector("img").src,
        )
        updateBasketUI()
      }
    })

    // Promo banners
    document.querySelectorAll(".promo-card").forEach((card) => {
      card.addEventListener("click", () => {
        const discountTag = card.querySelector(".discount-tag").textContent
        const promoTitle = card.querySelector("h3").textContent
        showNotification(`${promoTitle} (${discountTag}) applied to your next order!`)
      })
    })

    // Claim all vouchers button
    if (claimAllBtn) {
      claimAllBtn.addEventListener("click", claimAllVouchers)
    }

    // Voucher claim buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("claim-voucher-btn")) {
        const voucherCard = e.target.closest(".voucher-card")
        const voucherCode = voucherCard.querySelector(".voucher-code").textContent
        const voucherDiscount = voucherCard.querySelector(".voucher-discount").textContent

        e.target.textContent = "Claimed"
        e.target.classList.add("claimed")
        e.target.disabled = true

        showNotification(`Voucher ${voucherCode} claimed successfully!`)

        setTimeout(() => {
          e.target.textContent = "Claim"
          e.target.classList.remove("claimed")
          e.target.disabled = false
        }, 3000)
      }
    })
  }

  // Initialize the page
  function initializePage() {
    // Load first page of default category
    loadProducts(currentCategory, 1)
    updateSectionTitle(currentCategory)
    loadVouchers(currentCategory)
    setupEventListeners()
  }

  // Update section title
  function updateSectionTitle(category) {
    let title = ""
    switch (category) {
      case "pizza":
        title = "Pizza"
        break
      case "salads":
        title = "Fresh Salads"
        break
      case "burgers":
        title = "Burgers"
        break
      case "cold":
        title = "Cold Drinks"
        break
      case "hot":
        title = "Hot Drinks"
        break
      case "desserts":
        title = "Desserts"
        break
      default:
        title = "Menu Items"
    }

    if (sectionTitle) {
      sectionTitle.textContent = title
    }
  }

  // Load vouchers for category
  function loadVouchers(category) {
    if (!voucherContainer) return

    voucherContainer.innerHTML = ""

    const categoryVouchers = vouchers[category] || []

    if (categoryVouchers.length === 0) {
      voucherContainer.innerHTML = "<p class='no-vouchers'>No vouchers available for this category.</p>"
      return
    }

    categoryVouchers.forEach((voucher) => {
      const voucherCard = document.createElement("div")
      voucherCard.className = "voucher-card"

      let discountText = ""
      if (voucher.type === "percentage") {
        discountText = `${voucher.discount}% OFF`
      } else {
        discountText = `${formatPrice(voucher.discount)} OFF`
      }

      voucherCard.innerHTML = `
          <div class="voucher-header">
            <span class="voucher-code">${voucher.code}</span>
            <span class="voucher-discount">${discountText}</span>
          </div>
          <div class="voucher-body">
            <p>${voucher.description}</p>
            <p class="min-order">Min. Order: ${formatPrice(voucher.minOrder)}</p>
          </div>
          <button class="claim-voucher-btn">Claim</button>
        `

      voucherContainer.appendChild(voucherCard)
    })
  }

  // Claim all vouchers
  function claimAllVouchers() {
    const claimButtons = document.querySelectorAll(".claim-voucher-btn:not(.claimed)")

    if (claimButtons.length === 0) {
      showNotification("No vouchers available to claim")
      return
    }

    claimButtons.forEach((button) => {
      button.click()
    })

    claimAllBtn.textContent = "All Claimed!"
    claimAllBtn.disabled = true

    setTimeout(() => {
      claimAllBtn.textContent = "Claim All"
      claimAllBtn.disabled = false
    }, 3000)
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

  // View full basket
  function viewBasket() {
    closeCartDropdown()
    // Redirect to ordering page with basket view
    window.location.href = "Ordering.html"
  }

  // Switch main category
  function switchMainCategory() {
    // Remove active class from all categories
    categoryTabs.forEach((tab) => tab.classList.remove("active"))

    // Add active class to clicked category
    this.classList.add("active")

    // Get category name
    const categoryText = this.textContent.trim().toLowerCase()

    // Map category text to category key
    if (categoryText === "pizza") {
      currentCategory = "pizza"
    } else if (categoryText === "salads") {
      currentCategory = "salads"
    } else if (categoryText === "cold drinks") {
      currentCategory = "cold"
    } else if (categoryText === "desserts") {
      currentCategory = "desserts"
    } else if (categoryText === "hot drinks") {
      currentCategory = "hot"
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

    // Update section title
    updateSectionTitle(currentCategory)

    // Load vouchers for this category
    loadVouchers(currentCategory)

    // Load items for this category
    loadProducts(currentCategory, 1)

    // Show notification
    showNotification(`Showing ${categoryText} menu items`)
  }

  // Switch secondary category
  function switchSecondaryCategory() {
    // Remove active class from all categories
    secondaryTabs.forEach((tab) => tab.classList.remove("active"))

    // Add active class to clicked category
    this.classList.add("active")

    // Get category name
    const categoryText = this.textContent.trim().toLowerCase()

    // Map category text to category key
    if (categoryText === "burgers") {
      currentCategory = "burgers"
    } else if (categoryText === "salads") {
      currentCategory = "salads"
    } else if (categoryText === "cold drinks") {
      currentCategory = "cold"
    } else if (categoryText === "desserts") {
      currentCategory = "desserts"
    } else if (categoryText === "hot drinks") {
      currentCategory = "hot"
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

    // Update section title
    updateSectionTitle(currentCategory)

    // Load vouchers for this category
    loadVouchers(currentCategory)

    // Load items for this category
    loadProducts(currentCategory, 1)

    // Show notification
    showNotification(`Showing ${categoryText} menu items`)
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
    loadProducts(currentCategory, currentPage)

    // Add bounce animation
    this.classList.add("bounce")
    setTimeout(() => {
      this.classList.remove("bounce")
    }, 500)
  }

  // Search products
  function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim()

    if (searchTerm === "") {
      loadProducts(currentCategory, currentPage)
      return
    }

    // Search across all categories and pages
    const allProducts = []
    for (const category in foodPages) {
      if (foodPages[category]) {
        foodPages[category].forEach((page) => {
          if (page) {
            page.forEach((product) => {
              if (product.name.toLowerCase().includes(searchTerm)) {
                allProducts.push(product)
              }
            })
          }
        })
      }
    }

    // Display search results
    displaySearchResults(allProducts)
  }

  // Display search results
  function displaySearchResults(products) {
    productsGrid.innerHTML = ""

    if (products.length === 0) {
      productsGrid.innerHTML = "<p class='no-results'>No products found matching your search.</p>"
      return
    }

    products.forEach((product) => {
      const productCard = createProductCard(product)
      productsGrid.appendChild(productCard)
    })

    // Hide pagination for search results
    document.querySelector(".pagination").style.display = "none"
  }

  // Load products
  function loadProducts(category, page) {
    // Show pagination
    document.querySelector(".pagination").style.display = "flex"

    // Clear current items
    productsGrid.innerHTML = ""

    // Get items for this category and page
    const items = foodPages[category] && foodPages[category][page - 1]

    if (!items) {
      productsGrid.innerHTML = "<p class='no-results'>No items found for this category.</p>"
      return
    }

    // Create cards for each item
    items.forEach((item) => {
      const productCard = createProductCard(item)
      productsGrid.appendChild(productCard)
    })
  }

  // Create product card
  function createProductCard(item) {
    const card = document.createElement("div")
    card.className = "product-card"
    card.innerHTML = `
        <div class="product-image">
          <img src="${item.image}" alt="${item.name}">
          <button class="add-btn"><i class="fas fa-plus"></i></button>
        </div>
        <div class="product-info">
          <h3>${item.name}</h3>
          <p class="price">${formatPrice(item.price)}</p>
        </div>
      `
    return card
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
      const eligibleVouchers = vouchers[currentCategory] || vouchers.all
      if (eligibleVouchers) {
        const filtered = eligibleVouchers.filter((v) => cart.subtotal >= v.minOrder)

        if (filtered.length > 0 && !cart.appliedVoucher) {
          const bestVoucher = filtered.reduce((best, current) => {
            const bestValue = best.type === "percentage" ? (cart.subtotal * best.discount) / 100 : best.discount

            const currentValue =
              current.type === "percentage" ? (cart.subtotal * current.discount) / 100 : current.discount

            return currentValue > bestValue ? current : best
          }, filtered[0])

          showNotification(`You're eligible for voucher ${bestVoucher.code}: ${bestVoucher.description}`)
        }
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

    updateCartTotals()
    saveCart()
    updateBasketUI()
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