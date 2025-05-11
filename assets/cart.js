// Cart data structure
const cart = {
  items: [],
  subtotal: 0,
  serviceFee: 0,
  discount: 0,
  total: 0,
  freeItem: null,
  appliedVoucher: null,
}

// Thêm hàm showNotification
function showNotification(title, message = '') {
  const notification = document.createElement('div');
  notification.className = 'notification animate__animated animate__fadeInRight';
  notification.innerHTML = `
    <div class="notification-header">
      <i class="fas fa-bell"></i>
      <h3>${title}</h3>
      <button class="close-notification">
        <i class="fas fa-times"></i>
      </button>
    </div>
    ${message ? `<div class="notification-body">${message}</div>` : ''}
  `;

  document.body.appendChild(notification);

  // Add close event
  const closeButton = notification.querySelector('.close-notification');
  closeButton.addEventListener('click', () => {
    notification.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
    setTimeout(() => {
      notification.remove();
    }, 500);
  });

  // Auto-close after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.replace('animate__fadeInRight', 'animate__fadeOutRight');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 500);
    }
  }, 3000);
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    cart.items = parsedCart.items;
    cart.subtotal = parsedCart.subtotal;
    cart.serviceFee = parsedCart.serviceFee;
    cart.discount = parsedCart.discount;
    cart.total = parsedCart.total;
    cart.freeItem = parsedCart.freeItem;
    cart.appliedVoucher = parsedCart.appliedVoucher;
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart
function addItemToCart(id, name, category, size, price, quantity, image, isFree = false) {
  const existingItemIndex = cart.items.findIndex((item) => item.id === id && item.size === size);

  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      id,
      name,
      category,
      size,
      price: isFree ? 0 : price,
      originalPrice: price,
      quantity,
      image,
      isFree,
    });
  }

  saveCart();
  updateCartUI();
  updateCartTotals();
}

// Remove item from cart
function removeItemFromCart(id, size) {
  const itemIndex = cart.items.findIndex((item) => item.id === id && item.size === size);

  if (itemIndex !== -1) {
    const itemName = cart.items[itemIndex].name;
    cart.items.splice(itemIndex, 1);
    saveCart();
    updateCartTotals();
    updateCartUI();
    updateBasketUI();
    return itemName;
  }
  return null;
}

// Update cart totals
function updateCartTotals() {
  cart.subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  cart.serviceFee = cart.subtotal > 0 ? Math.round(cart.subtotal * 0.05) : 0;

  if (cart.appliedVoucher) {
    if (cart.appliedVoucher.type === "percentage") {
      cart.discount = Math.round(cart.subtotal * (cart.appliedVoucher.value / 100));
    } else if (cart.appliedVoucher.type === "fixed") {
      cart.discount = cart.appliedVoucher.value;
    }
  } else {
    cart.discount = 0;
  }

  cart.total = cart.subtotal + cart.serviceFee - cart.discount;
}

// Update cart UI
function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.querySelector(".cart-count");
  const cartTitle = document.querySelector(".cart-header h3");
  const dropdownSubtotal = document.getElementById("dropdown-subtotal");
  const dropdownServiceFee = document.getElementById("dropdown-service-fee");
  const dropdownDiscount = document.getElementById("dropdown-discount");
  const dropdownTotal = document.getElementById("dropdown-total");

  if (cartItems) {
    cartItems.innerHTML = "";
    if (cart.items.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-basket"></i>
          <p>Your basket is empty</p>
        </div>
      `;
    } else {
      cart.items.forEach((item) => {
        let imageOrIcon = '';
        if (item.image && item.image !== "") {
          imageOrIcon = `<img src="${item.image}" alt="${item.name}" style="width:32px;height:32px;object-fit:cover;border-radius:7px;border:1px solid #eee;margin-right:8px;">`;
        } else {
          imageOrIcon = `<span class="item-icon" style="font-size:20px;margin-right:8px;"><i class="fas fa-${getCategoryIcon(item.category)}"></i></span>`;
        }
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            ${imageOrIcon}
            <div style="display:flex;flex-direction:column;">
              <h4 style="font-size:15px;font-weight:600;margin:0;">${item.name}${item.isFree ? " (Free)" : ""}</h4>
              <p style="font-size:12px;color:#888;margin:0;">Size: ${item.size}</p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:end;gap:2px;">
            <span style="font-size:13px;color:#888;">x${item.quantity}</span>
            <span style="font-weight:600;color:#FF8A00;">${formatPrice(item.price * item.quantity)}</span>
          </div>
          <button class="remove-btn" data-id="${item.id}" data-size="${item.size}">
            <i class="fas fa-times"></i>
          </button>
        `;
        cartItems.appendChild(cartItem);
      });

      // Add event listeners to remove buttons
      const removeButtons = document.querySelectorAll(".remove-btn");
      removeButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const itemId = this.getAttribute("data-id");
          const itemSize = this.getAttribute("data-size");
          const itemName = removeItemFromCart(itemId, itemSize);
          if (itemName) {
            showNotification(`${itemName} removed from cart`);
          }
        });
      });
    }
  }

  // Update cart count
  if (cartCount) {
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  // Update cart title
  if (cartTitle) {
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cartTitle.textContent = `My Basket (${totalItems})`;
  }

  // Update cart totals in dropdown
  if (dropdownSubtotal) dropdownSubtotal.textContent = formatPrice(cart.subtotal);
  if (dropdownServiceFee) dropdownServiceFee.textContent = formatPrice(cart.serviceFee);
  if (dropdownDiscount) dropdownDiscount.textContent = `-${formatPrice(cart.discount)}`;
  if (dropdownTotal) dropdownTotal.textContent = formatPrice(cart.total);
}

