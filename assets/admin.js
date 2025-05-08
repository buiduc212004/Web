document.addEventListener('DOMContentLoaded', async function() {
    // Load data from localStorage first, fallback to API/mock data
    let orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    let products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    let categories = JSON.parse(localStorage.getItem('allCategories') || '[]');
    let promotions = JSON.parse(localStorage.getItem('allPromotions') || '[]');
    let customers = JSON.parse(localStorage.getItem('allCustomers') || '[]');

    // If no data in localStorage, load from API/mock data
    if (orders.length === 0) {
        try {
            const resOrders = await fetch('http://localhost:5000/api/orders');
            orders = await resOrders.json();
            localStorage.setItem('allOrders', JSON.stringify(orders));
        } catch (e) {
            orders = [
                { id: 'Customer-001', customer: 'Bui Ngoc Duc', date: '15 Mar 2025, 19:30', items: 3, amount: 350000, status: 'completed' },
                { id: 'Customer-002', customer: 'Bui Ngoc Duc', date: '15 Mar 2025, 18:45', items: 4, amount: 420000, status: 'processing' },
                { id: 'Customer-003', customer: 'Bui Ngoc Duc', date: '15 Mar 2025, 17:20', items: 2, amount: 280000, status: 'delivered' },
                { id: 'Customer-004', customer: 'Bui Ngoc Duc', date: '15 Mar 2025, 16:10', items: 5, amount: 520000, status: 'cancelled' },
                { id: 'Customer-005', customer: 'Bui Ngoc Duc', date: '15 Mar 2025, 15:30', items: 3, amount: 380000, status: 'completed' }
            ];
            localStorage.setItem('allOrders', JSON.stringify(orders));
        }
    }

    if (products.length === 0) {
        try {
            const resProducts = await fetch('http://localhost:5000/api/foods');
            products = await resProducts.json();
            localStorage.setItem('allProducts', JSON.stringify(products));
        } catch (e) {
            products = [
                { id: 'product-1', name: 'Pizza', category: 'Pizzas', price: 260000, rating: 4.8, sales: 235, image: '../image/pizza_1.png', status: 'active', badge: 'Top Seller' },
                { id: 'product-2', name: 'Burger', category: 'Burgers', price: 180000, rating: 4.7, sales: 198, image: '../image/combo_6.png', status: 'active' },
                { id: 'product-3', name: 'Caesar Salad', category: 'Salads', price: 100000, rating: 4.6, sales: 156, image: '../image/salad_1.png', status: 'active' },
                { id: 'product-4', name: 'Coca Cola', category: 'Drinks', price: 30000, rating: 4.5, sales: 142, image: '../image/drink_1.png', status: 'active' },
                { id: 'product-5', name: 'Chocolate Brownie', category: 'Desserts', price: 80000, rating: 4.7, sales: 128, image: '../image/deals_1.png', status: 'active' },
                { id: 'product-6', name: 'Garlic Bread', category: 'Sides', price: 80000, rating: 4.4, sales: 115, image: '../image/garlic_bread_1.png', status: 'inactive' }
            ];
            localStorage.setItem('allProducts', JSON.stringify(products));
        }
    }

    if (customers.length === 0) {
        try {
            const resCustomers = await fetch('http://localhost:5000/api/customers');
            customers = await resCustomers.json();
            localStorage.setItem('allCustomers', JSON.stringify(customers));
        } catch (e) {
            customers = [
                { id: 'CUST-001', name: 'Bui Ngoc Duc', email: 'duc@example.com', phone: '0383051321', address: 'Ha Noi', orders: 12, totalSpent: 3500000, status: 'active', joinedDate: '01/01/2025', lastOrder: '15 Mar 2025' },
                { id: 'CUST-002', name: 'Nguyen Van A', email: 'nguyenvana@example.com', phone: '0987654321', address: 'Ho Chi Minh City', orders: 8, totalSpent: 2100000, status: 'active', joinedDate: '15/01/2025', lastOrder: '14 Mar 2025' },
                { id: 'CUST-003', name: 'Tran Thi B', email: 'tranthib@example.com', phone: '0912345678', address: 'Da Nang', orders: 5, totalSpent: 1200000, status: 'active', joinedDate: '01/02/2025', lastOrder: '10 Mar 2025' },
                { id: 'CUST-004', name: 'Le Van C', email: 'levanc@example.com', phone: '0923456789', address: 'Hue', orders: 3, totalSpent: 850000, status: 'inactive', joinedDate: '15/02/2025', lastOrder: '05 Mar 2025' },
                { id: 'CUST-005', name: 'Pham Thi D', email: 'phamthid@example.com', phone: '0934567890', address: 'Hai Phong', orders: 7, totalSpent: 1800000, status: 'active', joinedDate: '01/03/2025', lastOrder: '12 Mar 2025' }
            ];
            localStorage.setItem('allCustomers', JSON.stringify(customers));
        }
    }

    if (categories.length === 0) {
        categories = [
            { id: '#CAT-001', name: 'Pizzas', products: 24, status: 'active' },
            { id: '#CAT-002', name: 'Burgers', products: 18, status: 'active' },
            { id: '#CAT-003', name: 'Salads', products: 12, status: 'active' },
            { id: '#CAT-004', name: 'Drinks', products: 20, status: 'active' },
            { id: '#CAT-005', name: 'Desserts', products: 15, status: 'active' }
        ];
        localStorage.setItem('allCategories', JSON.stringify(categories));
    }

    if (promotions.length === 0) {
        promotions = [
            { code: 'ORDERS', description: '5% Off First Order', discount: '5%', startDate: '01/01/2025', endDate: '31/12/2025', status: 'active' },
            { code: 'WEEKEND10', description: '10% Off Weekend Orders', discount: '10%', startDate: '01/01/2025', endDate: '31/12/2025', status: 'active' },
            { code: 'SUMMER25', description: '25% Off Summer Special', discount: '25%', startDate: '01/06/2025', endDate: '31/08/2025', status: 'scheduled' },
            { code: 'NEWYEAR20', description: '20% Off New Year Special', discount: '20%', startDate: '25/12/2024', endDate: '10/01/2025', status: 'expired' }
        ];
        localStorage.setItem('allPromotions', JSON.stringify(promotions));
    }

    // Variables to track edit mode and current item being edited
    let currentEditMode = 'add';
    let currentProductId = null;
    let currentCategoryId = null;
    let currentPromotionCode = null;
    let currentCustomerId = null;
    let currentOrderId = null;

    // Toggle sidebar on mobile
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item a');
    const contentSections = document.querySelectorAll('.content-section');
    const dashboard = document.getElementById('dashboard');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't prevent default for the "Go to Website" link
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Get the target section id from the href attribute
                const targetId = this.getAttribute('href').substring(1);
                
                // Remove active class from all nav items
                navItems.forEach(navItem => {
                    navItem.parentElement.classList.remove('active');
                });
                
                // Add active class to clicked nav item
                this.parentElement.classList.add('active');
                
                // Hide all content sections
                contentSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Hide dashboard if not the target
                if (targetId !== 'dashboard') {
                    dashboard.classList.add('hidden');
                } else {
                    dashboard.classList.remove('hidden');
                }
                
                // Show the target section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
            }
        });
    });
    
    // Top Navigation Menu functionality
    const navMenuItems = document.querySelectorAll('.nav-menu-item');
    
    navMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            navMenuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked menu item
            this.classList.add('active');
        });
    });

    // View All buttons functionality
    const viewAllOrdersBtn = document.getElementById('view-all-orders');
    const viewAllProductsBtn = document.getElementById('view-all-products');
    
    if (viewAllOrdersBtn) {
        viewAllOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulate clicking on the Orders nav item
            document.querySelector('.nav-item a[href="#orders"]').click();
        });
    }
    
    if (viewAllProductsBtn) {
        viewAllProductsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulate clicking on the Products nav item
            document.querySelector('.nav-item a[href="#products"]').click();
        });
    }
    
    // Modal functionality
    const orderDetailsModal = document.getElementById('order-details-modal');
    const productModal = document.getElementById('product-modal');
    const categoryModal = document.getElementById('category-modal');
    const promotionModal = document.getElementById('promotion-modal');
    const customerModal = document.getElementById('customer-modal');
    const customerDetailsModal = document.getElementById('customer-details-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .btn-secondary');
    
    // Close modal when clicking close button
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.classList.remove('show');
            });
            
            // Reset edit mode when closing modals
            currentEditMode = 'add';
            currentProductId = null;
            currentCategoryId = null;
            currentPromotionCode = null;
            currentCustomerId = null;
            currentOrderId = null;
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
                
                // Reset edit mode when closing modals
                currentEditMode = 'add';
                currentProductId = null;
                currentCategoryId = null;
                currentPromotionCode = null;
                currentCustomerId = null;
                currentOrderId = null;
            }
        });
    });
    
    // Select all checkbox functionality
    const selectAllCheckboxes = document.querySelectorAll('.select-all-checkbox');
    
    selectAllCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const rowCheckboxes = table.querySelectorAll('.row-checkbox');
            
            rowCheckboxes.forEach(rowCheckbox => {
                rowCheckbox.checked = this.checked;
            });
        });
    });
    
    // Load Recent Orders
    function loadRecentOrders() {
        const recentOrdersTable = document.getElementById('recent-orders-table');
        if (!recentOrdersTable) return;
        
        const tbody = recentOrdersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Lấy 5 đơn hàng mới nhất từ allOrders
        const recentOrders = orders.slice(0, 5);
        
        recentOrders.forEach(order => {
            if (!order.id) {
                console.error('Order without ID found:', order);
                return;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>
                    <div class="customer-info">
                        <img src="../image/Banner.png" alt="Customer Avatar" class="customer-avatar">
                        <span>${order.customer || 'Khách hàng'}</span>
                    </div>
                </td>
                <td>${order.date || order.dateTimeStr}</td>
                <td>${formatPrice(order.amount || (parseInt(order.subtotal) + parseInt(order.serviceFee) - parseInt(order.discount)))}</td>
                <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${order.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Gán lại event listeners cho các nút action
        tbody.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                openOrderDetailsModal(orderId);
            };
        });
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                openOrderDetailsModal(orderId, 'edit');
            };
        });
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
                    deleteOrder(orderId);
                }
            };
        });
    }
    
    // Load Top Products
    function loadTopProducts() {
        const topProductsGrid = document.getElementById('top-products-grid');
        if (!topProductsGrid) return;
        
        topProductsGrid.innerHTML = '';
        
        products.slice(0, 4).forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            let badgeHtml = '';
            if (product.badge) {
                badgeHtml = `<div class="product-badge">${product.badge}</div>`;
            }
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${badgeHtml}
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <div class="product-stats">
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                        </div>
                        <div class="product-sales">
                            <i class="fas fa-shopping-cart"></i>
                            <span>${product.sales} sold</span>
                        </div>
                    </div>
                    <div class="product-price">
                        <span>${formatPrice(product.price)}</span>
                    </div>
                </div>
            `;
            
            topProductsGrid.appendChild(productCard);
        });
    }
    
    // Load Orders Table
    function loadOrdersTable() {
        const ordersTable = document.getElementById('orders-table');
        if (!ordersTable) return;
        
        const tbody = ordersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            if (!order.id) {
                console.error('Order without ID found:', order);
                return;
            }
            let itemsHtml = '';
            if (order.items && Array.isArray(order.items)) {
                itemsHtml = order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}" class="order-product-img" style="width:32px;height:32px;object-fit:cover;border-radius:4px;margin-right:4px;">
                        <span>${item.name} (${item.size}) x${item.quantity} - ${formatPrice(item.price)}</span>
                    </div>
                `).join('');
            } else {
                itemsHtml = order.itemNames || '';
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td>${order.id}</td>
                <td>
                    <div class="customer-info">
                        <img src="../image/Banner.png" alt="Customer Avatar" class="customer-avatar">
                        <span>${order.customer || 'Khách hàng'}</span>
                    </div>
                </td>
                <td>${order.date || order.dateTimeStr}</td>
                <td>${order.items || order.itemsCount} items</td>
                <td>${itemsHtml}</td>
                <td>${formatPrice(order.amount || (parseInt(order.subtotal) + parseInt(order.serviceFee) - parseInt(order.discount)))}</td>
                <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${order.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${order.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Gán lại event listeners cho các nút action
        tbody.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                openOrderDetailsModal(orderId);
            };
        });
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                openOrderDetailsModal(orderId, 'edit');
            };
        });
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                const orderId = this.getAttribute('data-id');
                if (!orderId) return;
                if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
                    deleteOrder(orderId);
                }
            };
        });
        
        // Generate pagination
        generatePagination('orders-pagination', 5);
    }
    
    // Load Products Grid
    function loadProductsGrid() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card admin-card';
            productCard.dataset.id = product.id;
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-actions">
                        <button class="product-action-btn edit" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                        <button class="product-action-btn delete" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <div class="product-category">Category: ${product.category}</div>
                    <div class="product-stats">
                        <div class="product-rating">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                        </div>
                        <div class="product-sales">
                            <i class="fas fa-shopping-cart"></i>
                            <span>${product.sales} sold</span>
                        </div>
                    </div>
                    <div class="product-price">
                        <span>${formatPrice(product.price)}</span>
                    </div>
                    <div class="product-status">
                        <span class="status-badge ${product.status}">${capitalizeFirstLetter(product.status)}</span>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Add event listeners to product action buttons
        const editBtns = productsGrid.querySelectorAll('.product-action-btn.edit');
        const deleteBtns = productsGrid.querySelectorAll('.product-action-btn.delete');
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = this.getAttribute('data-id');
                openProductModal('edit', productId);
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = this.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete this product?`)) {
                    // Find the index of the product to delete
                    const productIndex = products.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        // Remove the product from the array
                        products.splice(productIndex, 1);
                        // Remove the card from the grid
                        this.closest('.product-card').remove();
                    }
                }
            });
        });
        
        // Generate pagination
        generatePagination('products-pagination', 8);
    }
    
    // Load Categories Table
    function loadCategoriesTable() {
        const categoriesTable = document.getElementById('categories-table');
        if (!categoriesTable) return;
        
        const tbody = categoriesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        categories.forEach(category => {
            const tr = document.createElement('tr');
            tr.dataset.id = category.id;
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.products}</td>
                <td><span class="status-badge ${category.status}">${capitalizeFirstLetter(category.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-id="${category.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${category.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${category.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        const viewBtns = categoriesTable.querySelectorAll('.view-btn');
        const editBtns = categoriesTable.querySelectorAll('.edit-btn');
        const deleteBtns = categoriesTable.querySelectorAll('.delete-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                // In a real application, this would show category details
                console.log(`View category ${categoryId}`);
            });
        });
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                openCategoryModal('edit', categoryId);
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete category ${categoryId}?`)) {
                    // Find the index of the category to delete
                    const categoryIndex = categories.findIndex(c => c.id === categoryId);
                    if (categoryIndex !== -1) {
                        // Remove the category from the array
                        categories.splice(categoryIndex, 1);
                        // Remove the row from the table
                        this.closest('tr').remove();
                    }
                }
            });
        });
    }
    
    // Load Promotions Table
    function loadPromotionsTable() {
        const promotionsTable = document.getElementById('promotions-table');
        if (!promotionsTable) return;
        
        const tbody = promotionsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        promotions.forEach(promotion => {
            const tr = document.createElement('tr');
            tr.dataset.code = promotion.code;
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td>${promotion.code}</td>
                <td>${promotion.description}</td>
                <td>${promotion.discount}</td>
                <td>${promotion.startDate}</td>
                <td>${promotion.endDate}</td>
                <td><span class="status-badge ${promotion.status}">${capitalizeFirstLetter(promotion.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-id="${promotion.code}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${promotion.code}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${promotion.code}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        const viewBtns = promotionsTable.querySelectorAll('.view-btn');
        const editBtns = promotionsTable.querySelectorAll('.edit-btn');
        const deleteBtns = promotionsTable.querySelectorAll('.delete-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const promoCode = this.getAttribute('data-id');
                // In a real application, this would show promotion details
                console.log(`View promotion ${promoCode}`);
            });
        });
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const promoCode = this.getAttribute('data-id');
                openPromotionModal('edit', promoCode);
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const promoCode = this.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete promotion ${promoCode}?`)) {
                    // Find the index of the promotion to delete
                    const promotionIndex = promotions.findIndex(p => p.code === promoCode);
                    if (promotionIndex !== -1) {
                        // Remove the promotion from the array
                        promotions.splice(promotionIndex, 1);
                        // Remove the row from the table
                        this.closest('tr').remove();
                    }
                }
            });
        });
    }
    
    // Open Order Details Modal
    function openOrderDetailsModal(orderId, mode = 'view') {
        if (!orderDetailsModal) return;
        
        // Find the order
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Set current edit mode and order ID
        currentEditMode = mode;
        currentOrderId = orderId;
        
        // Populate modal with order details
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('modal-order-id').textContent = orderId;
        document.getElementById('modal-order-date').textContent = order.date || order.dateTimeStr;
        
        // Status field - show as select in edit mode
        const statusField = document.getElementById('modal-order-status');
        if (statusField) {
            if (mode === 'edit') {
                statusField.innerHTML = `
                    <select class="form-control" id="status-select">
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                `;
            } else {
                statusField.innerHTML = `<span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span>`;
            }
        }
        
        // Customer name field - show as input in edit mode
        const customerField = document.getElementById('modal-customer-name');
        if (customerField) {
            if (mode === 'edit') {
                customerField.innerHTML = `
                    <input type="text" class="form-control" id="customer-input" value="${order.customer || 'Khách hàng'}">
                `;
            } else {
                customerField.textContent = order.customer || 'Khách hàng';
            }
        }
        
        document.getElementById('modal-subtotal').textContent = formatPrice(order.subtotal || (order.amount - 20000));
        document.getElementById('modal-total').textContent = formatPrice(order.amount || (parseInt(order.subtotal) + parseInt(order.serviceFee) - parseInt(order.discount)));
        
        // Show/hide edit controls based on mode
        const editControls = document.querySelectorAll('.edit-control');
        editControls.forEach(control => {
            control.style.display = mode === 'edit' ? 'block' : 'none';
        });
        
        // Update save button text and visibility
        const saveBtn = document.getElementById('save-order-btn');
        if (saveBtn) {
            saveBtn.style.display = mode === 'edit' ? 'block' : 'none';
            saveBtn.textContent = 'Save Changes';
        }
        
        // Show the modal
        orderDetailsModal.classList.add('show');

        // Trong openOrderDetailsModal, hiển thị danh sách món chi tiết nếu có
        if (order && order.items && Array.isArray(order.items)) {
            const modalItems = document.getElementById('modal-order-items');
            if (modalItems) {
                modalItems.innerHTML = order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}" class="order-product-img" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;">
                        <span>${item.name} (${item.size}) x${item.quantity} - ${formatPrice(item.price)}</span>
                    </div>
                `).join('');
            }
        }
    }
    
    // Open Product Modal
    function openProductModal(mode, productId = null) {
        if (!productModal) return;
        
        const modalTitle = document.getElementById('product-modal-title');
        const productForm = document.getElementById('product-form');
        const saveBtn = document.getElementById('save-product-btn');
        
        // Set current edit mode and product ID
        currentEditMode = mode;
        currentProductId = productId;
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Product';
            productForm.reset();
            saveBtn.textContent = 'Add Product';
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit Product';
            
            // Find the product
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            // Populate form with product details
            productForm.elements['name'].value = product.name;
            productForm.elements['category'].value = product.category.toLowerCase();
            productForm.elements['price'].value = product.price;
            productForm.elements['image'].value = product.image;
            productForm.elements['status'].value = product.status;
            
            saveBtn.textContent = 'Update Product';
        }
        
        // Show the modal
        productModal.classList.add('show');
    }

    // Open Category Modal
    function openCategoryModal(mode, categoryId = null) {
        if (!categoryModal) return;
        
        const modalTitle = document.getElementById('category-modal-title');
        const categoryForm = document.getElementById('category-form');
        const saveBtn = document.getElementById('save-category-btn');
        
        // Set current edit mode and category ID
        currentEditMode = mode;
        currentCategoryId = categoryId;
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Category';
            categoryForm.reset();
            saveBtn.textContent = 'Add Category';
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit Category';
            
            // Find the category
            const category = categories.find(c => c.id === categoryId);
            if (!category) return;
            
            // Populate form with category details
            categoryForm.elements['name'].value = category.name;
            categoryForm.elements['status'].value = category.status;
            
            saveBtn.textContent = 'Update Category';
        }
        
        // Show the modal
        categoryModal.classList.add('show');
    }

    // Open Promotion Modal
    function openPromotionModal(mode, promoCode = null) {
        if (!promotionModal) return;
        
        const modalTitle = document.getElementById('promotion-modal-title');
        const promotionForm = document.getElementById('promotion-form');
        const saveBtn = document.getElementById('save-promotion-btn');
        
        // Set current edit mode and promotion code
        currentEditMode = mode;
        currentPromotionCode = promoCode;
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Promotion';
            promotionForm.reset();
            saveBtn.textContent = 'Add Promotion';
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit Promotion';
            
            // Find the promotion
            const promotion = promotions.find(p => p.code === promoCode);
            if (!promotion) return;
            
            // Populate form with promotion details
            promotionForm.elements['code'].value = promotion.code;
            promotionForm.elements['description'].value = promotion.description;
            promotionForm.elements['discount'].value = promotion.discount;
            promotionForm.elements['startDate'].value = formatDateForInput(promotion.startDate);
            promotionForm.elements['endDate'].value = formatDateForInput(promotion.endDate);
            promotionForm.elements['status'].value = promotion.status;
            
            saveBtn.textContent = 'Update Promotion';
        }
        
        // Show the modal
        promotionModal.classList.add('show');
    }

    // Open Customer Details Modal
    function openCustomerDetailsModal(customerId) {
        const customerDetailsModal = document.getElementById('customer-details-modal');
        if (!customerDetailsModal) return;
        
        // Find the customer
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;
        
        // Populate modal with customer details
        document.getElementById('customer-name').textContent = customer.name;
        document.getElementById('modal-customer-id').textContent = customer.id;
        document.getElementById('modal-customer-email').textContent = customer.email;
        document.getElementById('modal-customer-phone').textContent = customer.phone;
        document.getElementById('modal-customer-address').textContent = customer.address;
        document.getElementById('modal-customer-status').innerHTML = `<span class="status-badge ${customer.status}">${capitalizeFirstLetter(customer.status)}</span>`;
        document.getElementById('modal-customer-joined').textContent = customer.joinedDate;
        document.getElementById('modal-customer-orders').textContent = customer.orders;
        document.getElementById('modal-customer-spent').textContent = formatPrice(customer.totalSpent);
        document.getElementById('modal-customer-last-order').textContent = customer.lastOrder;
        
        // Sample customer orders
        const ordersTable = document.getElementById('modal-customer-orders-table').querySelector('tbody');
        ordersTable.innerHTML = '';
        
        // Generate some sample orders for this customer
        const sampleOrders = [];
        for (let i = 0; i < 3; i++) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - i * 3);
            const formattedDate = `${orderDate.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][orderDate.getMonth()]} ${orderDate.getFullYear()}, ${orderDate.getHours()}:${orderDate.getMinutes().toString().padStart(2, '0')}`;
            
            sampleOrders.push({
                id: `ORDER-${(1000 + i).toString()}`,
                date: formattedDate,
                items: Math.floor(Math.random() * 5) + 1,
                amount: Math.floor(Math.random() * 500000) + 100000,
                status: ['completed', 'processing', 'delivered'][Math.floor(Math.random() * 3)]
            });
        }
        
        sampleOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id}</td>
                <td>${order.date}</td>
                <td>${order.items} items</td>
                <td>${formatPrice(order.amount)}</td>
                <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
            `;
            ordersTable.appendChild(tr);
        });
        
        // Add event listener to edit button
        const editCustomerBtn = document.getElementById('edit-customer-btn');
        if (editCustomerBtn) {
            editCustomerBtn.addEventListener('click', function() {
                customerDetailsModal.classList.remove('show');
                openCustomerModal('edit', customerId);
            });
        }
        
        // Show the modal
        customerDetailsModal.classList.add('show');
    }

    // Open Customer Modal
    function openCustomerModal(mode, customerId = null) {
        const customerModal = document.getElementById('customer-modal');
        if (!customerModal) return;
        
        const modalTitle = document.getElementById('customer-modal-title');
        const customerForm = document.getElementById('customer-form');
        const saveBtn = document.getElementById('save-customer-btn');
        
        // Set current edit mode and customer ID
        currentEditMode = mode;
        currentCustomerId = customerId;
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Customer';
            customerForm.reset();
            saveBtn.textContent = 'Add Customer';
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit Customer';
            
            // Find the customer
            const customer = customers.find(c => c.id === customerId);
            if (!customer) return;
            
            // Populate form with customer details
            customerForm.elements['name'].value = customer.name;
            customerForm.elements['email'].value = customer.email;
            customerForm.elements['phone'].value = customer.phone;
            customerForm.elements['address'].value = customer.address;
            customerForm.elements['status'].value = customer.status;
            
            saveBtn.textContent = 'Update Customer';
        }
        
        // Show the modal
        customerModal.classList.add('show');
    }

    // Load Customers Table
    function loadCustomersTable() {
        const customersTable = document.getElementById('customers-table');
        if (!customersTable) return;
        
        const tbody = customersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        customers.forEach(customer => {
            const tr = document.createElement('tr');
            tr.dataset.id = customer.id;
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td>${customer.id}</td>
                <td>
                    <div class="customer-info">
                        <img src="../image/Banner.png" alt="Customer Avatar" class="customer-avatar">
                        <span>${customer.name}</span>
                    </div>
                </td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.orders}</td>
                <td>${formatPrice(customer.totalSpent)}</td>
                <td><span class="status-badge ${customer.status}">${capitalizeFirstLetter(customer.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-id="${customer.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${customer.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${customer.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        const viewBtns = customersTable.querySelectorAll('.view-btn');
        const editBtns = customersTable.querySelectorAll('.edit-btn');
        const deleteBtns = customersTable.querySelectorAll('.delete-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = this.getAttribute('data-id');
                openCustomerDetailsModal(customerId);
            });
        });
        
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = this.getAttribute('data-id');
                openCustomerModal('edit', customerId);
            });
        });
        
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = this.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete customer ${customerId}?`)) {
                    // Find the index of the customer to delete
                    const customerIndex = customers.findIndex(c => c.id === customerId);
                    if (customerIndex !== -1) {
                        // Remove the customer from the array
                        customers.splice(customerIndex, 1);
                        // Remove the row from the table
                        this.closest('tr').remove();
                    }
                }
            });
        });
        
        // Generate pagination
        generatePagination('customers-pagination', 5);
    }

    // Add Customer Button
    const addCustomerBtn = document.getElementById('add-customer-btn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', function() {
            openCustomerModal('add');
        });
    }

    // Save Customer Button
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    if (saveCustomerBtn) {
        saveCustomerBtn.addEventListener('click', function() {
            const customerForm = document.getElementById('customer-form');
            
            // Validate form
            if (!customerForm.checkValidity()) {
                customerForm.reportValidity();
                return;
            }
            
            // Get form data
            const formData = {
                name: customerForm.elements['name'].value,
                email: customerForm.elements['email'].value,
                phone: customerForm.elements['phone'].value,
                address: customerForm.elements['address'].value,
                status: customerForm.elements['status'].value
            };
            
            if (currentEditMode === 'edit' && currentCustomerId) {
                // Update existing customer
                const customerIndex = customers.findIndex(c => c.id === currentCustomerId);
                if (customerIndex !== -1) {
                    // Update customer data while preserving other properties
                    customers[customerIndex] = {
                        ...customers[customerIndex],
                        ...formData
                    };
                    
                    console.log('Customer updated:', customers[customerIndex]);
                }
            } else {
                // Add new customer
                const newCustomer = {
                    id: 'CUST-' + (customers.length + 1).toString().padStart(3, '0'),
                    ...formData,
                    orders: 0,
                    totalSpent: 0,
                    joinedDate: new Date().toLocaleDateString('en-GB'),
                    lastOrder: 'N/A'
                };
                
                customers.push(newCustomer);
                console.log('New customer added:', newCustomer);
            }
            
            // Close modal
            customerModal.classList.remove('show');
            
            // Reset edit mode
            currentEditMode = 'add';
            currentCustomerId = null;
            
            // Reload customers table
            loadCustomersTable();
        });
    }

    // Customer search
    const customerSearch = document.getElementById('customer-search');
    if (customerSearch) {
        customerSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // In a real application, this would search the customers
            console.log('Searching customers:', searchTerm);
            
            // Simple client-side filtering for demo
            const customerRows = document.querySelectorAll('#customers-table tbody tr');
            customerRows.forEach(row => {
                const customerName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                const customerEmail = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                const customerPhone = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
                
                if (customerName.includes(searchTerm) || customerEmail.includes(searchTerm) || customerPhone.includes(searchTerm)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Customer status filter
    const customerStatusFilter = document.getElementById('customer-status-filter');
    if (customerStatusFilter) {
        customerStatusFilter.addEventListener('change', function() {
            const status = this.value;
            
            // In a real application, this would filter the customers
            console.log('Filtering customers by status:', status);
            
            // Simple client-side filtering for demo
            const customerRows = document.querySelectorAll('#customers-table tbody tr');
            customerRows.forEach(row => {
                const statusBadge = row.querySelector('.status-badge');
                if (status === 'all' || statusBadge.classList.contains(status)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Generate Pagination
    function generatePagination(containerId, totalPages) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        container.appendChild(prevBtn);
        
        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn' + (i === 1 ? ' active' : '');
            pageBtn.textContent = i;
            container.appendChild(pageBtn);
            
            // Add click event
            pageBtn.addEventListener('click', function() {
                // Remove active class from all buttons
                container.querySelectorAll('.pagination-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.classList.add('active');
            });
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        container.appendChild(nextBtn);
        
        // Add click events to prev/next buttons
        prevBtn.addEventListener('click', function() {
            const activeBtn = container.querySelector('.pagination-btn.active');
            if (activeBtn && activeBtn.previousElementSibling && activeBtn.previousElementSibling.classList.contains('pagination-btn')) {
                activeBtn.previousElementSibling.click();
            }
        });
        
        nextBtn.addEventListener('click', function() {
            const activeBtn = container.querySelector('.pagination-btn.active');
            if (activeBtn && activeBtn.nextElementSibling && activeBtn.nextElementSibling.classList.contains('pagination-btn')) {
                activeBtn.nextElementSibling.click();
            }
        });
    }
    
    // Add Product Button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal('add');
        });
    }
    
    // Save Product Button
    const saveProductBtn = document.getElementById('save-product-btn');
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', function() {
            const productForm = document.getElementById('product-form');
            
            // Validate form
            if (!productForm.checkValidity()) {
                productForm.reportValidity();
                return;
            }
            
            // Get form data
            const formData = {
                name: productForm.elements['name'].value,
                category: productForm.elements['category'].value,
                price: parseInt(productForm.elements['price'].value),
                image: productForm.elements['image'].value,
                status: productForm.elements['status'].value
            };
            
            if (currentEditMode === 'edit' && currentProductId) {
                // Update existing product
                const productIndex = products.findIndex(p => p.id === currentProductId);
                if (productIndex !== -1) {
                    // Update product data while preserving other properties
                    products[productIndex] = {
                        ...products[productIndex],
                        ...formData
                    };
                    
                    console.log('Product updated:', products[productIndex]);
                }
            } else {
                // Add new product
                const newProduct = {
                    id: 'product-' + (products.length + 1),
                    ...formData,
                    rating: 0,
                    sales: 0
                };
                
                products.push(newProduct);
                console.log('New product added:', newProduct);
            }
            
            // Close modal
            productModal.classList.remove('show');
            
            // Reset edit mode
            currentEditMode = 'add';
            currentProductId = null;
            
            // Reload products grid
            loadProductsGrid();
        });
    }

    // Add Category Button
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            openCategoryModal('add');
        });
    }

    // Save Category Button
    const saveCategoryBtn = document.getElementById('save-category-btn');
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', function() {
            const categoryForm = document.getElementById('category-form');
            
            // Validate form
            if (!categoryForm.checkValidity()) {
                categoryForm.reportValidity();
                return;
            }
            
            // Get form data
            const formData = {
                name: categoryForm.elements['name'].value,
                status: categoryForm.elements['status'].value
            };
            
            if (currentEditMode === 'edit' && currentCategoryId) {
                // Update existing category
                const categoryIndex = categories.findIndex(c => c.id === currentCategoryId);
                if (categoryIndex !== -1) {
                    // Update category data while preserving other properties
                    categories[categoryIndex] = {
                        ...categories[categoryIndex],
                        ...formData
                    };
                    
                    console.log('Category updated:', categories[categoryIndex]);
                }
            } else {
                // Add new category
                const newCategory = {
                    id: '#CAT-' + (categories.length + 1).toString().padStart(3, '0'),
                    ...formData,
                    products: 0
                };
                
                categories.push(newCategory);
                console.log('New category added:', newCategory);
            }
            
            // Close modal
            categoryModal.classList.remove('show');
            
            // Reset edit mode
            currentEditMode = 'add';
            currentCategoryId = null;
            
            // Reload categories table
            loadCategoriesTable();
        });
    }

    // Add Promotion Button
    const addPromotionBtn = document.getElementById('add-promotion-btn');
    if (addPromotionBtn) {
        addPromotionBtn.addEventListener('click', function() {
            openPromotionModal('add');
        });
    }

    // Save Promotion Button
    const savePromotionBtn = document.getElementById('save-promotion-btn');
    if (savePromotionBtn) {
        savePromotionBtn.addEventListener('click', function() {
            const promotionForm = document.getElementById('promotion-form');
            
            // Validate form
            if (!promotionForm.checkValidity()) {
                promotionForm.reportValidity();
                return;
            }
            
            // Get form data
            const formData = {
                code: promotionForm.elements['code'].value,
                description: promotionForm.elements['description'].value,
                discount: promotionForm.elements['discount'].value,
                startDate: formatDateFromInput(promotionForm.elements['startDate'].value),
                endDate: formatDateFromInput(promotionForm.elements['endDate'].value),
                status: promotionForm.elements['status'].value
            };
            
            if (currentEditMode === 'edit' && currentPromotionCode) {
                // Update existing promotion
                const promotionIndex = promotions.findIndex(p => p.code === currentPromotionCode);
                if (promotionIndex !== -1) {
                    // Update promotion data
                    promotions[promotionIndex] = formData;
                    
                    console.log('Promotion updated:', promotions[promotionIndex]);
                }
            } else {
                // Add new promotion
                promotions.push(formData);
                console.log('New promotion added:', formData);
            }
            
            // Close modal
            promotionModal.classList.remove('show');
            
            // Reset edit mode
            currentEditMode = 'add';
            currentPromotionCode = null;
            
            // Reload promotions table
            loadPromotionsTable();
        });
    }
    
    // Filter functionality
    const orderStatusFilter = document.getElementById('order-status-filter');
    const applyOrderFiltersBtn = document.getElementById('apply-order-filters');
    const resetOrderFiltersBtn = document.getElementById('reset-order-filters');
    
    if (applyOrderFiltersBtn) {
        applyOrderFiltersBtn.addEventListener('click', function() {
            // In a real application, this would filter the orders
            const status = orderStatusFilter.value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            
            console.log('Filtering orders:', { status, startDate, endDate });
            
            // Show notification
            alert(`Filters applied: Status=${status}, Start Date=${startDate}, End Date=${endDate}`);
        });
    }
    
    if (resetOrderFiltersBtn) {
        resetOrderFiltersBtn.addEventListener('click', function() {
            // Reset filters
            orderStatusFilter.value = 'all';
            document.getElementById('start-date').value = '';
            document.getElementById('end-date').value = '';
            
            // In a real application, this would reload all orders
            console.log('Filters reset');
        });
    }
    
    // Product category filter
    const productCategoryFilter = document.getElementById('product-category-filter');
    if (productCategoryFilter) {
        productCategoryFilter.addEventListener('change', function() {
            const category = this.value;
            
            // In a real application, this would filter the products
            console.log('Filtering products by category:', category);
            
            // Simple client-side filtering for demo
            const productCards = document.querySelectorAll('#products-grid .product-card');
            productCards.forEach(card => {
                const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
                if (category === 'all' || productCategory.includes(category.toLowerCase())) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Promotion status filter
    const promotionStatusFilter = document.getElementById('promotion-status-filter');
    if (promotionStatusFilter) {
        promotionStatusFilter.addEventListener('change', function() {
            const status = this.value;
            
            // In a real application, this would filter the promotions
            console.log('Filtering promotions by status:', status);
            
            // Simple client-side filtering for demo
            const promotionRows = document.querySelectorAll('#promotions-table tbody tr');
            promotionRows.forEach(row => {
                const statusBadge = row.querySelector('.status-badge');
                if (status === 'all' || statusBadge.classList.contains(status)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Product search
    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // In a real application, this would search the products
            console.log('Searching products:', searchTerm);
            
            // Simple client-side filtering for demo
            const productCards = document.querySelectorAll('#products-grid .product-card');
            productCards.forEach(card => {
                const productName = card.querySelector('h3').textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Category search
    const categorySearch = document.getElementById('category-search');
    if (categorySearch) {
        categorySearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // In a real application, this would search the categories
            console.log('Searching categories:', searchTerm);
            
            // Simple client-side filtering for demo
            const categoryRows = document.querySelectorAll('#categories-table tbody tr');
            categoryRows.forEach(row => {
                const categoryName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                if (categoryName.includes(searchTerm)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Promotion search
    const promotionSearch = document.getElementById('promotion-search');
    if (promotionSearch) {
        promotionSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // In a real application, this would search the promotions
            console.log('Searching promotions:', searchTerm);
            
            // Simple client-side filtering for demo
            const promotionRows = document.querySelectorAll('#promotions-table tbody tr');
            promotionRows.forEach(row => {
                const promoCode = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const description = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                if (promoCode.includes(searchTerm) || description.includes(searchTerm)) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // In a real application, this would search across all data
            console.log('Global search:', searchTerm);
        });
    }
    
    // Initialize charts
    function initCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenue-chart');
        if (revenueCtx) {
            const revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Revenue',
                        data: [300, 450, 320, 500, 480, 600, 580, 650, 700, 720, 750, 800],
                        borderColor: '#ff6b00',
                        backgroundColor: 'rgba(255, 107, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + 'K đ';
                                }
                            }
                        }
                    }
                }
            });
            
            // Update chart when period changes
            const revenuePeriod = document.getElementById('revenue-period');
            if (revenuePeriod) {
                revenuePeriod.addEventListener('change', function() {
                    const period = this.value;
                    
                    // In a real application, this would fetch new data based on the period
                    console.log('Changing revenue chart period to:', period);
                    
                    // Simulate data change
                    let newData;
                    if (period === 'weekly') {
                        newData = [50, 70, 60, 80, 75, 90, 85];
                        revenueChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    } else if (period === 'monthly') {
                        newData = [300, 450, 320, 500, 480, 600, 580, 650, 700, 720, 750, 800];
                        revenueChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    } else if (period === 'yearly') {
                        newData = [3500, 4200, 4800, 5100, 5800];
                        revenueChart.data.labels = ['2021', '2022', '2023', '2024', '2025'];
                    }
                    
                    revenueChart.data.datasets[0].data = newData;
                    revenueChart.update();
                });
            }
        }
        
        // Categories Chart
        const categoriesCtx = document.getElementById('categories-chart');
        if (categoriesCtx) {
            const categoriesChart = new Chart(categoriesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Pizzas', 'Burgers', 'Salads', 'Drinks', 'Desserts'],
                    datasets: [{
                        data: [35, 25, 15, 20, 5],
                        backgroundColor: [
                            '#ff6b00',
                            '#4caf50',
                            '#2196f3',
                            '#f44336',
                            '#9c27b0'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    // Helper Functions
    function formatPrice(price) {
        return price.toLocaleString() + ' đ';
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function formatDateForInput(dateStr) {
        // Convert from DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    function formatDateFromInput(dateStr) {
        // Convert from YYYY-MM-DD to DD/MM/YYYY
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    // Initialize the dashboard
    function initDashboard() {
        loadRecentOrders();
        loadTopProducts();
        loadOrdersTable();
        loadProductsGrid();
        loadCategoriesTable();
        loadPromotionsTable();
        loadCustomersTable();
        initCharts();
    }
    
    // Call initialization function
    initDashboard();

    // Update save functions to save to localStorage
    function saveOrder(orderData) {
        const orderIndex = orders.findIndex(o => o.id === orderData.id);
        if (orderIndex !== -1) {
            orders[orderIndex] = orderData;
        } else {
            orders.push(orderData);
        }
        localStorage.setItem('allOrders', JSON.stringify(orders));
    }

    function saveProduct(productData) {
        const productIndex = products.findIndex(p => p.id === productData.id);
        if (productIndex !== -1) {
            products[productIndex] = productData;
        } else {
            products.push(productData);
        }
        localStorage.setItem('allProducts', JSON.stringify(products));
    }

    function saveCategory(categoryData) {
        const categoryIndex = categories.findIndex(c => c.id === categoryData.id);
        if (categoryIndex !== -1) {
            categories[categoryIndex] = categoryData;
        } else {
            categories.push(categoryData);
        }
        localStorage.setItem('allCategories', JSON.stringify(categories));
    }

    function savePromotion(promotionData) {
        const promotionIndex = promotions.findIndex(p => p.code === promotionData.code);
        if (promotionIndex !== -1) {
            promotions[promotionIndex] = promotionData;
        } else {
            promotions.push(promotionData);
        }
        localStorage.setItem('allPromotions', JSON.stringify(promotions));
    }

    function saveCustomer(customerData) {
        const customerIndex = customers.findIndex(c => c.id === customerData.id);
        if (customerIndex !== -1) {
            customers[customerIndex] = customerData;
        } else {
            customers.push(customerData);
        }
        localStorage.setItem('allCustomers', JSON.stringify(customers));
    }

    // Update delete functions to save to localStorage
    function deleteOrder(orderId) {
        if (!orderId) {
            console.error('Order ID is required for deletion');
            return;
        }
        
        // Find the order index
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            console.error(`Order with ID ${orderId} not found`);
            return;
        }
        
        // Remove the order
        orders.splice(orderIndex, 1);
        
        // Update localStorage
        localStorage.setItem('allOrders', JSON.stringify(orders));
        
        // Show success message
        alert(`Order ${orderId} has been deleted successfully`);
        
        // Reload tables
        loadRecentOrders();
        loadOrdersTable();
    }

    function deleteProduct(productId) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('allProducts', JSON.stringify(products));
    }

    function deleteCategory(categoryId) {
        categories = categories.filter(c => c.id !== categoryId);
        localStorage.setItem('allCategories', JSON.stringify(categories));
    }

    function deletePromotion(promoCode) {
        promotions = promotions.filter(p => p.code !== promoCode);
        localStorage.setItem('allPromotions', JSON.stringify(promotions));
    }

    function deleteCustomer(customerId) {
        customers = customers.filter(c => c.id !== customerId);
        localStorage.setItem('allCustomers', JSON.stringify(customers));
    }

    // Update save order functionality
    const saveOrderBtn = document.getElementById('save-order-btn');
    if (saveOrderBtn) {
        saveOrderBtn.addEventListener('click', function() {
            if (currentEditMode === 'edit' && currentOrderId) {
                const order = orders.find(o => o.id === currentOrderId);
                if (order) {
                    // Get updated values from modal
                    const statusSelect = document.getElementById('status-select');
                    const customerInput = document.getElementById('customer-input');
                    
                    if (statusSelect) order.status = statusSelect.value;
                    if (customerInput) order.customer = customerInput.value;
                    
                    // Save changes
                    saveOrder(order);
                    
                    // Reload tables
                    loadRecentOrders();
                    loadOrdersTable();
                    
                    // Close modal
                    orderDetailsModal.classList.remove('show');
                    
                    // Show success message
                    alert(`Order ${currentOrderId} has been updated successfully`);
                }
            }
        });
    }

    // Theo dõi thay đổi localStorage để reload bảng đơn hàng khi có đơn mới/hủy từ khách hàng
    let lastOrdersData = localStorage.getItem('allOrders');
    setInterval(() => {
        const currentOrdersData = localStorage.getItem('allOrders');
        if (currentOrdersData !== lastOrdersData) {
            orders = JSON.parse(currentOrdersData || '[]');
            loadRecentOrders();
            loadOrdersTable();
            lastOrdersData = currentOrdersData;
        }
    }, 2000); // Kiểm tra mỗi 2 giây
});