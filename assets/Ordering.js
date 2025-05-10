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

// Kết nối WebSocket
const socket = io('http://localhost:3000');

// Xác thực socket connection
socket.on('connect', () => {
    const token = localStorage.getItem('token');
    if (token) {
        socket.emit('authenticate', token);
    }
});

// Xử lý cập nhật trạng thái đơn hàng
socket.on('order_status_changed', (data) => {
    updateOrderStatus(data.orderId, data.status);
    showNotification('Cập nhật đơn hàng', `Đơn hàng của bạn đã được cập nhật: ${data.status}`);
});

// Xử lý tin nhắn từ admin
socket.on('admin_message', (message) => {
    showChatMessage(message);
    showNotification('Tin nhắn từ admin', message.content);
});

document.addEventListener("DOMContentLoaded", async () => {
    // Load cart from localStorage
    loadCart();
    updateCartUI();
    updateCartTotals();
    updateBasketUI();
  
    // Minimum order amount
    const minimumOrderAmount = 100000
  
    // Promo code claimed status
    let promoCodeClaimed = false
  
    // Fixed navigation elements
    const fixedNavContainer = document.querySelector(".fixed-nav-container")
    const basketSticky = document.getElementById("basket-sticky")
  
    // Update the cart toggle event listener
    const cartToggle = document.getElementById("cart-toggle")
    const cartDropdown = document.getElementById("cart-dropdown")
    const closeCart = document.getElementById("close-cart")
  
    cartToggle.addEventListener("click", function () {
      cartDropdown.classList.toggle("active")
      // Toggle the chevron icon
      const chevron = this.querySelector(".fa-chevron-down")
      if (chevron) {
        chevron.classList.toggle("fa-chevron-up")
      }
    })
  
    closeCart.addEventListener("click", () => {
      cartDropdown.classList.remove("active")
      // Reset the chevron icon
      const chevron = cartToggle.querySelector(".fa-chevron-down, .fa-chevron-up")
      if (chevron) {
        chevron.className = "fas fa-chevron-down"
      }
    })
  
    // Close cart when clicking outside
    document.addEventListener("click", (event) => {
      if (!cartToggle.contains(event.target) && !cartDropdown.contains(event.target)) {
        cartDropdown.classList.remove("active")
        // Reset the chevron icon
        const chevron = cartToggle.querySelector(".fa-chevron-down, .fa-chevron-up")
        if (chevron) {
          chevron.className = "fas fa-chevron-down"
        }
      }
    })
  
    // Category selection with animation and content change
    const categoryItems = document.querySelectorAll(".category-item")
    const menuCategories = document.querySelectorAll(".menu-category")
  
    categoryItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Remove selected class from all categories
        categoryItems.forEach((cat) => {
          cat.classList.remove("selected")
        })
  
        // Add selected class to clicked category with animation
        this.classList.add("selected")
        this.classList.add("pulse")
  
        // Remove animation class after it completes
        setTimeout(() => {
          this.classList.remove("pulse")
        }, 500)
  
        // Show corresponding menu items
        const category = this.getAttribute("data-category")
  
        // Hide all categories first
        menuCategories.forEach((cat) => {
          cat.classList.add("hidden")
        })
  
        // Show only the selected category
        document.getElementById(category).classList.remove("hidden")
      })
    })
  
    // Size selection
    const sizeButtons = document.querySelectorAll(".size-btn")
    sizeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Find all size buttons in this group
        const sizeGroup = this.closest(".size-options")
        sizeGroup.querySelectorAll(".size-btn").forEach((btn) => {
          btn.classList.remove("active")
        })
        // Add active class to clicked button
        this.classList.add("active")
      })
    })
  
    // Quantity control
    const minusButtons = document.querySelectorAll(".qty-btn.minus")
    const plusButtons = document.querySelectorAll(".qty-btn.plus")
  
    minusButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const qtyElement = this.nextElementSibling
        let qty = Number.parseInt(qtyElement.textContent)
        if (qty > 1) {
          qty--
          qtyElement.textContent = qty
        }
      })
    })
  
    plusButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const qtyElement = this.previousElementSibling
        let qty = Number.parseInt(qtyElement.textContent)
        qty++
        qtyElement.textContent = qty
      })
    })
  
    // Add to cart functionality with animation
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const menuItem = this.closest(".menu-item")
        const itemId = menuItem.getAttribute("data-item-id")
        const itemName = menuItem.querySelector("h4").textContent
        const itemCategory = menuItem.getAttribute("data-category")
        const itemImage = menuItem.querySelector(".item-image img").getAttribute("src")
  
        // Get selected size and price
        const activeSize = menuItem.querySelector(".size-btn.active")
        const size = activeSize.getAttribute("data-size")
        const price = Number.parseInt(activeSize.getAttribute("data-price"))
  
        // Get quantity
        const quantity = Number.parseInt(menuItem.querySelector(".qty").textContent)
  
        // Add to cart
        addItemToCart(itemId, itemName, itemCategory, size, price, quantity, itemImage)
  
        // Add animation class
        this.classList.add("added")
  
        // Change text temporarily
        const originalText = this.textContent
        this.textContent = "Added!"
  
        // Reset after animation
        setTimeout(() => {
          this.classList.remove("added")
          this.textContent = originalText
        }, 1500)
  
        // Show notification
        showNotification(`${itemName} added to basket!`)
      })
    })
  
    // Function to check minimum order
    function checkMinimumOrder() {
      const checkoutBtn = document.getElementById("checkout-btn")
      const minimumOrderWarning = document.getElementById("minimum-order-warning")
      const remainingAmount = document.querySelector(".remaining-amount")
  
      if (cart.subtotal < minimumOrderAmount) {
        // Disable checkout button
        checkoutBtn.classList.add("disabled")
        checkoutBtn.style.backgroundColor = "#ffb3b3"
  
        // Show warning
        minimumOrderWarning.style.display = "flex"
  
        // Update remaining amount
        const remaining = minimumOrderAmount - cart.subtotal
        remainingAmount.textContent = formatPrice(remaining)
      } else {
        // Enable checkout button
        checkoutBtn.classList.remove("disabled")
        checkoutBtn.style.backgroundColor = "#FF8A00"
  
        // Hide warning
        minimumOrderWarning.style.display = "none"
      }
    }
  
    // Function to check if free item is available
    function checkFreeItemAvailability() {
      const freeItemBtn = document.getElementById("choose-free-item")
  
      if (cart.subtotal >= 300000) {
        freeItemBtn.classList.add("active")
        freeItemBtn.disabled = false
      } else {
        freeItemBtn.classList.remove("active")
        freeItemBtn.disabled = true
  
        // Remove free item if exists
        if (cart.freeItem) {
          const freeItemIndex = cart.items.findIndex((item) => item.isFree)
          if (freeItemIndex !== -1) {
            cart.items.splice(freeItemIndex, 1)
            cart.freeItem = null
            updateCartUI()
            updateCartTotals()
          }
        }
      }
    }
  
    // Helper function to get category icon
    function getCategoryIcon(category) {
      const icons = {
        pizzas: "pizza-slice",
        "garlic-bread": "bread-slice",
        salads: "leaf",
        "cold-drinks": "glass-whiskey",
        desserts: "ice-cream",
        "hot-drinks": "mug-hot",
      }
  
      return icons[category] || "utensils"
    }
  
    // Helper function to format price
    function formatPrice(price) {
      return `${price.toLocaleString()}đ`
    }
  
    // Change location functionality
    const changeLocationBtn = document.getElementById("change-location")
    const locationModal = document.getElementById("location-modal")
    const closeLocationModal = document.getElementById("close-location-modal")
    const saveLocationBtn = document.getElementById("save-location-btn")
    const selectLocationBtns = document.querySelectorAll(".select-location-btn")
  
    changeLocationBtn.addEventListener("click", () => {
      locationModal.style.display = "flex"
    })
  
    closeLocationModal.addEventListener("click", () => {
      locationModal.style.display = "none"
    })
  
    saveLocationBtn.addEventListener("click", () => {
      const locationInput = document.getElementById("location-input")
      if (locationInput.value.trim() !== "") {
        document.querySelector(".promo-center span").textContent = locationInput.value
        showNotification("Location updated successfully!")
      }
      locationModal.style.display = "none"
    })
  
    selectLocationBtns.forEach((button) => {
      button.addEventListener("click", function () {
        const locationDetails = this.closest(".location-item").querySelector(".location-details p").textContent
        document.querySelector(".promo-center span").textContent = locationDetails
        locationModal.style.display = "none"
        showNotification("Location updated successfully!")
      })
    })
  
    // View Full Basket functionality
    const viewFullBasketBtn = document.getElementById("view-full-basket")
    viewFullBasketBtn.addEventListener("click", () => {
      cartDropdown.classList.remove("active")
      // Scroll to basket section
      const basketSection = document.getElementById("basket-sticky")
      basketSection.scrollIntoView({ behavior: "smooth" })
      // Highlight basket container
      basketSection.classList.add("highlight")
      setTimeout(() => {
        basketSection.classList.remove("highlight")
      }, 2000)
    })
  
    // Refresh orders functionality
    const refreshOrdersBtn = document.getElementById("refresh-orders")
    refreshOrdersBtn.addEventListener("click", function () {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...'
  
      // Simulate refreshing
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh'
        showNotification("Orders refreshed successfully!")
      }, 1500)
    })
  
    // Cancel order functionality
    const orderList = document.getElementById("order-list");
    orderList.addEventListener("click", function(e) {
      if (e.target.classList.contains("secondary") && e.target.textContent.trim() === "Cancel Order") {
        const orderItem = e.target.closest(".order-item");
        const orderNumber = orderItem.querySelector(".order-number").textContent.replace("Order #", "");
        // Cập nhật trạng thái trong orderHistory
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const historyIndex = orderHistory.findIndex(o => o.orderNumber == orderNumber);
        if (historyIndex !== -1) {
          orderHistory[historyIndex].status = 'cancelled';
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        }
        // Cập nhật trạng thái trong allOrders
        let allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const allIndex = allOrders.findIndex(o => o.orderNumber == orderNumber || o.id == orderNumber);
        if (allIndex !== -1) {
          allOrders[allIndex].status = 'cancelled';
          localStorage.setItem('allOrders', JSON.stringify(allOrders));
        }
        // Cập nhật giao diện
        renderOrderHistoryFromStorage();
        showNotification(`Order #${orderNumber} cancelled successfully!`);
      }
    });
  
    // Reorder functionality
    document.addEventListener("click", (event) => {
      if (
        (event.target.classList.contains("order-action-btn") && event.target.textContent.trim() === "Reorder") ||
        event.target.id === "reorder-btn"
      ) {
        const orderNumber =
          event.target.getAttribute("data-order") || document.getElementById("detail-order-number").textContent
  
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
        // Simulate reordering
        setTimeout(() => {
          event.target.innerHTML = "Reorder"
  
          // Add sample items to cart
          addItemToCart(
            "pizza-1",
            "Farm-House Supreme Pizza",
            "pizzas",
            "M",
            260000,
            1,
            "/placeholder.svg?height=100&width=100",
          )
          addItemToCart("cold-1", "Coca Cola", "cold-drinks", "500ml", 30000, 1, "/placeholder.svg?height=100&width=100")
  
          // Close modal if open
          if (document.getElementById("order-details-modal").style.display === "flex") {
            document.getElementById("order-details-modal").style.display = "none"
          }
  
          showNotification(`Order #${orderNumber} has been reordered!`)
        }, 1500)
      }
    })
  
    // Search functionality
    const searchInput = document.getElementById("menu-search")
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const menuItems = document.querySelectorAll(".menu-item")
  
      menuItems.forEach((item) => {
        const itemName = item.querySelector("h4").textContent.toLowerCase()
        const itemDescription = item.querySelector(".item-description").textContent.toLowerCase()
  
        if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
          item.style.display = "flex"
        } else {
          item.style.display = "none"
        }
      })
    })
  
    // Checkout button with animation
    const checkoutBtn = document.getElementById("checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (cart.items.length === 0) {
          showNotification("Your basket is empty")
          return
        }
  
        if (cart.subtotal < minimumOrderAmount) {
          showNotification("Minimum order amount not reached")
          return
        }
  
        this.classList.add("processing")
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
  
        // Simulate processing
        setTimeout(() => {
          this.classList.remove("processing")
          this.innerHTML = '<i class="fas fa-check"></i> Order Placed!'
  
          // Add to order history
          addToOrderHistory()
  
          // Reset cart
          cart.items = []
          cart.freeItem = null
          cart.appliedVoucher = null
          updateCartUI()
          updateCartTotals()
          updateBasketUI()
          checkMinimumOrder()
  
          // Reset after 2 seconds
          setTimeout(() => {
            this.innerHTML = '<i class="fas fa-arrow-right"></i> Checkout!'
            showNotification("Thank you for your order!")
          }, 2000)
        }, 1500)
      })
    }
  
    // Function to add to order history
    function addToOrderHistory() {
      // Generate a random order number
      const orderNumber = Math.floor(10000 + Math.random() * 90000)
  
      // Get current date and time
      const now = new Date()
      const dateOptions = { year: "numeric", month: "long", day: "numeric" }
      const timeOptions = { hour: "2-digit", minute: "2-digit" }
      const dateStr = now.toLocaleDateString("en-US", dateOptions)
      const timeStr = now.toLocaleTimeString("en-US", timeOptions)
      const dateTimeStr = `${dateStr} - ${timeStr}`
  
      // Create order item names string
      const itemNames = cart.items.map((item) => item.name).join(", ")
  
      // Create new order item
      const orderItem = document.createElement("div")
      orderItem.className = "order-item"
      orderItem.innerHTML = `
              <div class="order-item-header">
                  <span class="order-number">Order #${orderNumber}</span>
                  <span class="order-date">${dateTimeStr}</span>
              </div>
              <div class="order-summary-row">
                  <span>${cart.items.length} items</span>
                  <span class="order-status processing">Processing</span>
              </div>
              <div class="order-summary-row">
                  <span>${itemNames}</span>
                  <span class="order-total">${formatPrice(cart.total)}</span>
              </div>
              <div class="order-actions">
                  <button class="order-action-btn secondary" data-order="${orderNumber}">Cancel Order</button>
                  <button class="order-action-btn primary view-details-btn" data-order="${orderNumber}">View Details</button>
              </div>
          `
  
      // Add to order list
      const orderList = document.getElementById("order-list")
      orderList.insertBefore(orderItem, orderList.firstChild)
  
      // Add event listeners to new buttons
      const viewDetailsBtn = orderItem.querySelector(".view-details-btn")
      viewDetailsBtn.addEventListener("click", () => {
        showOrderDetails(
          orderNumber,
          dateTimeStr,
          "processing",
          itemNames,
          cart.subtotal,
          cart.serviceFee,
          cart.discount,
          cart.total,
        )
      })
  
      // Add event listener for Cancel Order button
      const cancelOrderBtn = orderItem.querySelector(".order-action-btn.secondary")
      cancelOrderBtn.addEventListener("click", function () {
        if (this.textContent.trim() === "Cancel Order") {
          const orderItem = this.closest(".order-item")
          const statusElement = orderItem.querySelector(".order-status")
  
          if (statusElement.textContent.toLowerCase() === "processing") {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
            // Simulate cancellation
            setTimeout(() => {
              statusElement.textContent = "Cancelled"
              statusElement.className = "order-status cancelled"
              this.textContent = "Reorder"
              showNotification(`Order #${orderNumber} cancelled successfully!`)
            }, 1500)
          }
        } else if (this.textContent.trim() === "Reorder") {
          this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
          // Simulate reordering
          setTimeout(() => {
            this.innerHTML = "Reorder"
  
            // Add sample items to cart
            addItemToCart(
              "pizza-1",
              "Farm-House Supreme Pizza",
              "pizzas",
              "M",
              260000,
              1,
              "/placeholder.svg?height=100&width=100",
            )
            addItemToCart(
              "cold-1",
              "Coca Cola",
              "cold-drinks",
              "500ml",
              30000,
              1,
              "/placeholder.svg?height=100&width=100",
            )
  
            showNotification(`Order #${orderNumber} has been reordered!`)
          }, 1500)
        }
      })
  
      // Tạo object đơn hàng mới
      const orderData = {
        orderNumber,
        dateTimeStr,
        itemsCount: cart.items.length,
        itemNames,
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          category: item.category
        })),
        subtotal: cart.subtotal,
        serviceFee: cart.serviceFee,
        discount: cart.discount,
        total: cart.total, // Lưu số, không format
        status: "processing"
      };
      // Lấy lịch sử cũ, thêm đơn mới vào đầu mảng
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.unshift(orderData);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      // Thêm vào allOrders cho admin
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      allOrders.unshift(orderData);
      localStorage.setItem('allOrders', JSON.stringify(allOrders));
      // Render lại lịch sử
      renderOrderHistoryFromStorage();
    }
  
    // Function to show order details
    function showOrderDetails(orderNumber, dateTime, status, items, subtotal, serviceFee, discount, total) {
      // Set order details in modal
      document.getElementById("detail-order-number").textContent = orderNumber
      document.getElementById("detail-order-date").textContent = dateTime
  
      const statusElement = document.getElementById("detail-order-status")
      statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1)
      statusElement.className = `order-status ${status}`
  
      document.getElementById("detail-subtotal").textContent = formatPrice(subtotal)
      document.getElementById("detail-service-fee").textContent = formatPrice(serviceFee)
      document.getElementById("detail-discount").textContent = `-${formatPrice(discount)}`
      document.getElementById("detail-total").textContent = formatPrice(total)
  
      // Show modal
      document.getElementById("order-details-modal").style.display = "flex"
    }
  
    // Order history tab functionality
    const orderTabs = document.querySelectorAll(".order-tab")
    orderTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        orderTabs.forEach((t) => t.classList.remove("active"))
  
        // Add active class to clicked tab
        this.classList.add("active")
  
        // Filter orders
        const tabType = this.getAttribute("data-tab")
        filterOrders(tabType)
      })
    })
  
    // Function to filter orders
    function filterOrders(type) {
      const orderItems = document.querySelectorAll(".order-item")
  
      orderItems.forEach((item) => {
        const statusElement = item.querySelector(".order-status")
        const status = statusElement.textContent.toLowerCase()
  
        if (type === "all" || status === type) {
          item.style.display = "block"
        } else {
          item.style.display = "none"
        }
      })
    }
  
    // Close order details modal
    document.getElementById("close-order-details").addEventListener("click", () => {
      document.getElementById("order-details-modal").style.display = "none"
    })
  
    document.getElementById("close-details-btn").addEventListener("click", () => {
      document.getElementById("order-details-modal").style.display = "none"
    })
  
    // Add event listeners to existing view details buttons
    const viewDetailsBtns = document.querySelectorAll(".view-details-btn")
    viewDetailsBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderNumber = this.getAttribute("data-order")
        const orderItem = this.closest(".order-item")
        const dateTime = orderItem.querySelector(".order-date").textContent
        const status = orderItem.querySelector(".order-status").textContent.toLowerCase()
        const total = orderItem.querySelector(".order-total").textContent
  
        // Show order details modal with sample data
        showOrderDetails(
          orderNumber,
          dateTime,
          status,
          "Sample items",
          Number.parseInt(total.replace(/\D/g, "")) * 0.85,
          Number.parseInt(total.replace(/\D/g, "")) * 0.05,
          Number.parseInt(total.replace(/\D/g, "")) * 0.1,
          Number.parseInt(total.replace(/\D/g, "")),
        )
      })
    })
  
    // Free item selection
    const chooseFreeItemBtn = document.getElementById("choose-free-item")
    const freeItemModal = document.getElementById("free-item-modal")
    const closeFreeItemModal = document.getElementById("close-free-item-modal")
    const selectFreeItemBtns = document.querySelectorAll(".select-free-item-btn")
    const cancelFreeItemBtn = document.getElementById("cancel-free-item-btn")
  
    chooseFreeItemBtn.addEventListener("click", () => {
      if (cart.subtotal >= 300000) {
        freeItemModal.style.display = "flex"
      } else {
        showNotification("Free items available with orders over 300.000đ")
      }
    })
  
    closeFreeItemModal.addEventListener("click", () => {
      freeItemModal.style.display = "none"
    })
  
    selectFreeItemBtns.forEach((button) => {
      button.addEventListener("click", function () {
        const freeItemId = this.getAttribute("data-id")
        const freeItemName = this.getAttribute("data-name")
        const freeItemPrice = Number.parseInt(this.getAttribute("data-price"))
  
        // Remove existing free item if any
        const existingFreeItemIndex = cart.items.findIndex((item) => item.isFree)
        if (existingFreeItemIndex !== -1) {
          cart.items.splice(existingFreeItemIndex, 1)
        }
  
        // Add new free item
        let category = "cold-drinks"
        if (freeItemId === "free-fries") {
          category = "garlic-bread"
        } else if (freeItemId === "free-icecream") {
          category = "desserts"
        }
  
        addItemToCart(
          freeItemId,
          freeItemName,
          category,
          "Regular",
          freeItemPrice,
          1,
          "/placeholder.svg?height=80&width=80",
          true,
        )
  
        cart.freeItem = freeItemId
        freeItemModal.style.display = "none"
        showNotification(`${freeItemName} added as a free item!`)
      })
    })
  
    cancelFreeItemBtn.addEventListener("click", () => {
      freeItemModal.style.display = "none"
    })
  
    // Promo code functionality
    const promoCodeElement = document.getElementById("promo-code")
    const promoModal = document.getElementById("promo-modal")
    const closePromoModal = document.getElementById("close-promo-modal")
    const claimPromoBtn = document.getElementById("claim-promo-btn")
    const copyCodeBtn = document.getElementById("copy-code-btn")
  
    promoCodeElement.addEventListener("click", () => {
      if (!promoCodeClaimed) {
        promoModal.style.display = "flex"
      }
    })
  
    closePromoModal.addEventListener("click", () => {
      promoModal.style.display = "none"
    })
  
    claimPromoBtn.addEventListener("click", () => {
      promoCodeClaimed = true
      promoCodeElement.innerHTML = 'Promo: ORDERS <i class="fas fa-check-circle"></i>'
      promoCodeElement.classList.add("claimed")
      promoModal.style.display = "none"
      showNotification("Promo code claimed successfully!")
    })
  
    copyCodeBtn.addEventListener("click", function () {
      navigator.clipboard.writeText("ORDERS")
      this.innerHTML = '<i class="fas fa-check"></i> Copied!'
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-copy"></i> Copy'
      }, 2000)
    })
  
    // Vouchers functionality
    const applyCouponBtn = document.getElementById("apply-coupon")
    const vouchersModal = document.getElementById("vouchers-modal")
    const closeVouchersModal = document.getElementById("close-vouchers-modal")
    const applyVoucherBtns = document.querySelectorAll(".apply-voucher-btn")
  
    applyCouponBtn.addEventListener("click", () => {
      vouchersModal.style.display = "flex"
    })
  
    closeVouchersModal.addEventListener("click", () => {
      vouchersModal.style.display = "none"
    })
  
    applyVoucherBtns.forEach((button) => {
      button.addEventListener("click", function () {
        const voucherCode = this.getAttribute("data-code")
        vouchersModal.style.display = "none"
  
        // Apply voucher logic
        if (voucherCode === "ORDERS" && promoCodeClaimed) {
          cart.appliedVoucher = {
            code: "ORDERS",
            type: "percentage",
            value: 5,
          }
          updateCartTotals()
          checkMinimumOrder()
          showNotification("5% discount applied successfully!")
        } else if (voucherCode === "WEEKEND10") {
          cart.appliedVoucher = {
            code: "WEEKEND10",
            type: "percentage",
            value: 10,
          }
          updateCartTotals()
          checkMinimumOrder()
          showNotification("10% weekend discount applied successfully!")
        } else if (voucherCode === "BIG50K" && cart.subtotal >= 500000) {
          cart.appliedVoucher = {
            code: "BIG50K",
            type: "fixed",
            value: 50000,
          }
          updateCartTotals()
          checkMinimumOrder()
          showNotification("50K discount applied successfully!")
        } else if (voucherCode === "BIG50K" && cart.subtotal < 500000) {
          showNotification("This voucher requires a minimum order of 500.000đ")
        } else {
          showNotification("This voucher cannot be applied to your current order")
        }
      })
    })
  
    // Helper function to show notification
    function showNotification(title, message) {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: 'image/logo.png'
            });
          }
        });
      }

      // Hiển thị toast notification
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.innerHTML = `
        <div class="toast-header">
          <strong>${title}</strong>
          <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">${message}</div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    }
  
    // Initialize minimum order check
    checkMinimumOrder()
  
    // Initialize free item availability check
    checkFreeItemAvailability()

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

    let foods = [];
    try {
      const res = await fetch('http://localhost:5000/api/foods');
      foods = await res.json();
    } catch (e) {
      // fallback sample data nếu fetch lỗi
      foods = [
        { id: "combo-1", name: "Mixed Tropical Fruit Salad", price: 120000, category: "all", image: "../image/Combo_1.png", rating: 4.8, reviews: 74 },
        // ... các món mẫu khác ...
      ];
    }
    // Phân trang foods trên client, render ra giao diện như cũ
    // ...

    // Initialize cart UI
    updateCartUI();
    updateCartTotals();
    updateCartCount();

    // 1. Khi load trang, đọc lịch sử đơn hàng từ localStorage và render lại
    renderOrderHistoryFromStorage();

    // Thêm hiệu ứng loading cho các nút
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => this.classList.remove('loading'), 1000);
            }
        });
    });

    // Thêm hiệu ứng hover cho menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
})
  
// Add this code after the existing pagination-related code in your script.js file
  
// Pagination functionality
document.addEventListener("DOMContentLoaded", () => {
    const pageBtns = document.querySelectorAll(".page-btn")
    const menuPages = document.querySelectorAll(".menu-page")
  
    pageBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        // Get the page number from the button
        const pageNum = this.getAttribute("data-page")
  
        // Remove active class from all buttons
        pageBtns.forEach((btn) => {
          btn.classList.remove("active")
        })
  
        // Add active class to clicked button
        this.classList.add("active")
  
        // Hide all pages
        menuPages.forEach((page) => {
          page.classList.remove("active")
        })
  
        // Show the selected page
        const currentCategory = document.querySelector(".menu-category:not(.hidden)")
        if (currentCategory) {
          const targetPage = currentCategory.querySelector(`.menu-page[data-page="${pageNum}"]`)
          if (targetPage) {
            targetPage.classList.add("active")
          }
        }
  
        // Add bounce animation
        this.classList.add("bounce")
        setTimeout(() => {
          this.classList.remove("bounce")
        }, 500)
      })
    })
})
  
// 1. Khi load trang, đọc lịch sử đơn hàng từ localStorage và render lại
function renderOrderHistoryFromStorage() {
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.forEach(order => {
      const orderItem = document.createElement("div");
      orderItem.className = "order-item";
      orderItem.innerHTML = `
        <div class="order-item-header">
          <span class="order-number">Order #${order.orderNumber}</span>
          <span class="order-date">${order.dateTimeStr}</span>
        </div>
        <div class="order-summary-row">
          <span>${order.itemsCount} items</span>
          <span class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </div>
        <div class="order-summary-row">
          <span>${order.itemNames}</span>
          <span class="order-total">${order.total}</span>
        </div>
        <div class="order-actions">
          <button class="order-action-btn secondary" data-order="${order.orderNumber}">Cancel Order</button>
          <button class="order-action-btn primary view-details-btn" data-order="${order.orderNumber}">View Details</button>
        </div>
      `;
      orderList.appendChild(orderItem);
    });
}
  
// Hàm cập nhật trạng thái đơn hàng
function updateOrderStatus(orderId, status) {
    const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
    if (orderElement) {
        const statusBadge = orderElement.querySelector('.order-status');
        statusBadge.textContent = status;
        statusBadge.className = `order-status badge ${getStatusClass(status)}`;
    }
}

// Hàm lấy class CSS cho trạng thái
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'completed': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
}

// Hàm gửi đơn hàng
async function submitOrder(orderData) {
    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            // Gửi thông báo qua WebSocket
            socket.emit('new_order', data);
            showNotification('Thành công', 'Đơn hàng của bạn đã được đặt thành công');
            return data;
        } else {
            throw new Error(data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Lỗi', 'Không thể đặt đơn hàng');
        throw error;
    }
}

// Hàm gửi tin nhắn cho admin
function sendMessageToAdmin(message) {
    socket.emit('chat_message', {
        content: message,
        timestamp: new Date().toISOString()
    });
}

// Thêm CSS cho notifications và animations
const style = document.createElement('style');
style.textContent = `
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .order-item {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }

    .order-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .order-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.875rem;
        transition: all 0.3s ease;
    }

    .btn {
        transition: all 0.3s ease;
    }

    .btn:hover {
        transform: translateY(-2px);
    }

    .menu-item {
        transition: all 0.3s ease;
    }

    .menu-item:hover {
        transform: scale(1.02);
    }

    .cart-item {
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
  
  