// Helper function to get category icon
function getCategoryIcon(category) {
  const icons = {
    all: "utensils",
    pizza: "pizza-slice",
    salads: "leaf",
    burgers: "hamburger",
    drinks: "glass-water",
    cold: "glass-water",
    hot: "mug-hot",
    desserts: "ice-cream",
    sushi: "fish",
    others: "utensils",
    deals: "percentage",
    vegan: "leaf",
  };

  return icons[category] || "utensils";
}

// Helper function to format price
function formatPrice(price) {
  return `${Math.round(price).toLocaleString()}đ`;
}

function updateBasketUI() {
  const basketItems = document.getElementById("basket-items");
  const subtotalEl = document.getElementById("subtotal");
  const serviceFeeEl = document.getElementById("service-fee");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");

  if (basketItems) {
    basketItems.innerHTML = "";
    if (cart.items.length === 0) {
      basketItems.innerHTML = `
        <div class="empty-basket">
          <i class="fas fa-shopping-basket"></i>
          <p>Your basket is empty</p>
        </div>
      `;
    } else {
      cart.items.forEach((item, idx) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "basket-item";
        itemDiv.style.display = "flex";
        itemDiv.style.justifyContent = "space-between";
        itemDiv.style.alignItems = "center";
        itemDiv.style.padding = "10px 0";
        itemDiv.style.borderBottom = (idx === cart.items.length - 1) ? "none" : "1px solid #eee";
        let imageOrIcon = '';
        if (item.image && item.image !== "") {
          imageOrIcon = `<img src="${item.image}" alt="${item.name}" style="width:38px;height:38px;object-fit:cover;border-radius:8px;border:1px solid #eee;">`;
        } else {
          imageOrIcon = `<span class="item-icon" style="font-size:22px;margin-right:8px;"><i class="fas fa-${getCategoryIcon(item.category)}"></i></span>`;
        }
        itemDiv.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            ${imageOrIcon}
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span style="font-weight:600;font-size:15px;">${item.name} <span style="font-size:12px;color:#888;">(${item.size})</span></span>
              <span style="font-size:13px;color:#888;">Số lượng: <b>x${item.quantity}</b></span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:700;color:#FF8A00;font-size:16px;">${formatPrice(item.price * item.quantity)}</span>
            <button class="remove-basket-btn" data-id="${item.id}" data-size="${item.size}" style="background:none;border:none;color:#ff4d4f;font-size:18px;cursor:pointer;margin-left:6px;" title="Xoá sản phẩm">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        basketItems.appendChild(itemDiv);
      });
      // Thêm event listener cho nút xoá
      const removeBtns = basketItems.querySelectorAll('.remove-basket-btn');
      removeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          const size = this.getAttribute('data-size');
          removeItemFromCart(id, size);
        });
      });
    }
  }
  if (subtotalEl) subtotalEl.textContent = formatPrice(cart.subtotal);
  if (serviceFeeEl) serviceFeeEl.textContent = formatPrice(cart.serviceFee);
  if (discountEl) discountEl.textContent = `-${formatPrice(cart.discount)}`;
  if (totalEl) totalEl.textContent = formatPrice(cart.total);
}

// Export functions
export {
  cart,
  loadCart,
  saveCart,
  addItemToCart,
  removeItemFromCart,
  updateCartUI,
  updateCartTotals,
  getCategoryIcon,
  formatPrice,
  updateBasketUI,
  showNotification
}; 