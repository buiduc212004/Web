// Import image utility functions
import { getMainImage, displayImage, LOADING_IMAGE } from './image-utils.js';

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
        
        // Always get the 5 most recent orders
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
        
        // Attach event listeners to the action buttons
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
    async function loadTopProducts() {
        const topProductsGrid = document.getElementById('top-products-grid');
        if (!topProductsGrid) return;
        
        topProductsGrid.innerHTML = '';
        
        try {
            // Nếu chưa có dữ liệu sản phẩm, tải từ API
            if (products.length === 0) {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch('http://localhost:5000/api/foods', {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                        }
                    });
                    
                    if (response.ok) {
                        products = await response.json();
                        localStorage.setItem('allProducts', JSON.stringify(products));
                    }
                } catch (error) {
                    console.error('Error loading products for top products section:', error);
                }
            }
            
            // Sắp xếp sản phẩm theo lượt bán (hoặc rating nếu không có sales)
            const sortedProducts = [...products].sort((a, b) => {
                // Ưu tiên sắp xếp theo sales nếu có
                if (a.sales !== undefined && b.sales !== undefined) {
                    return b.sales - a.sales;
                }
                // Nếu không có sales, sắp xếp theo rating
                return (b.rating || 4.5) - (a.rating || 4.5);
            });
            
            // Lấy 4 sản phẩm đầu tiên
            const topProducts = sortedProducts.slice(0, 4);
            
            topProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                // Create badge if exists
                let badgeHtml = '';
                if (product.badge) {
                    badgeHtml = `<div class="product-badge featured">${product.badge}</div>`;
                } else if (product.status && product.status !== 'active') {
                    badgeHtml = `<div class="product-badge inactive">${product.status}</div>`;
                }
                
                // Create unique ID for the image
                const imgId = `top-product-img-${product.id}`;
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img id="${imgId}" src="${LOADING_IMAGE}" alt="${product.name}">
                        ${badgeHtml}
                    </div>
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <div class="product-stats">
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <span>${product.rating || 4.5}</span>
                            </div>
                            <div class="product-sales">
                                <i class="fas fa-shopping-cart"></i>
                                <span>${product.sales || 0} sold</span>
                            </div>
                        </div>
                        <div class="product-price">
                            <span>${formatPrice(product.price)}</span>
                        </div>
                    </div>
                `;
                
                topProductsGrid.appendChild(productCard);
                
                // Load the image from API after the product card is added to DOM
                getMainImage('Food', product.id, (imageUrl) => {
                    const imgElement = document.getElementById(imgId);
                    if (imgElement) {
                        imgElement.src = imageUrl;
                    }
                }, product.image || '../image/Combo_1.png');
            });
        } catch (error) {
            console.error('Error loading top products:', error);
            topProductsGrid.innerHTML = '<div class="error-message">Failed to load top products</div>';
        }
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
        
        // Pagination removed
    }
    
    // Load Products Grid
    async function loadProductsGrid() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        // Xóa nội dung hiện tại
        productsGrid.innerHTML = '';
        
        try {
            // Hiển thị trạng thái loading
            productsGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';
            
            // Thử lấy sản phẩm từ API
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/foods', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            // Xóa indicator loading
            productsGrid.innerHTML = '';
            
            if (response.ok) {
                const apiProducts = await response.json();
                
                // Cập nhật danh sách sản phẩm local
                products = apiProducts;
                localStorage.setItem('allProducts', JSON.stringify(products));
                
                // Nếu không có sản phẩm
                if (products.length === 0) {
                    productsGrid.innerHTML = '<div class="no-results">No products found</div>';
                    
                    // Vẫn thêm nút "Add Product"
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
                    return;
                }
            } else {
                // Nếu API lỗi, sử dụng dữ liệu local
                console.warn('Failed to fetch products from API, using local data');
                showNotification('Warning', 'Could not connect to the server. Showing cached data.', 'warning');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '';
            showNotification('Error', 'Failed to load products. Using local data.', 'error');
        }
        
        // Render sản phẩm từ dữ liệu đã có (từ API hoặc localStorage)
        products.forEach(product => {
            const statusClass = product.status === 'active' ? 'active' : 'inactive';
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Create placeholder for the image
            const imgId = `product-grid-img-${product.id}`;
            
            card.innerHTML = `
                <div class="product-badge ${statusClass}">${product.status}</div>
                ${product.badge ? `<div class="product-badge featured">${product.badge}</div>` : ''}
                <div class="product-image">
                    <img id="${imgId}" src="../image/loading.gif" alt="${product.name}">
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
                            <span>${product.rating || 4.5}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-shopping-bag"></i>
                            <span>${product.sales || 0} sales</span>
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
            
            // Load the image from API after the product card is added to DOM
            getMainImage('Food', product.id, (imageUrl) => {
                const imgElement = document.getElementById(imgId);
                if (imgElement) {
                    imgElement.src = imageUrl;
                }
            }, product.image || '../image/Combo_1.png');
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
            button.addEventListener('click', async function() {
                const productId = this.getAttribute('data-product-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        // Hiển thị loading
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        button.disabled = true;
                        
                        // Gọi hàm xóa đã cập nhật
                        const result = await deleteProduct(productId);
                        
                        // Hiển thị thông báo
                        const notificationType = result._error ? 'warning' : 'success';
                        const message = result._error ? 
                            'Product removed locally but server update failed' : 
                            'Product deleted successfully';
                        
                        showNotification('Product Deleted', message, notificationType);
                        
                        // Load lại danh sách
                        loadProductsGrid();
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showNotification('Error', 'Failed to delete product', 'error');
                        
                        // Khôi phục button
                        button.innerHTML = '<i class="fas fa-trash"></i>';
                        button.disabled = false;
                    }
                }
            });
        });
        
        // Thêm nút "Add Product"
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
        
        // Generate pagination for products
        generatePagination('products-pagination', Math.ceil(products.length / 12));
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
    async function loadPromotionsTable() {
        const promotionsTable = document.getElementById('promotions-table');
        const promotionsTableBody = promotionsTable ? promotionsTable.querySelector('tbody') : null;
        
        if (!promotionsTableBody) return;
        
        // Xóa nội dung hiện tại
        promotionsTableBody.innerHTML = '';
        
        try {
            // Hiển thị trạng thái loading
            promotionsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading-indicator">
                            <i class="fas fa-spinner fa-spin"></i> Loading promotions...
                        </div>
                    </td>
                </tr>
            `;
            
            // Thử lấy danh sách khuyến mãi từ API
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/promotions', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            // Xóa indicator loading
            promotionsTableBody.innerHTML = '';
            
            if (response.ok) {
                const apiPromotions = await response.json();
                
                // Cập nhật danh sách khuyến mãi trong localStorage
                promotions = apiPromotions.map(promo => ({
                    code: promo.code || `PROMO-${promo.id}`,
                    description: promo.name,
                    discount: `${promo.discount_percentage}%`,
                    startDate: promo.startDate || formatDateFromInput(new Date().toISOString().split('T')[0]),
                    endDate: promo.endDate || formatDateFromInput(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]),
                    status: promo.status,
                    id: promo.id
                }));
                localStorage.setItem('allPromotions', JSON.stringify(promotions));
            } else {
                // Nếu API lỗi, sử dụng dữ liệu cached
                console.warn('Failed to fetch promotions from API, using local data');
                showNotification('Warning', 'Could not connect to the server. Showing cached promotions.', 'warning');
            }
        } catch (error) {
            console.error('Error loading promotions:', error);
            promotionsTableBody.innerHTML = '';
            showNotification('Error', 'Failed to load promotions. Using local data.', 'error');
        }
        
        // Tiếp tục với dữ liệu đã có (từ API hoặc localStorage)
        if (promotions.length === 0) {
            promotionsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No promotions found</td>
                </tr>
            `;
            return;
        }
        
        // Render danh sách khuyến mãi
        promotions.forEach(promotion => {
            const row = document.createElement('tr');
            
            // Convert Vietnamese status to appropriate status class
            let statusText = promotion.status;
            let statusClass = '';
            
            if (statusText === 'Hoat Dong') {
                statusClass = 'active';
            } else if (statusText === 'Khong Hoat Dong') {
                statusClass = 'inactive';
            } else if (promotion.status.toLowerCase() === 'active') {
                statusClass = 'active';
                statusText = 'Hoat Dong';
            } else if (promotion.status.toLowerCase() === 'scheduled') {
                statusClass = 'pending';
                statusText = 'Scheduled';
            } else if (promotion.status.toLowerCase() === 'expired') {
                statusClass = 'cancelled';
                statusText = 'Expired';
            }
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="row-checkbox">
                </td>
                <td><span class="promo-code">${promotion.code}</span></td>
                <td>${promotion.description}</td>
                <td><span class="discount-badge">${promotion.discount}</span></td>
                <td class="date-column">${promotion.startDate}</td>
                <td class="date-column">${promotion.endDate}</td>
                <td>
                    <span class="status-badge ${statusClass}" data-status="${promotion.status.toLowerCase()}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-promo-code="${promotion.code}" title="Edit promotion">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-promo-code="${promotion.code}" title="Delete promotion">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            promotionsTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        const editButtons = promotionsTableBody.querySelectorAll('.edit-btn');
        const deleteButtons = promotionsTableBody.querySelectorAll('.delete-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const promoCode = this.getAttribute('data-promo-code');
                openPromotionModal('edit', promoCode);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const promoCode = this.getAttribute('data-promo-code');
                if (confirm('Are you sure you want to delete this promotion?')) {
                    try {
                        // Hiển thị loading
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        button.disabled = true;
                        
                        // Tìm mã khuyến mãi trong danh sách
                        const promotion = promotions.find(p => p.code === promoCode);
                        if (!promotion) throw new Error('Promotion not found');
                        
                        // Nếu khuyến mãi có ID từ API, xóa thông qua API
                        if (promotion.id) {
                            const token = localStorage.getItem('authToken');
                            const response = await fetch(`http://localhost:5000/api/promotions/${promotion.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': token ? `Bearer ${token}` : ''
                                }
                            });
                            
                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Failed to delete promotion from API');
                            }
                        }
                        
                        // Xóa khỏi localStorage
                        deletePromotion(promoCode);
                        
                        // Reload promotions
                        loadPromotionsTable();
                        
                        // Show notification
                        showNotification('Success', 'Promotion deleted successfully', 'success');
                    } catch (error) {
                        console.error('Error deleting promotion:', error);
                        showNotification('Error', `Failed to delete promotion: ${error.message}`, 'error');
                        
                        // Khôi phục button
                        button.innerHTML = '<i class="fas fa-trash"></i>';
                        button.disabled = false;
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
            
            // Set default status to Hoat Dong (active)
            const statusSelect = promotionForm.elements['status'];
            if (statusSelect) {
                statusSelect.value = 'active';
            }
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
            
            // Map Vietnamese status to English for the form
            let statusValue = promotion.status.toLowerCase();
            if (promotion.status === 'Hoat Dong') {
                statusValue = 'active';
            } else if (promotion.status === 'Khong Hoat Dong') {
                statusValue = 'inactive';
            }
            promotionForm.elements['status'].value = statusValue;
            
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
        document.getElementById('customer-name').textContent = customer.name || '';
        document.getElementById('modal-customer-id').textContent = customer.id || '';
        document.getElementById('modal-customer-email').textContent = customer.email || '';
        document.getElementById('modal-customer-phone').textContent = customer.phone || 'N/A';
        document.getElementById('modal-customer-address').textContent = customer.address || 'N/A';
        document.getElementById('modal-customer-status').innerHTML = `<span class="status-badge ${customer.status || 'active'}">${capitalizeFirstLetter(customer.status || 'active')}</span>`;
        document.getElementById('modal-customer-joined').textContent = customer.joinedDate || 'N/A';
        document.getElementById('modal-customer-orders').textContent = customer.orders || '0';
        document.getElementById('modal-customer-spent').textContent = formatPrice(customer.totalSpent || 0);
        document.getElementById('modal-customer-last-order').textContent = customer.lastOrder || 'N/A';
        
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
        
        // Hide edit button since editing is not supported
        const editCustomerBtn = document.getElementById('edit-customer-btn');
        if (editCustomerBtn) {
            editCustomerBtn.style.display = 'none';
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
    async function loadCustomersTable() {
        const customersTable = document.getElementById('customers-table');
        if (!customersTable) return;
        
        const tbody = customersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        try {
            // Show loading indicator
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="loading-indicator">
                            <i class="fas fa-spinner fa-spin"></i> Loading customers...
                        </div>
                    </td>
                </tr>
            `;
            
            // Get auth token
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log('No auth token found, attempting to log in...');
                await tryAutoLogin();
                
                // Check if we have a token after auto-login
                const newToken = localStorage.getItem('authToken');
                if (!newToken) {
                    throw new Error('Authentication required');
                }
            }
            
            try {
                // Fetch customers from the API with proper headers
                const response = await fetch('http://localhost:5000/api/customers', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                // Clear loading indicator
                tbody.innerHTML = '';
                
                if (!response.ok) {
                    throw new Error(`Server error (${response.status})`);
                }
                
                const apiCustomers = await response.json();
                console.log('Fetched customers:', apiCustomers);
                
                // If no customers found
                if (!apiCustomers || !Array.isArray(apiCustomers) || apiCustomers.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="9" class="text-center">No customers found</td>
                        </tr>
                    `;
                    return;
                }
                
                // Update the global customers array
                customers = apiCustomers;
                
                // Continue with rendering
            } catch (apiError) {
                console.error('API error:', apiError);
                // Use sample data if API fails
                console.log('Using sample data instead');
                
                // Sample data for demonstration
                customers = [
                    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-123-4567', orders: 5, totalSpent: 500000, status: 'active' },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-987-6543', orders: 3, totalSpent: 350000, status: 'active' },
                    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-555-5555', orders: 1, totalSpent: 120000, status: 'inactive' }
                ];
                
                tbody.innerHTML = '';
            }
            
            // Get current filter status
            const statusFilter = document.getElementById('customer-status-filter');
            const currentStatus = statusFilter ? statusFilter.value.toLowerCase() : 'all';
            let visibleCount = 0;
            
            // Render each customer
            customers.forEach(customer => {
                const tr = document.createElement('tr');
                tr.className = 'customer-row';
                tr.dataset.id = customer.id;
                
                // Handle missing or null values with defaults
                const customerName = customer.name || 'Unknown';
                const customerEmail = customer.email || 'N/A';
                const customerPhone = customer.phone || 'N/A';
                const customerOrders = customer.orders || 0;
                const customerSpent = customer.totalSpent || 0;
                const customerStatus = customer.status || 'active';
                
                // Apply status filter immediately
                if (currentStatus !== 'all' && customerStatus.toLowerCase() !== currentStatus) {
                    tr.style.display = 'none';
                } else {
                    visibleCount++;
                }
                
                tr.innerHTML = `
                    <td>
                        <input type="checkbox" class="row-checkbox">
                    </td>
                    <td>${customer.id}</td>
                    <td>
                        <div class="customer-info">
                            <img src="../image/Banner.png" alt="Customer Avatar" class="customer-avatar">
                            <span class="customer-name">${customerName}</span>
                        </div>
                    </td>
                    <td class="customer-email">${customerEmail}</td>
                    <td class="customer-phone">${customerPhone}</td>
                    <td class="customer-orders">${customerOrders}</td>
                    <td class="customer-spent">${formatPrice(customerSpent)}</td>
                    <td><span class="status-badge ${customerStatus.toLowerCase()}">${capitalizeFirstLetter(customerStatus)}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="View Customer" data-id="${customer.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete-btn" title="Delete Customer" data-id="${customer.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Show "no customers with status" message if needed
            if (visibleCount === 0 && currentStatus !== 'all') {
                const noStatusRow = document.createElement('tr');
                noStatusRow.id = 'no-status-results-row';
                noStatusRow.innerHTML = `
                    <td colspan="9" class="text-center">No customers with status "${currentStatus}"</td>
                `;
                tbody.appendChild(noStatusRow);
            }
            
            // Add event listeners to action buttons
            const viewBtns = customersTable.querySelectorAll('.view-btn');
            const deleteBtns = customersTable.querySelectorAll('.delete-btn');
            
            viewBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const customerId = this.getAttribute('data-id');
                    openCustomerDetailsModal(customerId);
                });
            });
            
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', async function() {
                    const customerId = this.getAttribute('data-id');
                    const customerName = customers.find(c => c.id === customerId)?.name || customerId;
                    
                    if (confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
                        try {
                            // Show loading state
                            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                            this.disabled = true;
                            
                            // Call delete function
                            await deleteCustomer(customerId);
                            
                            // Reload the customers table instead of just removing the row
                            // This ensures the table is updated with the latest data from the API
                            await loadCustomersTable();
                            
                            // Show notification
                            showNotification('Success', `Customer "${customerName}" has been deleted`, 'success');
                        } catch (error) {
                            console.error('Error deleting customer:', error);
                            showNotification('Error', `Failed to delete customer: ${error.message}`, 'error');
                            
                            // Reset button
                            this.innerHTML = '<i class="fas fa-trash"></i>';
                            this.disabled = false;
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error loading customers:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">Error loading customers: ${error.message}</td>
                </tr>
            `;
            showNotification('Error', `Failed to load customers: ${error.message}`, 'error');
        }
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
            
            // Client-side filtering for real-time search feedback
            const customerRows = document.querySelectorAll('#customers-table tbody tr');
            let hasVisibleRows = false;
            
            customerRows.forEach(row => {
                let shouldDisplay = false;
                
                // Skip the special messages rows (like "No customers found")
                if (row.cells.length === 1 && row.cells[0].colSpan === 9) {
                    return;
                }
                
                try {
                    const customerName = row.querySelector('.customer-name')?.textContent.toLowerCase() || '';
                    const customerEmail = row.querySelector('.customer-email')?.textContent.toLowerCase() || '';
                    const customerPhone = row.querySelector('.customer-phone')?.textContent.toLowerCase() || '';
                    
                    // Check if any field contains the search term
                    if (customerName.includes(searchTerm) || 
                        customerEmail.includes(searchTerm) || 
                        customerPhone.includes(searchTerm)) {
                        shouldDisplay = true;
                        hasVisibleRows = true;
                    }
                    
                    // Show or hide the row
                    row.style.display = shouldDisplay ? 'table-row' : 'none';
                } catch (error) {
                    console.error('Error filtering customer row:', error);
                }
            });
            
            // Show a "no results" message if needed
            const tbody = document.querySelector('#customers-table tbody');
            const noResultsRow = document.getElementById('no-search-results-row');
            
            if (!hasVisibleRows && searchTerm.length > 0) {
                if (!noResultsRow) {
                    const tr = document.createElement('tr');
                    tr.id = 'no-search-results-row';
                    tr.innerHTML = `
                        <td colspan="9" class="text-center">No customers matching "${searchTerm}"</td>
                    `;
                    tbody.appendChild(tr);
                } else {
                    noResultsRow.querySelector('td').textContent = `No customers matching "${searchTerm}"`;
                    noResultsRow.style.display = 'table-row';
                }
            } else if (noResultsRow) {
                noResultsRow.style.display = 'none';
            }
        });
    }

    // Customer status filter
    const customerStatusFilter = document.getElementById('customer-status-filter');
    if (customerStatusFilter) {
        customerStatusFilter.addEventListener('change', function() {
            const status = this.value.toLowerCase();
            console.log('Filtering customers by status:', status);
            
            // Clear any existing "no results" messages
            const existingMessage = document.getElementById('no-status-results-row');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Get all customer rows
            const customerRows = document.querySelectorAll('#customers-table tbody tr.customer-row');
            let visibleCount = 0;
            
            // Don't filter if there are no rows
            if (customerRows.length === 0) {
                console.log('No customer rows to filter');
                return;
            }
            
            // Apply filtering to each row
            customerRows.forEach(row => {
                const statusBadge = row.querySelector('.status-badge');
                if (!statusBadge) return;
                
                // Get the customer status from the badge
                const rowStatus = statusBadge.textContent.toLowerCase();
                const badgeClass = Array.from(statusBadge.classList)
                    .find(cls => cls !== 'status-badge');
                
                let shouldShow = false;
                
                // Set visibility based on status filter
                if (status === 'all') {
                    shouldShow = true;
                } else if (rowStatus.includes(status)) {
                    shouldShow = true;
                } else if (badgeClass && badgeClass.toLowerCase() === status) {
                    shouldShow = true;
                }
                
                // Apply search filter if exists
                const searchInput = document.getElementById('customer-search');
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                
                if (searchTerm && shouldShow) {
                    const customerName = row.querySelector('.customer-name')?.textContent.toLowerCase() || '';
                    const customerEmail = row.querySelector('.customer-email')?.textContent.toLowerCase() || '';
                    const customerPhone = row.querySelector('.customer-phone')?.textContent.toLowerCase() || '';
                    
                    const matchesSearch = customerName.includes(searchTerm) || 
                                        customerEmail.includes(searchTerm) || 
                                        customerPhone.includes(searchTerm);
                    shouldShow = matchesSearch;
                }
                
                // Show or hide the row
                row.style.display = shouldShow ? 'table-row' : 'none';
                
                if (shouldShow) {
                    visibleCount++;
                }
            });
            
            // Show a "no results" message if needed
            if (visibleCount === 0) {
                const tbody = document.querySelector('#customers-table tbody');
                if (tbody) {
                    const noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'no-status-results-row';
                    noResultsRow.innerHTML = `
                        <td colspan="9" class="text-center">No customers with status "${status}"</td>
                    `;
                    tbody.appendChild(noResultsRow);
                }
            }
            
            console.log(`Filter complete. Showing ${visibleCount} of ${customerRows.length} customers.`);
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
        return new Promise(async (resolve, reject) => {
            try {
                // Chuẩn bị dữ liệu theo cấu trúc API backend
                const apiProductData = {
                    name: productData.name,
                    description: productData.description || '',
                    price: productData.price,
                    category: productData.category,
                    image: productData.image,
                    status: productData.status
                };

                let response;
                let url = 'http://localhost:5000/api/foods';
                const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                };

                if (productData.id && !productData.id.startsWith('P')) {
                    // Nếu là sản phẩm từ API (có ID không bắt đầu bằng "P")
                    url = `${url}/${productData.id}`;
                    response = await fetch(url, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(apiProductData)
                    });
                } else {
                    // Thêm mới
                    response = await fetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(apiProductData)
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'API request failed');
                }

                const result = await response.json();
                
                // Cập nhật local storage để UI hiển thị ngay
                if (productData.id) {
                    const productIndex = products.findIndex(p => p.id === productData.id);
                    if (productIndex !== -1) {
                        // Nếu sản phẩm đã tồn tại, cập nhật
                        products[productIndex] = {
                            ...productData,
                            id: result.id || productData.id // Sử dụng ID từ API nếu có
                        };
                    } else {
                        // Nếu không tìm thấy, thêm mới
                        products.push({
                            ...productData,
                            id: result.id || productData.id
                        });
                    }
                } else {
                    // Thêm mới vào mảng local
                    products.push({
                        ...productData,
                        id: result.id || `P${Math.floor(Math.random() * 10000)}`
                    });
                }
                
                localStorage.setItem('allProducts', JSON.stringify(products));
                resolve(result);
            } catch (error) {
                console.error('Error saving product to API:', error);
                
                // Fallback: Chỉ lưu vào localStorage nếu API fail
                const productIndex = products.findIndex(p => p.id === productData.id);
                if (productIndex !== -1) {
                    products[productIndex] = productData;
                } else {
                    // Tạo ID nếu không có
                    if (!productData.id) {
                        productData.id = `P${Math.floor(Math.random() * 10000)}`;
                    }
                    products.push(productData);
                }
                localStorage.setItem('allProducts', JSON.stringify(products));
                
                // Vẫn trả về thông tin sản phẩm nhưng với thông báo lỗi
                resolve({
                    ...productData, 
                    _error: error.message,
                    _fromLocalStorage: true
                });
            }
        });
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
        return new Promise(async (resolve, reject) => {
            try {
                // Chuẩn bị dữ liệu cho API
                const apiPromotionData = {
                    name: promotionData.description,
                    discount_percentage: parseFloat(promotionData.discount.replace('%', '')),
                    min_order_value: 0, // Giá trị mặc định
                    max_discount_amount: 100000, // Giá trị mặc định
                    code: promotionData.code,
                    status: promotionData.status,
                    startDate: promotionData.startDate,
                    endDate: promotionData.endDate
                };

                const token = localStorage.getItem('authToken');
                let response;
                let url = 'http://localhost:5000/api/promotions';
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                };

                if (promotionData.id) {
                    // Cập nhật khuyến mãi đã có
                    url = `${url}/${promotionData.id}`;
                    response = await fetch(url, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(apiPromotionData)
                    });
                } else {
                    // Thêm mới khuyến mãi
                    response = await fetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(apiPromotionData)
                    });
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'API request failed');
                }

                const result = await response.json();
                
                // Cập nhật local storage
                const promotionIndex = promotions.findIndex(p => p.code === promotionData.code);
                if (promotionIndex !== -1) {
                    promotions[promotionIndex] = promotionData;
                } else {
                    promotions.push(promotionData);
                }
                localStorage.setItem('allPromotions', JSON.stringify(promotions));
                
                resolve(result);
            } catch (error) {
                console.error('Error saving promotion to API:', error);
                
                // Fallback: Chỉ lưu vào localStorage nếu API fail
                const promotionIndex = promotions.findIndex(p => p.code === promotionData.code);
                if (promotionIndex !== -1) {
                    promotions[promotionIndex] = promotionData;
                } else {
                    promotions.push(promotionData);
                }
                localStorage.setItem('allPromotions', JSON.stringify(promotions));
                
                resolve({
                    ...promotionData,
                    _error: error.message,
                    _fromLocalStorage: true
                });
            }
        });
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
        return new Promise(async (resolve, reject) => {
            try {
                // Chỉ gọi API nếu ID không phải ID tạm (không bắt đầu bằng 'P')
                if (!productId.startsWith('P')) {
                    const url = `http://localhost:5000/api/foods/${productId}`;
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to delete product from API');
                    }
                }

                // Xóa khỏi mảng local bất kể API thành công hay không
                products = products.filter(p => p.id !== productId);
                localStorage.setItem('allProducts', JSON.stringify(products));
                resolve({ success: true, message: 'Product deleted successfully' });
            } catch (error) {
                console.error('Error deleting product:', error);
                
                // Vẫn xóa khỏi localStorage nếu lỗi API
                products = products.filter(p => p.id !== productId);
                localStorage.setItem('allProducts', JSON.stringify(products));
                
                resolve({ 
                    success: true, 
                    message: 'Product removed from local storage',
                    _error: error.message,
                    _fromLocalStorage: true 
                });
            }
        });
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
        return new Promise(async (resolve, reject) => {
            try {
                // Get auth token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                try {
                    // Delete customer via API
                    const response = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    // Handle response
                    if (!response.ok) {
                        throw new Error(`Failed to delete customer (Status: ${response.status})`);
                    }
                    
                    // Process successful response
                    const responseData = await response.json().catch(() => ({}));
                    console.log('Delete customer response:', responseData);
                    
                    // Remove from local array
                    customers = customers.filter(c => c.id !== customerId);
                    
                    resolve(responseData);
                } catch (apiError) {
                    console.error('API error:', apiError);
                    console.log('Using local delete fallback');
                    
                    // Demo: Giả lập xoá khách hàng khi API không hoạt động
                    customers = customers.filter(c => c.id !== customerId);
                    showNotification('Demo Mode', 'Simulating customer deletion in demo mode', 'warning');
                    
                    // Resolve sau khi giả lập xoá
                    resolve({ success: true, message: 'Customer deleted in demo mode' });
                }
                
            } catch (error) {
                console.error('Error deleting customer:', error);
                reject(error);
            }
        });
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

    // Function to remove all pagination calls
    function updatePaginationCalls() {
        // Replace the pagination calls with comments
        
        // In loadOrdersTable function
        const loadOrdersTableFn = loadOrdersTable.toString().replace(
            'generatePagination(\'orders-pagination\', 5);',
            '// Pagination removed'
        );
        eval('loadOrdersTable = ' + loadOrdersTableFn);
        
        // In loadProductsGrid function
        const loadProductsGridFn = loadProductsGrid.toString().replace(
            'generatePagination(\'products-pagination\', 3);',
            '// Pagination removed'
        );
        eval('loadProductsGrid = ' + loadProductsGridFn);
        
        // In loadCustomersTable function
        const loadCustomersTableFn = loadCustomersTable.toString().replace(
            'generatePagination(\'customers-pagination\', 5);',
            '// Pagination removed'
        );
        eval('loadCustomersTable = ' + loadCustomersTableFn);
    }

    // This would be dangerous in a real app, but since we're modifying the code directly,
    // we'll make direct changes in the editor instead. The above function is just for reference.
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
async function init() {
    console.log('Initializing admin dashboard...');
    
    // First check authentication - this should happen before any data loading
    await checkAuthentication();
    
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
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, running init()');
    // Run init function
    await init();
    
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
    // Functionality removed as per requirements
    console.log('Add customer functionality disabled as per requirements');
}

// Hàm kiểm tra xác thực
async function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    try {
        // Nếu không có token, thử đăng nhập với tài khoản mặc định
        if (!token) {
            console.log('No token found, attempting auto-login...');
            await tryAutoLogin();
            return;
        }
        
        // Kiểm tra token có hợp lệ không
        const response = await fetch('http://localhost:5000/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid token');
        }
        
        const userData = await response.json();
        
        // Kiểm tra vai trò người dùng
        if (userData.role !== 'admin') {
            throw new Error('Unauthorized access');
        }
        
        // Hiển thị thông tin người dùng đã đăng nhập
        const userInfoElement = document.querySelector('.user-info-name');
        if (userInfoElement) {
            userInfoElement.textContent = userData.name || 'Admin';
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        // Xóa token không hợp lệ
        localStorage.removeItem('authToken');
        // Thử đăng nhập tự động
        await tryAutoLogin();
    }
}

// Hàm thử đăng nhập tự động với tài khoản mặc định
async function tryAutoLogin() {
    try {
        // Thử đăng nhập với tài khoản mặc định
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: 'admin@example.com', 
                password: 'admin123' 
            })
        });
        
        if (!response.ok) {
            throw new Error('Auto-login failed');
        }
        
        const data = await response.json();
        
        // Lưu token
        localStorage.setItem('authToken', data.token);
        console.log('Auto-login successful');
        
        // Hiển thị thông tin người dùng
        const userInfoElement = document.querySelector('.user-info-name');
        if (userInfoElement) {
            userInfoElement.textContent = data.user.name || 'Admin';
        }
        
        // Load dữ liệu sau khi đăng nhập thành công
        loadCustomersTable();
        
    } catch (error) {
        console.error('Auto-login failed:', error);
        
        // Tạo token giả khi API không hoạt động
        console.log('Creating fake token for demonstration...');
        
        // Tạo một token giả để demo khi API không hoạt động
        const fakeToken = 'demo_token_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('authToken', fakeToken);
        
        // Hiển thị thông tin người dùng mặc định
        const userInfoElement = document.querySelector('.user-info-name');
        if (userInfoElement) {
            userInfoElement.textContent = 'Demo Admin';
        }
        
        showNotification('Demo Mode', 'Using demo data because API server is not available', 'warning');
        
        // Load dữ liệu khách hàng
        loadCustomersTable();
    }
}

