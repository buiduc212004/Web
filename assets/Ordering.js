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

// Import hàm lấy ảnh từ API
import { getMainImage, displayImage } from './image-utils.js';

// Kết nối WebSocket
const socket = io('http://localhost:5000');

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
  try {
    // Load cart from localStorage
    loadCart();
    updateCartUI();
    updateCartTotals();
    updateBasketUI();
    
    // Lấy ảnh từ API cho tất cả các món ăn
    loadImagesFromAPI();
  
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
  
    if (cartToggle && cartDropdown && closeCart) {
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
    }
  
    // Category selection with animation and content change
    const categoryItems = document.querySelectorAll(".category-item")
    const menuCategories = document.querySelectorAll(".menu-category")
  
    if (categoryItems.length > 0 && menuCategories.length > 0) {
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
          const categoryElement = document.getElementById(category);
          if (categoryElement) {
            categoryElement.classList.remove("hidden")
          }
        })
      })
    }
  
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
            "../image/pizza_1.png",
          )
          addItemToCart("cold-1", "Coca Cola", "cold-drinks", "500ml", 30000, 1, "../image/cold_drink_1.png")
  
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
        try {
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
        } catch (error) {
          console.error("Error during checkout:", error);
          showNotification("Error during checkout", "Please try again later.");
        }
      })
    }
  
    // Function to add order to history
    function addToOrderHistory() {
      try {
        // Create a new order
        const now = new Date();
        const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        // Calculate totals
        const subtotal = cart.subtotal;
        const serviceFee = cart.serviceFee;
        const discount = cart.discount;
        const total = cart.total;

        // Create order items from cart
        const items = cart.items.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          isFree: item.isFree || false
        }));

        // Create order object
        const order = {
          id: orderNumber,
          orderNumber: orderNumber,
          dateTime: now.toISOString(),
          status: 'pending',
          items: items,
          subtotal: subtotal,
          serviceFee: serviceFee,
          discount: discount,
          total: total
        };

        // Attempt to get existing order history
        let orderHistory = [];
        try {
          const existingHistory = localStorage.getItem('orderHistory');
          if (existingHistory) {
            orderHistory = JSON.parse(existingHistory);
          }
        } catch (err) {
          console.error('Error parsing order history:', err);
          orderHistory = [];
        }

        // Add new order to history
        orderHistory.push(order);

        // Save updated history to localStorage
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        // Update all orders
        let allOrders = [];
        try {
          const existingOrders = localStorage.getItem('allOrders');
          if (existingOrders) {
            allOrders = JSON.parse(existingOrders);
          }
        } catch (err) {
          console.error('Error parsing all orders:', err);
          allOrders = [];
        }

        allOrders.push(order);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));

        // Submit order to server if available
        try {
          submitOrder(order);
        } catch (err) {
          console.error('Error submitting order to server:', err);
        }

        // Render the updated order history
        renderOrderHistoryFromStorage();

        return order;
      } catch (error) {
        console.error('Error adding order to history:', error);
        showNotification('Error adding order', 'An error occurred while processing your order. Please try again.');
        return null;
      }
    }
  
    // Submit order to server
    async function submitOrder(orderData) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('User not logged in, storing order locally only');
          return;
        }

        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Order submitted successfully:', result);
        return result;
      } catch (error) {
        console.error('Error submitting order:', error);
        // Proceed anyway since we've stored the order locally
      }
    }
  
    // Function to show order details
    function showOrderDetails(orderNumber, dateTime, status, items, subtotal, serviceFee, discount, total) {
      try {
        // Get the modal
        const modal = document.getElementById("order-details-modal");
        if (!modal) return;

        // Format date if needed
        let formattedDate = dateTime;
        if (typeof dateTime === 'string' && dateTime.includes('T')) {
          try {
            const date = new Date(dateTime);
            const dateOptions = { year: "numeric", month: "long", day: "numeric" };
            const timeOptions = { hour: "2-digit", minute: "2-digit" };
            const dateStr = date.toLocaleDateString("en-US", dateOptions);
            const timeStr = date.toLocaleTimeString("en-US", timeOptions);
            formattedDate = `${dateStr} - ${timeStr}`;
          } catch (err) {
            console.error('Error formatting date:', err);
          }
        }

        // Set order details
        document.getElementById("detail-order-number").textContent = orderNumber;
        document.getElementById("detail-order-date").textContent = formattedDate;
        document.getElementById("detail-order-status").textContent = status;
        document.getElementById("detail-order-status").className = `detail-status ${getStatusClass(status)}`;

        // Set up reorder/cancel button
        const actionBtn = document.getElementById("secondary-action-btn");
        if (status === "pending" || status === "processing") {
          actionBtn.textContent = "Cancel Order";
          actionBtn.className = "btn btn-secondary";
        } else {
          actionBtn.textContent = "Reorder";
          actionBtn.className = "btn btn-primary";
        }
        actionBtn.setAttribute("data-order", orderNumber);

        // Reset item list
        const itemList = document.getElementById("detail-items");
        itemList.innerHTML = "";

        // Add items to list
        if (Array.isArray(items)) {
          items.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "detail-item";
            
            const name = typeof item === 'object' ? item.name : item;
            const quantity = typeof item === 'object' ? item.quantity : 1;
            const price = typeof item === 'object' ? item.price * item.quantity : 0;
            const size = typeof item === 'object' ? item.size : '';
            
            itemElement.innerHTML = `
              <div class="item-info">
                <span class="item-name">${name} ${size ? `(${size})` : ''}</span>
                <span class="item-quantity">x${quantity}</span>
              </div>
              <span class="item-price">${formatPrice(price)}</span>
            `;
            itemList.appendChild(itemElement);
          });
        } else if (typeof items === 'string') {
          // Handle legacy format where items might be a comma-separated string
          const itemNames = items.split(',');
          itemNames.forEach(name => {
            const itemElement = document.createElement("div");
            itemElement.className = "detail-item";
            itemElement.innerHTML = `
              <div class="item-info">
                <span class="item-name">${name.trim()}</span>
                <span class="item-quantity">x1</span>
              </div>
              <span class="item-price">-</span>
            `;
            itemList.appendChild(itemElement);
          });
        }

        // Set totals
        document.getElementById("detail-subtotal").textContent = formatPrice(subtotal);
        document.getElementById("detail-service-fee").textContent = formatPrice(serviceFee);
        document.getElementById("detail-discount").textContent = `-${formatPrice(discount)}`;
        document.getElementById("detail-total").textContent = formatPrice(total);

        // Show the modal
        modal.style.display = "flex";

        // Add click event to close button
        document.querySelector(".close-details").addEventListener("click", () => {
          modal.style.display = "none";
        });

        // Add click event to tracking button
        document.getElementById("track-order-btn").addEventListener("click", () => {
          // Replace this with actual tracking logic
          showNotification("Tracking Order", `Tracking information for Order #${orderNumber} will be available soon!`);
        });
      } catch (error) {
        console.error('Error showing order details:', error);
        showNotification('Error showing details', 'Could not load order details. Please try again.');
      }
    }
  
    // Helper function to get status class
    function getStatusClass(status) {
      const statusMap = {
        'pending': 'processing',
        'processing': 'processing',
        'completed': 'completed',
        'delivered': 'completed',
        'cancelled': 'cancelled',
        'refunded': 'cancelled'
      };
      
      return statusMap[status.toLowerCase()] || 'processing';
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

    // Hàm để tải ảnh từ API cho tất cả các món ăn trên trang
    function loadImagesFromAPI() {
      // Lấy tất cả hình ảnh món ăn trong trang
      const menuItems = document.querySelectorAll('.menu-item');
      
      menuItems.forEach(item => {
        const itemId = item.getAttribute('data-item-id').replace(/[^\d]/g, '');
        const imgElement = item.querySelector('.item-image img');
        
        if (imgElement) {
          // Lưu đường dẫn ảnh hiện tại làm fallback
          const currentSrc = imgElement.src;
          
          // Thay bằng ảnh loading trước
          imgElement.src = '../image/loading.png';
          
          // Lấy ảnh từ API
          getMainImage('Food', itemId, (imageUrl) => {
            imgElement.src = imageUrl;
          }, currentSrc); // Sử dụng ảnh hiện tại làm fallback
        }
      });
    }
  } catch (error) {
    console.error("Error initializing Ordering page:", error);
    showNotification("Error loading page", "Please refresh the page and try again.");
  }
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
  
