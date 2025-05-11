document.addEventListener('DOMContentLoaded', async function() {
    // Initialize dummy data
    let orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    let products = JSON.parse(localStorage.getItem('allProducts') || '[]');
    let categories = JSON.parse(localStorage.getItem('allCategories') || '[]');
    let promotions = JSON.parse(localStorage.getItem('allPromotions') || '[]');
    let customers = JSON.parse(localStorage.getItem('allCustomers') || '[]');

    // Load initial data if none in localStorage
    (async function() {
        try {
            // Initialize orders if none exist
            if (orders.length === 0) {
                // Sample orders
                orders = [
                    { id: 'Customer-001', customer: 'Bui Ngoc Duc', date: '2025-05-05T08:08:00', items: 3, amount: 350000, status: 'completed' },
                    { id: 'Customer-002', customer: 'Bui Ngoc Duc', date: '2025-05-05T08:12:00', items: 4, amount: 420000, status: 'processing' },
                    { id: 'Customer-003', customer: 'Bui Ngoc Duc', date: '2025-05-05T07:20:00', items: 2, amount: 280000, status: 'delivered' },
                    { id: 'Customer-004', customer: 'Bui Ngoc Duc', date: '2025-05-04T16:10:00', items: 5, amount: 520000, status: 'cancelled' },
                    { id: 'Customer-005', customer: 'Bui Ngoc Duc', date: '2025-05-04T15:30:00', items: 3, amount: 380000, status: 'completed' }
                ];
                localStorage.setItem('allOrders', JSON.stringify(orders));
            }

            // Load customers if none exist
            if (customers.length === 0) {
                // Sample customers
                customers = [
                    {
                        id: 'CUST-001',
                        name: 'Bui Ngoc Duc',
                        email: 'buiduc21012004@gmail.com',
                        phone: '0383051321',
                        address: 'Ha Noi',
                        status: 'active',
                        orders: 5,
                        totalSpent: 1950000,
                        joinedDate: '01/05/2023',
                        lastOrder: '05/05/2023'
                    },
                    {
                        id: 'CUST-002',
                        name: 'Nguyen Van A',
                        email: 'nguyenvana@gmail.com',
                        phone: '0987654321',
                        address: 'Ho Chi Minh City',
                        status: 'active',
                        orders: 3,
                        totalSpent: 850000,
                        joinedDate: '15/03/2023',
                        lastOrder: '01/05/2023'
                    },
                    {
                        id: 'CUST-003',
                        name: 'Tran Thi B',
                        email: 'tranthib@gmail.com',
                        phone: '0123456789',
                        address: 'Da Nang',
                        status: 'inactive',
                        orders: 2,
                        totalSpent: 450000,
                        joinedDate: '10/02/2023',
                        lastOrder: '15/04/2023'
                    }
                ];
                localStorage.setItem('allCustomers', JSON.stringify(customers));
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    })();

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
        
        // Sort orders by date (newest first)
        const sortedOrders = [...orders].sort((a, b) => {
            const dateA = new Date(a.date || a.dateTimeStr);
            const dateB = new Date(b.date || b.dateTimeStr);
            return dateB - dateA;
        });
        
        // Get the 5 most recent orders
        const recentOrders = sortedOrders.slice(0, 5);
        
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

            // Calculate total items
            let totalItems = 0;
            if (order.items && Array.isArray(order.items)) {
                totalItems = order.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
            } else if (order.itemsCount) {
                totalItems = parseInt(order.itemsCount) || 0;
            } else {
                totalItems = order.items || 0;
            }
            
            // Create row with proper data
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
                <td>${totalItems} items</td>
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
        
        // Sort products by sales (top sellers first)
        const sortedProducts = [...products].sort((a, b) => b.sales - a.sales);
        
        sortedProducts.forEach(product => {
            const statusClass = product.status === 'active' ? 'active' : 'inactive';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badge ${statusClass}">${product.status}</div>
                ${product.badge ? `<div class="product-badge featured">${product.badge}</div>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='../image/Combo_1.png'">
                </div>
                <div class="product-details">
                    <h4>${product.name}</h4>
                    <div class="product-meta">
                        <span class="product-category">${product.category}</span>
                        <span class="product-price">${formatPrice(product.price)}</span>
                    </div>
                    <div class="product-stats">
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>${product.rating}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-shopping-bag"></i>
                            <span>${product.sales} sales</span>
                        </div>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="product-action-btn edit" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="product-action-btn delete" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            productsGrid.appendChild(card);
        });
        
        // Add event listeners to buttons
        const editButtons = productsGrid.querySelectorAll('.product-action-btn.edit');
        const deleteButtons = productsGrid.querySelectorAll('.product-action-btn.delete');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                openProductModal('edit', productId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    // Find product index
                    const productIndex = products.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        // Remove product from array
                        products.splice(productIndex, 1);
                        
                        // Save to localStorage
                        localStorage.setItem('allProducts', JSON.stringify(products));
                        
                        // Reload products grid
                        loadProductsGrid();
                        
                        // Show notification
                        showNotification('Success', 'Product deleted successfully', 'success');
                    }
                }
            });
        });
        
        // Add new product button
        const addButton = document.createElement('div');
        addButton.className = 'product-card add-card';
        addButton.innerHTML = `
            <div class="add-product-icon">
                <i class="fas fa-plus"></i>
            </div>
            <h4>Add New Product</h4>
        `;
        addButton.addEventListener('click', function() {
            openProductModal('add');
        });
        
        productsGrid.appendChild(addButton);
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
        
        // Set current order ID
        currentOrderId = orderId;
        
        // Populate modal with order details
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('modal-order-id').textContent = orderId;
        document.getElementById('modal-order-date').textContent = formatDateForDisplay(order.date || order.dateTimeStr);
        
        // Status field - show current status
        const statusField = document.getElementById('modal-order-status');
        if (statusField) {
                statusField.innerHTML = `<span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span>`;
            }
        
        // Status select - set the current value
        const statusSelect = document.getElementById('status-select');
        if (statusSelect) {
            statusSelect.value = order.status;
        }
        
        // Customer name field
        const customerField = document.getElementById('modal-customer-name');
        if (customerField) {
                customerField.textContent = order.customer || 'Khách hàng';
            }
        
        // Customer phone field
        const phoneField = document.getElementById('modal-customer-phone');
        if (phoneField) {
            phoneField.textContent = order.phone || '0383051321';
        }
        
        // Customer address field
        const addressField = document.getElementById('modal-customer-address');
        if (addressField) {
            addressField.textContent = order.address || 'Ha Noi';
        }
        
        // Set order totals
        const subtotal = order.subtotal || (order.amount - 20000);
        const serviceFee = order.serviceFee || 20000;
        const discount = order.discount || 0;
        const total = order.total || order.amount || (subtotal + serviceFee - discount);
        
        document.getElementById('modal-subtotal').textContent = formatPrice(subtotal);
        document.getElementById('modal-delivery-fee').textContent = formatPrice(serviceFee);
        document.getElementById('modal-discount').textContent = `-${formatPrice(discount)}`;
        document.getElementById('modal-total').textContent = formatPrice(total);
        
        // Populate order items
            const modalItems = document.getElementById('modal-order-items');
            if (modalItems) {
            if (order.items && Array.isArray(order.items)) {
                modalItems.innerHTML = order.items.map(item => `
                    <tr>
                        <td>
                            <div class="item-info">
                                <img src="${item.image}" alt="${item.name}" class="item-image">
                                <span>${item.name}</span>
                    </div>
                        </td>
                        <td>${formatPrice(item.price)}</td>
                        <td>${item.quantity}</td>
                        <td>${formatPrice(item.price * item.quantity)}</td>
                    </tr>
                `).join('');
            } else {
                // Default items if not available
                modalItems.innerHTML = `
                    <tr>
                        <td>
                            <div class="item-info">
                                <img src="../image/pizza_1.png" alt="Pizza Margherita" class="item-image">
                                <span>Pizza Margherita</span>
                            </div>
                        </td>
                        <td>${formatPrice(80000)}</td>
                        <td>1</td>
                        <td>${formatPrice(80000)}</td>
                    </tr>
                    <tr>
                        <td>
                            <div class="item-info">
                                <img src="../image/garlic_bread_1.png" alt="Garlic Bread" class="item-image">
                                <span>Garlic Bread</span>
                            </div>
                        </td>
                        <td>${formatPrice(30000)}</td>
                        <td>1</td>
                        <td>${formatPrice(30000)}</td>
                    </tr>
                `;
            }
        }
        
        // Update status button handler
        const updateStatusBtn = document.getElementById('update-status');
        if (updateStatusBtn) {
            // Remove existing event listeners
            const newUpdateStatusBtn = updateStatusBtn.cloneNode(true);
            updateStatusBtn.parentNode.replaceChild(newUpdateStatusBtn, updateStatusBtn);
            
            newUpdateStatusBtn.addEventListener('click', function() {
                openOrderDetailsModal(orderId, 'edit');
            });
        }
        
        // Show the modal
        orderDetailsModal.classList.add('show');
    }
    
    // Open Product Modal
    function openProductModal(mode, productId = null) {
        const productModal = document.getElementById('product-modal');
        if (!productModal) return;
        
        const modalTitle = document.getElementById('product-modal-title');
        const productForm = document.getElementById('product-form');
        if (!productForm) {
            showNotification('Error', 'Product form not found', 'error');
            return;
        }
        
        const saveBtn = document.getElementById('save-product-btn');
        const imagePreview = document.querySelector('.image-preview');
        const imagePreviewImg = imagePreview ? imagePreview.querySelector('img') : null;
        
        // Set current edit mode and product ID
        currentEditMode = mode;
        currentProductId = productId;
        
        // Reset form and preview
        productForm.reset();
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }
        
        if (mode === 'add') {
            modalTitle.textContent = 'Add New Product';
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
            productForm.elements['status'].value = product.status;
            
            // Handle image
            if (product.image) {
                // Check if the image is from the 'image' directory
                if (product.image.includes('/image/')) {
                    // Set the existing image dropdown
                    if (productForm.elements['existingImage']) {
                        productForm.elements['existingImage'].value = product.image;
                    }
                }
                
                // Show image preview
                if (imagePreviewImg) {
                    imagePreviewImg.src = product.image;
                    imagePreview.style.display = 'block';
                }
            }
            
            saveBtn.textContent = 'Update Product';
        }
        
        // Initialize image preview
        initImagePreview();
        
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
            tr.className = 'customer-row';
            tr.dataset.id = customer.id;
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td>${customer.id}</td>
                <td>
                    <div class="customer-info">
                        <img src="../image/Banner.png" alt="Customer Avatar" class="customer-avatar">
                        <span class="customer-name">${customer.name}</span>
                    </div>
                </td>
                <td class="customer-email">${customer.email}</td>
                <td class="customer-phone">${customer.phone}</td>
                <td class="customer-orders">${customer.orders}</td>
                <td class="customer-spent">${formatPrice(customer.totalSpent)}</td>
                <td><span class="status-badge ${customer.status}">${capitalizeFirstLetter(customer.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="View Customer" data-id="${customer.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" title="Edit Customer" data-id="${customer.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete Customer" data-id="${customer.id}">
                            <i class="fas fa-trash"></i>
                        </button>
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
                const customerName = customers.find(c => c.id === customerId)?.name || customerId;
                
                if (confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
                    // Find the index of the customer to delete
                    const customerIndex = customers.findIndex(c => c.id === customerId);
                    if (customerIndex !== -1) {
                        // Remove the customer from the array
                        customers.splice(customerIndex, 1);
                        
                        // Save to localStorage
                        localStorage.setItem('allCustomers', JSON.stringify(customers));
                        
                        // Remove the row from the table
                        this.closest('tr').remove();
                        
                        // Show notification
                        showNotification('Success', `Customer "${customerName}" has been deleted`, 'success');
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
        // Remove existing event listeners to prevent duplicates
        const newSaveCustomerBtn = saveCustomerBtn.cloneNode(true);
        saveCustomerBtn.parentNode.replaceChild(newSaveCustomerBtn, saveCustomerBtn);
        
        newSaveCustomerBtn.addEventListener('click', function() {
            console.log('Save customer button clicked');
            const customerForm = document.getElementById('customer-form');
            
            if (!customerForm) {
                showNotification('Error', 'Customer form not found', 'error');
                return;
            }
            
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
            
            console.log('Customer data:', formData);
            
            if (currentEditMode === 'edit' && currentCustomerId) {
                // Update existing customer
                const customerIndex = customers.findIndex(c => c.id === currentCustomerId);
                if (customerIndex !== -1) {
                    // Update customer data while preserving other properties
                    customers[customerIndex] = {
                        ...customers[customerIndex],
                        ...formData
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('allCustomers', JSON.stringify(customers));
                    
                    showNotification('Success', `Customer "${formData.name}" has been updated successfully`, 'success');
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
                
                // Add to customers array
                customers.push(newCustomer);
                
                // Save to localStorage
                localStorage.setItem('allCustomers', JSON.stringify(customers));
                
                showNotification('Success', `Customer "${formData.name}" has been added successfully`, 'success');
            }
            
            // Close modal
            const customerModal = document.getElementById('customer-modal');
            if (customerModal) {
                customerModal.classList.remove('show');
            }
            
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
        saveProductBtn.addEventListener('click', async function() {
            const productForm = document.getElementById('product-form');
            if (!productForm) {
                showNotification('Error', 'Product form not found', 'error');
                return;
            }
            
            // Validate form
            if (!productForm.checkValidity()) {
                productForm.reportValidity();
                return;
            }

            try {
                // Show loading state
                saveProductBtn.textContent = 'Saving...';
                saveProductBtn.disabled = true;
                
                // Get form data
                const name = productForm.elements['name'].value;
                const category = productForm.elements['category'].value;
                const price = productForm.elements['price'].value;
                const status = productForm.elements['status'].value;
                
                // Debug log to check values
                console.log('Adding product:', {name, category, price, status});
                
                // Handle image
                let imageUrl = '';
                const imageFile = productForm.elements['image'].files[0];
                const selectedImagePath = productForm.elements['existingImage'] ? productForm.elements['existingImage'].value : '';
                
                if (imageFile) {
                    // Show simulated upload progress
                    showNotification('Processing', 'Uploading image... Please wait', 'processing');
                    
                    // Simulate API upload with a delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    try {
                        // Display success message as if it uploaded through API
                        showNotification('Success', 'Image uploaded successfully via API', 'success');
                        
                        // Use the selected image or fallback to a default based on category
                        if (selectedImagePath) {
                            imageUrl = selectedImagePath;
                        } else {
                            const imageTypes = {
                                'pizzas': '../image/pizza_1.png',
                                'burgers': '../image/combo_6.png',
                                'salads': '../image/salad_1.png',
                                'drinks': '../image/drink_1.png',
                                'desserts': '../image/Deals_1.png'
                            };
                            imageUrl = imageTypes[category.toLowerCase()] || '../image/Combo_1.png';
                        }
                    } catch (error) {
                        console.error('Upload simulation error:', error);
                        showNotification('Warning', 'Upload failed. Using selected image instead', 'warning');
                        
                        // Fallback to selected image or default
                        if (selectedImagePath) {
                            imageUrl = selectedImagePath;
                        } else {
                            const imageTypes = {
                                'pizzas': '../image/pizza_1.png',
                                'burgers': '../image/combo_6.png',
                                'salads': '../image/salad_1.png',
                                'drinks': '../image/drink_1.png',
                                'desserts': '../image/Deals_1.png'
                            };
                            imageUrl = imageTypes[category.toLowerCase()] || '../image/Combo_1.png';
                        }
                    }
                } else if (selectedImagePath) {
                    // If no file was uploaded but an existing image was selected
                    imageUrl = selectedImagePath;
                    showNotification('Info', 'Using selected image from gallery', 'info');
                } else if (currentEditMode === 'edit' && currentProductId) {
                    // Keep the existing image for edit mode if no new image was provided
                    const existingProduct = products.find(p => p.id === currentProductId);
                    imageUrl = existingProduct ? existingProduct.image : '';
                } else {
                    // Default image based on category
                    const imageTypes = {
                        'pizzas': '../image/pizza_1.png',
                        'burgers': '../image/combo_6.png',
                        'salads': '../image/salad_1.png',
                        'drinks': '../image/drink_1.png',
                        'desserts': '../image/Deals_1.png'
                    };
                    imageUrl = imageTypes[category.toLowerCase()] || '../image/Combo_1.png';
                    showNotification('Info', 'Using default image for category', 'info');
                }
                
                // Create product object
                const productData = {
                    name,
                    category,
                    price: parseInt(price),
                    image: imageUrl,
                    status,
                    rating: 4.5,
                    sales: 0
                };
                
                // Add or update product
                if (currentEditMode === 'edit' && currentProductId) {
                    // Update existing product
                    productData.id = currentProductId;
                    
                    // Find the product index
                    const productIndex = products.findIndex(p => p.id === currentProductId);
                    if (productIndex !== -1) {
                        // Preserve existing rating and sales data
                        productData.rating = products[productIndex].rating || 4.5;
                        productData.sales = products[productIndex].sales || 0;
                        
                        // Update product
                        products[productIndex] = productData;
                        
                        // Save to localStorage
                        localStorage.setItem('allProducts', JSON.stringify(products));
                        
                        // Show success message
                        showNotification('Success', `Product "${name}" has been updated successfully`, 'success');
                    }
                } else {
                    // Add new product
                    productData.id = 'P' + Math.floor(Math.random() * 10000);
                    
                    // Add to products array
                    products.push(productData);
                    
                    // Save to localStorage
                    localStorage.setItem('allProducts', JSON.stringify(products));
                    
                    // Show success message
                    showNotification('Success', `Product "${name}" has been added successfully`, 'success');
                }
                
                // Close modal
                const productModal = document.getElementById('product-modal');
                if (productModal) {
                    productModal.classList.remove('show');
                }
                
                // Reload products grid
                loadProductsGrid();
                loadTopProducts();
            } catch (error) {
                console.error('Error saving product:', error);
                showNotification('Error', 'Failed to save product. Please try again.', 'error');
            } finally {
                // Reset button state
                saveProductBtn.textContent = currentEditMode === 'edit' ? 'Update Product' : 'Add Product';
                saveProductBtn.disabled = false;
            }
        });
    }

    // Add image preview functionality
    function initImagePreview() {
    const imageInput = document.querySelector('input[name="image"]');
    const imagePreview = document.querySelector('.image-preview');
        const existingImageSelect = document.querySelector('select[name="existingImage"]');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                    // When file is selected, clear the existing image selection
                    if (existingImageSelect) {
                        existingImageSelect.value = '';
                    }
                    
                const reader = new FileReader();
                reader.onload = function(e) {
                        const previewImg = imagePreview.querySelector('img');
                        if (previewImg) {
                            previewImg.src = e.target.result;
                            imagePreview.style.display = 'flex';
                        }
                }
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
            }
        });
        }
        
        if (existingImageSelect && imagePreview) {
            existingImageSelect.addEventListener('change', function() {
                if (this.value) {
                    // When existing image is selected, clear the file input
                    if (imageInput) {
                        imageInput.value = '';
                    }
                    
                    const previewImg = imagePreview.querySelector('img');
                    if (previewImg) {
                        previewImg.src = this.value;
                        imagePreview.style.display = 'flex';
                    }
                } else {
                    imagePreview.style.display = 'none';
                }
            });
        }
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
    if (false) { // Skip chart initialization
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
        }
    }
    
    // Helper Functions
    function formatPrice(price) {
        return price.toLocaleString() + ' đ';
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Format date for input type="date" (YYYY-MM-DD)
    function formatDateForInput(dateStr) {
        // Handle different input formats
        if (!dateStr) return '';
        
        try {
            // Check if format is DD/MM/YYYY
            if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            
            // Try to parse as a date object
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        } catch (err) {
            console.error('Error formatting date for input:', err);
        }
        
        return dateStr; // Return original if parsing fails
    }

    // Format date from input (YYYY-MM-DD to locale format)
    function formatDateFromInput(dateStr) {
        if (!dateStr) return '';
        
        try {
            // If format is YYYY-MM-DD
            if (dateStr.includes('-')) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                }
                
                // Fallback to manual parsing
        const parts = dateStr.split('-');
                if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }
        } catch (err) {
            console.error('Error formatting date from input:', err);
        }
        
        return dateStr; // Return original if parsing fails
    }
    
    // Format date for display
    function formatDateForDisplay(dateStr) {
        if (!dateStr) return '';
        
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                // Format to "May 5, 2025 - 08:08 AM"
                const options = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                };
                
                // Use English locale (en-US)
                const formattedDate = date.toLocaleString('en-US', options);
                
                // Convert from "May 5, 2025, 08:08 AM" to "May 5, 2025 - 08:08 AM"
                return formattedDate.replace(',', ' -');
            }
        } catch (err) {
            console.error('Error formatting date for display:', err);
        }
        
        return dateStr; // Return original if parsing fails
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
        
        // Show notification
        showNotification('Success', `Order ${orderId} has been deleted successfully`, 'success');
        
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
        // Remove existing event listeners to prevent duplicates
        const newSaveOrderBtn = saveOrderBtn.cloneNode(true);
        saveOrderBtn.parentNode.replaceChild(newSaveOrderBtn, saveOrderBtn);
        
        newSaveOrderBtn.addEventListener('click', function() {
            if (currentEditMode === 'edit' && currentOrderId) {
                const order = orders.find(o => o.id === currentOrderId);
                if (order) {
                    // Get updated values from modal
                    const statusSelect = document.getElementById('status-select');
                    const customerInput = document.getElementById('customer-input');
                    
                    if (statusSelect) {
                        const newStatus = statusSelect.value;
                        // Only update if status has changed
                        if (newStatus !== order.status) {
                            order.status = newStatus;
                            // Show notification about status change
                            showNotification('Status Updated', `Order ${currentOrderId} status changed to ${capitalizeFirstLetter(newStatus)}`, 'success');
                        }
                    }
                    
                    if (customerInput) order.customer = customerInput.value;
                    
                    // Save changes
                    saveOrder(order);
                    
                    // Reload tables
                    loadRecentOrders();
                    loadOrdersTable();
                    
                    // Close modal
                    const orderDetailsModal = document.getElementById('order-details-modal');
                    if (orderDetailsModal) {
                    orderDetailsModal.classList.remove('show');
                    }
                    
                    // Show success message
                    showNotification('Success', `Order ${currentOrderId} has been updated successfully`, 'success');
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
            
            // Show notification about data change
            showNotification('Update', 'Order data has been updated', 'info');
        }
    }, 2000); // Kiểm tra mỗi 2 giây

    // Kết nối WebSocket
    const socket = io('http://localhost:3000');

    // Xác thực socket connection
    socket.on('connect', () => {
        const token = localStorage.getItem('token');
        if (token) {
            socket.emit('authenticate', token);
        }
    });

    // Xử lý thông báo đơn hàng mới
    socket.on('order_notification', (data) => {
        if (data.type === 'new_order') {
            showNotification('Đơn hàng mới', `Đơn hàng #${data.order.id} vừa được đặt`, 'info');
            updateOrderList(); // Cập nhật danh sách đơn hàng
        }
    });

    // Xử lý cập nhật trạng thái đơn hàng
    socket.on('order_update', (data) => {
        updateOrderStatus(data.orderId, data.status);
        showNotification('Cập nhật đơn hàng', `Đơn hàng #${data.orderId} đã được cập nhật`, 'info');
    });

    // Xử lý tin nhắn từ user
    socket.on('user_message', (message) => {
        showChatMessage(message);
        showNotification('Tin nhắn mới', `Tin nhắn từ user #${message.userId}`, 'info');
    });

    // Hàm hiển thị thông báo
    function showNotification(title, message, type = 'default') {
        // Get notification type color
        const typeColors = {
            'success': '#4caf50',
            'warning': '#ff9800',
            'error': '#f44336',
            'info': '#2196f3',
            'processing': '#9c27b0',
            'default': '#ff6b00'
        };
        
        const color = typeColors[type] || typeColors.default;

        // Hiển thị toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.borderLeft = `4px solid ${color}`;
        
        // Add appropriate icon based on type
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'warning') iconClass = 'fa-exclamation-triangle';
        if (type === 'error') iconClass = 'fa-times-circle';
        if (type === 'processing') iconClass = 'fa-spinner fa-spin';
        
        toast.innerHTML = `
            <div class="toast-header" style="color: ${color}">
                <strong><i class="fas ${iconClass}"></i> ${title}</strong>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        // Remove existing notifications with the same title
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(existingToast => {
            const existingTitle = existingToast.querySelector('.toast-header strong');
            if (existingTitle && existingTitle.textContent === title) {
                existingToast.remove();
            }
        });
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-notification-hide');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Also show browser notification if available
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '../image/Foodieland.png'
                    });
                }
            });
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

    // Hàm cập nhật danh sách đơn hàng
    async function updateOrderList() {
        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const orders = await response.json();
            renderOrders(orders);
            loadRecentOrders(); // Update recent orders on dashboard
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Lỗi', 'Không thể cập nhật danh sách đơn hàng', 'error');
        }
    }

    // Hàm render danh sách đơn hàng
    function renderOrders(orders) {
        const orderList = document.getElementById('order-list');
        if (!orderList) return;

        orderList.innerHTML = orders.map(order => `
            <div class="order-item" data-order-id="${order.id}">
                <div class="order-header">
                    <h5>Đơn hàng #${order.id}</h5>
                    <span class="order-status badge ${getStatusClass(order.status)}">${order.status}</span>
                </div>
                <div class="order-body">
                    <p>Khách hàng: ${order.customerName}</p>
                    <p>Thời gian: ${new Date(order.createdAt).toLocaleString()}</p>
                    <p>Tổng tiền: ${order.total.toLocaleString('vi-VN')}đ</p>
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    <button class="btn btn-success btn-sm" onclick="updateOrderStatus(${order.id}, 'processing')">
                        <i class="fas fa-cog"></i> Xử lý
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fas fa-times"></i> Hủy
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Hàm xem chi tiết đơn hàng
    function viewOrderDetails(orderId) {
        // Implement order details view
    }

    // Hàm cập nhật trạng thái đơn hàng
    async function updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                socket.emit('order_status_update', { orderId, status });
                showNotification('Thành công', 'Cập nhật trạng thái đơn hàng thành công', 'success');
            } else {
                throw new Error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Lỗi', 'Không thể cập nhật trạng thái đơn hàng', 'error');
        }
    }

    // Thêm CSS cho notifications
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
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }

        .toast-notification-hide {
            transform: translateX(100%);
            opacity: 0;
        }

        .toast-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .toast-body {
            font-size: 14px;
        }

        .btn-close {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s;
        }

        .btn-close:hover {
            opacity: 1;
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
            transition: transform 0.2s ease;
        }

        .order-item:hover {
            transform: translateY(-2px);
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .order-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .order-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .btn-sm {
            padding: 4px 8px;
            font-size: 0.875rem;
        }
    `;
    document.head.appendChild(style);

    // Khởi tạo
    document.addEventListener('DOMContentLoaded', () => {
        updateOrderList();
        // Cập nhật danh sách đơn hàng mỗi 30 giây
        setInterval(updateOrderList, 30000);
    });

    // Initialize on DOM ready
    init();

    // Reset LocalStorage Function (for testing purposes)
    function resetOrdersData() {
        const mockOrders = [
            { id: 'Customer-001', customer: 'Bui Ngoc Duc', date: '2025-05-05T08:08:00', items: 3, amount: 350000, status: 'completed' },
            { id: 'Customer-002', customer: 'Bui Ngoc Duc', date: '2025-05-05T08:12:00', items: 4, amount: 420000, status: 'processing' },
            { id: 'Customer-003', customer: 'Bui Ngoc Duc', date: '2025-05-05T07:20:00', items: 2, amount: 280000, status: 'delivered' },
            { id: 'Customer-004', customer: 'Bui Ngoc Duc', date: '2025-05-04T16:10:00', items: 5, amount: 520000, status: 'cancelled' },
            { id: 'Customer-005', customer: 'Bui Ngoc Duc', date: '2025-05-04T15:30:00', items: 3, amount: 380000, status: 'completed' }
        ];
        
        localStorage.setItem('allOrders', JSON.stringify(mockOrders));
        orders = mockOrders;
        
        // Reload tables
        loadRecentOrders();
        loadOrdersTable();
        
        showNotification('Success', 'Orders data has been reset with proper date format', 'success');
    }

    // Add a hidden button that can be triggered by developers
    document.addEventListener('keydown', function(event) {
        // Press Ctrl+Shift+R to reset orders data
        if (event.ctrlKey && event.shiftKey && event.key === 'R') {
            resetOrdersData();
        }
    });

    // Global function to handle the Save Customer button click (for inline handler)
    function handleSaveCustomer() {
        console.log('handleSaveCustomer called from inline handler');
        const customerForm = document.getElementById('customer-form');
        
        if (!customerForm) {
            showNotification('Error', 'Customer form not found', 'error');
            return;
        }
        
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
        
        console.log('Customer data:', formData);
        
        if (currentEditMode === 'edit' && currentCustomerId) {
            // Update existing customer
            const customerIndex = customers.findIndex(c => c.id === currentCustomerId);
            if (customerIndex !== -1) {
                // Update customer data while preserving other properties
                customers[customerIndex] = {
                    ...customers[customerIndex],
                    ...formData
                };
                
                // Save to localStorage
                localStorage.setItem('allCustomers', JSON.stringify(customers));
                
                showNotification('Success', `Customer "${formData.name}" has been updated successfully`, 'success');
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
            
            // Add to customers array
            customers.push(newCustomer);
            
            // Save to localStorage
            localStorage.setItem('allCustomers', JSON.stringify(customers));
            
            showNotification('Success', `Customer "${formData.name}" has been added successfully`, 'success');
        }
        
        // Close modal
        const customerModal = document.getElementById('customer-modal');
        if (customerModal) {
            customerModal.classList.remove('show');
        }
        
        // Reset edit mode
        currentEditMode = 'add';
        currentCustomerId = null;
        
        // Reload customers table
        loadCustomersTable();
    }

    // Assign handleSaveCustomer to window object to make it globally accessible
    window.handleSaveCustomer = function() {
        console.log('handleSaveCustomer called from inline handler');
        const customerForm = document.getElementById('customer-form');
        
        if (!customerForm) {
            showNotification('Error', 'Customer form not found', 'error');
            return;
        }
        
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
        
        console.log('Customer data:', formData);
        
        // Add new customer
        const newCustomer = {
            id: 'CUST-' + (Math.floor(Math.random() * 10000)).toString().padStart(4, '0'),
            ...formData,
            orders: 0,
            totalSpent: 0,
            joinedDate: new Date().toLocaleDateString('en-GB'),
            lastOrder: 'N/A'
        };
        
        // Get customers from localStorage
        let customers = JSON.parse(localStorage.getItem('allCustomers') || '[]');
        
        // Add to customers array
        customers.push(newCustomer);
        
        // Save to localStorage
        localStorage.setItem('allCustomers', JSON.stringify(customers));
        
        // Show success notification
        showNotification('Success', `Customer "${formData.name}" has been added successfully`, 'success');
        
        // Close modal
        const customerModal = document.getElementById('customer-modal');
        if (customerModal) {
            customerModal.classList.remove('show');
        }
        
        // Reload page to show new customer
        window.location.reload();
    };

    // Assign openCustomerModal to window object to make it globally accessible
    window.openCustomerModal = function(mode, customerId = null) {
        console.log('openCustomerModal called from inline handler with mode:', mode);
        const customerModal = document.getElementById('customer-modal');
        if (!customerModal) {
            console.error('Customer modal not found');
            return;
        }
        
        const modalTitle = document.getElementById('customer-modal-title');
        const customerForm = document.getElementById('customer-form');
        const saveBtn = document.getElementById('save-customer-btn');
        
        // Reset form
        if (customerForm) {
            customerForm.reset();
        }
        
        // Set title based on mode
        if (modalTitle) {
            modalTitle.textContent = mode === 'add' ? 'Add New Customer' : 'Edit Customer';
        }
        
        // Show the modal
        customerModal.classList.add('show');
        
        console.log('Customer modal should now be visible');
    };
});

// Add Product Button Click Handler
function setupAddProductButton() {
    const addProductBtn = document.getElementById('add-product-btn');
    console.log('Setting up addProductBtn:', addProductBtn);
    
    if (addProductBtn) {
        // Remove any existing event listeners
        const newAddProductBtn = addProductBtn.cloneNode(true);
        addProductBtn.parentNode.replaceChild(newAddProductBtn, addProductBtn);
        
        newAddProductBtn.addEventListener('click', function() {
            console.log('Add Product button clicked');
            openProductModal('add');
        });
    }
}

// Initialize Image Preview
function initImagePreview() {
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    imageInputs.forEach(input => {
        input.addEventListener('change', function() {
            const preview = this.parentElement.querySelector('.image-preview');
            const previewImg = preview ? preview.querySelector('img') : null;
            
            if (!preview || !previewImg) return;
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    preview.style.display = 'flex';
                }
                
                reader.readAsDataURL(this.files[0]);
            } else {
                preview.style.display = 'none';
            }
        });
    });
}

// Direct event listeners for critical buttons
function setupDirectEventListeners() {
    console.log('Setting up direct event listeners');
    // Add Customer button
    const addCustomerBtn = document.getElementById('add-customer-btn');
    if (addCustomerBtn) {
        console.log('Setting up direct event for Add Customer button');
        addCustomerBtn.onclick = function() {
            console.log('Add Customer button clicked directly');
            openCustomerModal('add');
        };
    }
    
    // Save Customer button
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    if (saveCustomerBtn) {
        console.log('Setting up direct event for Save Customer button');
        saveCustomerBtn.onclick = function() {
            console.log('Save Customer button clicked directly');
            const customerForm = document.getElementById('customer-form');
            
            if (!customerForm) {
                showNotification('Error', 'Customer form not found', 'error');
                return;
            }
            
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
            
            console.log('Customer data:', formData);
            
            if (currentEditMode === 'edit' && currentCustomerId) {
                // Update existing customer
                const customerIndex = customers.findIndex(c => c.id === currentCustomerId);
                if (customerIndex !== -1) {
                    // Update customer data while preserving other properties
                    customers[customerIndex] = {
                        ...customers[customerIndex],
                        ...formData
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('allCustomers', JSON.stringify(customers));
                    
                    showNotification('Success', `Customer "${formData.name}" has been updated successfully`, 'success');
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
                
                // Add to customers array
                customers.push(newCustomer);
                
                // Save to localStorage
                localStorage.setItem('allCustomers', JSON.stringify(customers));
                
                showNotification('Success', `Customer "${formData.name}" has been added successfully`, 'success');
            }
            
            // Close modal
            const customerModal = document.getElementById('customer-modal');
            if (customerModal) {
                customerModal.classList.remove('show');
            }
            
            // Reset edit mode
            currentEditMode = 'add';
            currentCustomerId = null;
            
            // Reload customers table
            loadCustomersTable();
        };
    }
}

// Call init functions
function init() {
    console.log('Initializing admin dashboard...');
    
    // Initialize dashboard if on dashboard page
    if (document.getElementById('dashboard')) {
        initDashboard();
    }
    
    // Load data tables
    loadRecentOrders();
    loadTopProducts();
    loadOrdersTable();
    loadProductsGrid();
    loadCategoriesTable();
    loadPromotionsTable();
    loadCustomersTable();
    
    // Initialize image preview
    initImagePreview();
    
    // Set up add buttons
    setupAddProductButton();
    setupAddCustomerButton();
    
    // Set up direct event listeners
    setupDirectEventListeners();
    
    // Add filter functionality
    const productCategoryFilter = document.getElementById('product-category-filter');
    
    if (productCategoryFilter) {
        productCategoryFilter.addEventListener('change', filterProducts);
    }
    
    console.log('Admin dashboard initialized');
}

// Make sure init() is called when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, running init()');
    // Run init function
    init();
    
    // Add keyboard shortcut for resetting data
    document.addEventListener('keydown', function(event) {
        // Press Ctrl+Shift+R to reset orders data
        if (event.ctrlKey && event.shiftKey && event.key === 'R') {
            resetOrdersData();
        }
    });
});

// Filter products function
function filterProducts() {
    const categoryFilter = document.getElementById('product-category-filter');
    
    if (!categoryFilter) return;
    
    const category = categoryFilter.value;
    
    // Filter products
    const filteredProducts = products.filter(product => {
        // Category filter
        if (category !== 'all' && product.category.toLowerCase() !== category.toLowerCase()) {
            return false;
        }
        
        return true;
    });
    
    // Update products grid with filtered products
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-results">No products found matching your filters</div>';
        return;
    }
    
    // Sort filtered products by sales
    const sortedProducts = [...filteredProducts].sort((a, b) => b.sales - a.sales);
    
    // Render filtered products
    sortedProducts.forEach(product => {
        const statusClass = product.status === 'active' ? 'active' : 'inactive';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-badge ${statusClass}">${product.status}</div>
            ${product.badge ? `<div class="product-badge featured">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='../image/Combo_1.png'">
            </div>
            <div class="product-details">
                <h4>${product.name}</h4>
                <div class="product-meta">
                    <span class="product-category">${product.category}</span>
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
                <div class="product-stats">
                    <div class="stat">
                        <i class="fas fa-star"></i>
                        <span>${product.rating}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-shopping-bag"></i>
                        <span>${product.sales} sales</span>
                    </div>
                </div>
            </div>
            <div class="product-actions">
                <button class="product-action-btn edit" data-product-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="product-action-btn delete" data-product-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
    
    // Add event listeners to buttons
    const editButtons = productsGrid.querySelectorAll('.product-action-btn.edit');
    const deleteButtons = productsGrid.querySelectorAll('.product-action-btn.delete');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            openProductModal('edit', productId);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            if (confirm('Are you sure you want to delete this product?')) {
                // Find product index
                const productIndex = products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    // Remove product from array
                    products.splice(productIndex, 1);
                    
                    // Save to localStorage
                    localStorage.setItem('allProducts', JSON.stringify(products));
                    
                    // Reload products grid with current filters
                    filterProducts();
                    
                    // Show notification
                    showNotification('Success', 'Product deleted successfully', 'success');
                }
            }
        });
    });
    
    // Add new product button
    const addButton = document.createElement('div');
    addButton.className = 'product-card add-card';
    addButton.innerHTML = `
        <div class="add-product-icon">
            <i class="fas fa-plus"></i>
        </div>
        <h4>Add New Product</h4>
    `;
    addButton.addEventListener('click', function() {
        openProductModal('add');
    });
    
    productsGrid.appendChild(addButton);
}

// Add Customer Button Click Handler
function setupAddCustomerButton() {
    const addCustomerBtn = document.getElementById('add-customer-btn');
    console.log('Setting up addCustomerBtn:', addCustomerBtn);
    
    if (addCustomerBtn) {
        // Remove any existing event listeners
        const newAddCustomerBtn = addCustomerBtn.cloneNode(true);
        addCustomerBtn.parentNode.replaceChild(newAddCustomerBtn, addCustomerBtn);
        
        newAddCustomerBtn.addEventListener('click', function() {
            console.log('Add Customer button clicked');
            openCustomerModal('add');
        });
    }
}