// Hàm hiển thị modal đăng nhập
function showAuthenticationModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h2>Admin Authentication</h2>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Login</button>
                    <a href="./Home.html" class="btn-secondary">Back to Home</a>
                </div>
                <div id="login-error" class="error-message"></div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Xử lý đăng nhập
    const loginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('login-error');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = loginForm.elements.email.value;
        const password = loginForm.elements.password.value;
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }
            
            const data = await response.json();
            
            // Kiểm tra vai trò
            if (data.user.role !== 'admin') {
                throw new Error('Access denied: Admin privileges required');
            }
            
            // Lưu token
            localStorage.setItem('authToken', data.token);
            
            // Đóng modal và load lại trang
            modal.remove();
            location.reload();
            
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message || 'Invalid credentials';
            errorMessage.style.display = 'block';
        }
    });
}

// Image Manager functionality
const imageManager = {
    images: [],
    currentPage: 1,
    imagesPerPage: 20,
    totalPages: 1,
    filters: {
        type: 'all',
        startDate: '',
        endDate: '',
        search: ''
    },
    referenceOptions: {
        Food: [],
        Restaurant: [],
        Category: [],
        Banner: [],
        Profile: []
    },

    init: function() {
        // Elements
        this.imageGrid = document.getElementById('image-grid');
        this.pagination = document.getElementById('image-pagination');
        this.typeFilter = document.getElementById('image-type-filter');
        this.startDateFilter = document.getElementById('image-start-date');
        this.endDateFilter = document.getElementById('image-end-date');
        this.searchInput = document.getElementById('image-search');
        this.uploadBtn = document.getElementById('upload-new-image-btn');
        this.applyFiltersBtn = document.getElementById('apply-image-filters');
        this.resetFiltersBtn = document.getElementById('reset-image-filters');

        // Modal elements
        this.uploadModal = document.getElementById('image-upload-modal');
        this.closeModalBtn = document.getElementById('close-image-modal');
        this.imageFile = document.getElementById('image-file');
        this.imagePreview = document.getElementById('image-preview-img');
        this.referenceType = document.getElementById('reference-type');
        this.referenceId = document.getElementById('reference-id');
        this.isMain = document.getElementById('is-main');
        this.cancelUploadBtn = document.getElementById('cancel-upload-btn');
        this.submitUploadBtn = document.getElementById('submit-upload-btn');

        // Detail modal elements
        this.detailModal = document.getElementById('image-detail-modal');
        this.closeDetailBtn = document.getElementById('close-detail-modal');
        this.detailImage = document.getElementById('detail-image');
        this.detailFilename = document.getElementById('detail-filename');
        this.detailOriginalname = document.getElementById('detail-originalname');
        this.detailMimetype = document.getElementById('detail-mimetype');
        this.detailSize = document.getElementById('detail-size');
        this.detailDate = document.getElementById('detail-date');
        this.detailRefType = document.getElementById('detail-reftype');
        this.detailRefId = document.getElementById('detail-refid');
        this.detailIsMain = document.getElementById('detail-ismain');
        this.detailUrl = document.getElementById('detail-url');
        this.copyUrlBtn = document.getElementById('copy-url-btn');
        this.closeDetailBtn2 = document.getElementById('close-detail-btn');
        this.deleteImageBtn = document.getElementById('delete-image-btn');

        // Event listeners
        this.bindEvents();

        // Load reference options for dropdown
        this.loadReferenceOptions();

        // Initial load
        this.loadImages();
    },

    bindEvents: function() {
        // Filter events
        this.typeFilter.addEventListener('change', () => {
            this.filters.type = this.typeFilter.value;
        });

        this.startDateFilter.addEventListener('change', () => {
            this.filters.startDate = this.startDateFilter.value;
        });

        this.endDateFilter.addEventListener('change', () => {
            this.filters.endDate = this.endDateFilter.value;
        });

        this.searchInput.addEventListener('input', () => {
            this.filters.search = this.searchInput.value;
        });

        this.applyFiltersBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.loadImages();
        });

        this.resetFiltersBtn.addEventListener('click', () => {
            this.resetFilters();
        });

        // Upload events
        this.uploadBtn.addEventListener('click', () => {
            this.openUploadModal();
        });

        this.closeModalBtn.addEventListener('click', () => {
            this.closeUploadModal();
        });

        this.cancelUploadBtn.addEventListener('click', () => {
            this.closeUploadModal();
        });

        this.imageFile.addEventListener('change', (e) => {
            this.previewImage(e);
        });

        this.referenceType.addEventListener('change', () => {
            this.updateReferenceIdOptions();
        });

        this.submitUploadBtn.addEventListener('click', () => {
            this.uploadImage();
        });

        // Detail modal events
        this.closeDetailBtn.addEventListener('click', () => {
            this.closeDetailModal();
        });

        this.closeDetailBtn2.addEventListener('click', () => {
            this.closeDetailModal();
        });

        this.copyUrlBtn.addEventListener('click', () => {
            this.copyImageUrl();
        });

        this.deleteImageBtn.addEventListener('click', () => {
            this.deleteImage();
        });
    },

    loadImages: function() {
        this.showLoading();

        // Build query string with filters
        let queryParams = new URLSearchParams();
        if (this.filters.type !== 'all') {
            queryParams.append('referenceType', this.filters.type);
        }
        if (this.filters.startDate) {
            queryParams.append('startDate', this.filters.startDate);
        }
        if (this.filters.endDate) {
            queryParams.append('endDate', this.filters.endDate);
        }
        if (this.filters.search) {
            queryParams.append('search', this.filters.search);
        }

        // fetch images from API
        fetch(`http://localhost:5000/api/images?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load images');
                }
                return response.json();
            })
            .then(data => {
                this.images = data;
                this.totalPages = Math.ceil(this.images.length / this.imagesPerPage);
                this.renderImages();
                this.renderPagination();
                this.hideLoading();
            })
            .catch(error => {
                console.error('Error loading images:', error);
                this.showToast('Error', 'Failed to load images. ' + error.message, 'error');
                this.hideLoading();
                
                // Show no images state (for demo or if API fails)
                this.showNoImagesState();
            });
    },

    renderImages: function() {
        // Clear existing images
        this.imageGrid.innerHTML = '';

        // Get current page images
        const startIndex = (this.currentPage - 1) * this.imagesPerPage;
        const endIndex = startIndex + this.imagesPerPage;
        const currentImages = this.images.slice(startIndex, endIndex);

        if (currentImages.length === 0) {
            this.showNoImagesState();
            return;
        }

        // Render each image
        currentImages.forEach(image => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.dataset.id = image.id;
            
            // Format date
            const uploadDate = new Date(image.uploadDate);
            const formattedDate = uploadDate.toLocaleDateString();
            
            card.innerHTML = `
                <img class="image-card-img" src="${image.fullPath || image.path}" alt="${image.originalname}">
                ${image.is_main ? '<span class="image-card-badge">Main</span>' : ''}
                <div class="image-card-overlay">
                    <h4 class="image-card-title">${image.originalname}</h4>
                    <p class="image-card-type">${image.referenceType} - ${formattedDate}</p>
                </div>
            `;
            
            // Add click event to open detail modal
            card.addEventListener('click', () => {
                this.openDetailModal(image);
            });
            
            this.imageGrid.appendChild(card);
        });
    },

    renderPagination: function() {
        this.pagination.innerHTML = '';
        
        if (this.totalPages <= 1) return;
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderImages();
                this.renderPagination();
            }
        });
        this.pagination.appendChild(prevBtn);
        
        // Page numbers
        const maxPageButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxPageButtons - 1);
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'pagination-btn';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.renderImages();
                this.renderPagination();
            });
            this.pagination.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                this.pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn';
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.renderImages();
                this.renderPagination();
            });
            this.pagination.appendChild(pageBtn);
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                this.pagination.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'pagination-btn';
            lastPageBtn.textContent = this.totalPages;
            lastPageBtn.addEventListener('click', () => {
                this.currentPage = this.totalPages;
                this.renderImages();
                this.renderPagination();
            });
            this.pagination.appendChild(lastPageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderImages();
                this.renderPagination();
            }
        });
        this.pagination.appendChild(nextBtn);
    },

    resetFilters: function() {
        this.typeFilter.value = 'all';
        this.startDateFilter.value = '';
        this.endDateFilter.value = '';
        this.searchInput.value = '';
        
        this.filters = {
            type: 'all',
            startDate: '',
            endDate: '',
            search: ''
        };
        
        this.currentPage = 1;
        this.loadImages();
    },

    showNoImagesState: function() {
        this.imageGrid.innerHTML = `
            <div class="no-images">
                <i class="fas fa-images"></i>
                <p>No images found matching your criteria.</p>
                <button class="upload-prompt-btn" id="no-images-upload-btn">
                    <i class="fas fa-upload"></i> Upload New Image
                </button>
            </div>
        `;
        
        document.getElementById('no-images-upload-btn').addEventListener('click', () => {
            this.openUploadModal();
        });
    },

    showLoading: function() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.id = 'image-loading';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        
        const container = document.querySelector('.image-gallery-container');
        container.style.position = 'relative';
        container.appendChild(loadingOverlay);
    },

    hideLoading: function() {
        const loadingOverlay = document.getElementById('image-loading');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    },

    loadReferenceOptions: function() {
        // For demo, load mock data
        // In production, fetch from API
        this.referenceOptions = {
            Food: [
                { id: 1, name: 'Pizza Margherita' },
                { id: 2, name: 'Hamburger' },
                { id: 3, name: 'Pasta Carbonara' },
                { id: 4, name: 'Caesar Salad' }
            ],
            Restaurant: [
                { id: 1, name: 'Main Restaurant' },
                { id: 2, name: 'Branch Office 1' },
                { id: 3, name: 'Branch Office 2' }
            ],
            Category: [
                { id: 1, name: 'Pizza' },
                { id: 2, name: 'Burger' },
                { id: 3, name: 'Pasta' },
                { id: 4, name: 'Salad' }
            ],
            Banner: [
                { id: 1, name: 'Home Banner' },
                { id: 2, name: 'Promotion Banner' },
                { id: 3, name: 'Special Offers Banner' }
            ],
            Profile: [
                { id: 1, name: 'Admin Avatar' },
                { id: 2, name: 'Chef Profile' },
                { id: 3, name: 'Staff Profile' }
            ]
        };
    },

    updateReferenceIdOptions: function() {
        const selectedType = this.referenceType.value;
        const options = this.referenceOptions[selectedType] || [];
        
        this.referenceId.innerHTML = '<option value="">Select a reference</option>';
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.id;
            optionEl.textContent = `${option.id} - ${option.name}`;
            this.referenceId.appendChild(optionEl);
        });
    },

    openUploadModal: function() {
        // Reset form
        document.getElementById('image-upload-form').reset();
        this.imagePreview.parentElement.style.display = 'none';
        this.uploadModal.style.display = 'block';
        setTimeout(() => {
            this.uploadModal.classList.add('show');
        }, 10);
    },

    closeUploadModal: function() {
        this.uploadModal.classList.remove('show');
        setTimeout(() => {
            this.uploadModal.style.display = 'none';
        }, 300);
    },

    previewImage: function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview.src = e.target.result;
                this.imagePreview.parentElement.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            this.imagePreview.parentElement.style.display = 'none';
        }
    },

    uploadImage: function() {
        // Validation
        const file = this.imageFile.files[0];
        const referenceType = this.referenceType.value;
        const referenceId = this.referenceId.value;
        
        if (!file) {
            this.showToast('Error', 'Please select an image file', 'error');
            return;
        }
        
        if (!referenceType) {
            this.showToast('Error', 'Please select a reference type', 'error');
            return;
        }
        
        if (!referenceId) {
            this.showToast('Error', 'Please select a reference ID', 'error');
            return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        formData.append('referenceType', referenceType);
        formData.append('referenceId', referenceId);
        formData.append('isMain', this.isMain.checked ? '1' : '0');
        
        // Show loading
        this.submitUploadBtn.disabled = true;
        this.submitUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        // Upload image
        // In production, use actual API
        // For demo, simulate upload
        setTimeout(() => {
            // Simulate successful upload
            const newImage = {
                id: Date.now(),
                filename: `${Date.now()}_${file.name}`,
                originalname: file.name,
                path: URL.createObjectURL(file),
                fullPath: URL.createObjectURL(file),
                mimetype: file.type,
                size: file.size,
                referenceType: referenceType,
                referenceId: referenceId,
                is_main: this.isMain.checked,
                uploadDate: new Date().toISOString()
            };
            
            // Add to images array
            this.images.unshift(newImage);
            this.totalPages = Math.ceil(this.images.length / this.imagesPerPage);
            
            // Reset UI
            this.submitUploadBtn.disabled = false;
            this.submitUploadBtn.innerHTML = 'Upload Image';
            this.closeUploadModal();
            
            // Show success message
            this.showToast('Success', 'Image uploaded successfully', 'success');
            
            // Reload images
            this.currentPage = 1;
            this.renderImages();
            this.renderPagination();
        }, 1500);
    },

    openDetailModal: function(image) {
        // Set image details
        this.detailImage.src = image.fullPath || image.path;
        this.detailFilename.textContent = image.filename;
        this.detailOriginalname.textContent = image.originalname;
        this.detailMimetype.textContent = image.mimetype;
        this.detailSize.textContent = this.formatFileSize(image.size);
        this.detailDate.textContent = new Date(image.uploadDate).toLocaleString();
        this.detailRefType.textContent = image.referenceType;
        this.detailRefId.textContent = image.referenceId;
        this.detailIsMain.textContent = image.is_main ? 'Yes' : 'No';
        this.detailUrl.value = image.fullPath || image.path;
        
        // Store current image id for delete
        this.deleteImageBtn.dataset.id = image.id;
        
        // Show modal
        this.detailModal.style.display = 'block';
        setTimeout(() => {
            this.detailModal.classList.add('show');
        }, 10);
    },

    closeDetailModal: function() {
        this.detailModal.classList.remove('show');
        setTimeout(() => {
            this.detailModal.style.display = 'none';
        }, 300);
    },

    copyImageUrl: function() {
        this.detailUrl.select();
        document.execCommand('copy');
        this.showToast('Success', 'URL copied to clipboard', 'success');
    },

    deleteImage: function() {
        const imageId = this.deleteImageBtn.dataset.id;
        
        if (!imageId) return;
        
        if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
            return;
        }
        
        // Show loading
        this.deleteImageBtn.disabled = true;
        this.deleteImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        
        // In production, use actual API
        // For demo, simulate delete
        setTimeout(() => {
            // Remove from array
            this.images = this.images.filter(img => img.id != imageId);
            this.totalPages = Math.ceil(this.images.length / this.imagesPerPage);
            
            // Reset UI
            this.deleteImageBtn.disabled = false;
            this.deleteImageBtn.innerHTML = 'Delete Image';
            this.closeDetailModal();
            
            // Show success message
            this.showToast('Success', 'Image deleted successfully', 'success');
            
            // Reload images
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = this.totalPages;
            }
            this.renderImages();
            this.renderPagination();
        }, 1000);
    },

    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    showToast: function(title, message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <h4 class="toast-title">${title}</h4>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Add close event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
};

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Initialize image manager
    if (document.getElementById('images')) {
        imageManager.init();
    }
});