// Render order history from localStorage
function renderOrderHistoryFromStorage() {
  try {
    const orderList = document.getElementById("order-list");
    if (!orderList) return;

    // Get stored orders
    let orderHistory = [];
    try {
      const storedHistory = localStorage.getItem('orderHistory');
      if (storedHistory) {
        orderHistory = JSON.parse(storedHistory);
      }
    } catch (err) {
      console.error('Error parsing order history:', err);
      orderHistory = [];
    }

    // Clear current list
    orderList.innerHTML = '';

    // If no orders, show empty state
    if (orderHistory.length === 0) {
      orderList.innerHTML = `
        <div class="empty-orders">
          <i class="fas fa-receipt"></i>
          <p>You have no orders yet</p>
          <button class="btn-primary browse-menu">Browse Menu</button>
        </div>
      `;
      const browseMenuBtn = orderList.querySelector('.browse-menu');
      if (browseMenuBtn) {
        browseMenuBtn.addEventListener('click', () => {
          const menuSection = document.querySelector('.order-section');
          if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
      return;
    }

    // Add each order to the list
    orderHistory.forEach(order => {
      const orderNumber = order.orderNumber;
      
      // Format date
      let dateTimeStr = order.dateTime;
      try {
        const date = new Date(order.dateTime);
        const dateOptions = { year: "numeric", month: "long", day: "numeric" };
        const timeOptions = { hour: "2-digit", minute: "2-digit" };
        const dateStr = date.toLocaleDateString("en-US", dateOptions);
        const timeStr = date.toLocaleTimeString("en-US", timeOptions);
        dateTimeStr = `${dateStr} - ${timeStr}`;
      } catch (err) {
        console.error('Error formatting date:', err);
      }

      // Get item names
      let itemNames = '';
      if (order.items && Array.isArray(order.items)) {
        itemNames = order.items.map(item => item.name).join(', ');
      } else if (order.itemNames) {
        itemNames = order.itemNames;
      }

      // Get status
      const status = order.status || 'pending';
      const statusClass = getStatusClass(status);

      // Create order item element
      const orderItem = document.createElement("div");
      orderItem.className = "order-item";
      orderItem.innerHTML = `
        <div class="order-item-header">
            <span class="order-number">Order #${orderNumber}</span>
            <span class="order-date">${dateTimeStr}</span>
        </div>
        <div class="order-summary-row">
            <span>${order.items ? order.items.length : 0} items</span>
            <span class="order-status ${statusClass}">${status}</span>
        </div>
        <div class="order-summary-row">
            <span>${itemNames}</span>
            <span class="order-total">${formatPrice(order.total)}</span>
        </div>
        <div class="order-actions">
            ${status === 'pending' || status === 'processing' ? 
              `<button class="order-action-btn secondary" data-order="${orderNumber}">Cancel Order</button>` :
              `<button class="order-action-btn secondary" data-order="${orderNumber}">Reorder</button>`
            }
            <button class="order-action-btn primary view-details-btn" data-order="${orderNumber}">View Details</button>
        </div>
      `;

      // Add to order list
      orderList.appendChild(orderItem);
    });

    // Add event listeners to view details buttons
    const viewDetailsBtns = orderList.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const orderNumber = this.getAttribute('data-order');
        const order = orderHistory.find(o => o.orderNumber == orderNumber);
        if (order) {
          showOrderDetails(
            orderNumber,
            order.dateTime, 
            order.status,
            order.items,
            order.subtotal,
            order.serviceFee,
            order.discount,
            order.total
          );
        }
      });
    });
  } catch (error) {
    console.error('Error rendering order history:', error);
    showNotification('Error loading orders', 'Could not load your order history. Please refresh the page.');
  }
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

// Hàm gửi đơn hàng
async function submitOrder(orderData) {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
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
  
  