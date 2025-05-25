import { getAdminToken, showNotification, formatPrice, capitalizeFirstLetter, formatDateFromInput } from './utils.js';
import { getMainImage } from './image-utils.js';

// File này chứa các hàm load... dùng cho dashboard admin
export async function loadRecentOrders() {
    const recentOrdersTable = document.getElementById('recent-orders-table');
    if (!recentOrdersTable) return;
    const tbody = recentOrdersTable.querySelector('tbody');
    tbody.innerHTML = '';
    try {
        const token = getAdminToken ? getAdminToken() : localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/orders?page=1&limit=1000', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        let orders = Array.isArray(data.orders) ? data.orders : data;
        // Lấy 4 orders mới nhất (theo date hoặc id giảm dần)
        orders = orders.sort((a, b) => {
            if (a.date && b.date) return new Date(b.date) - new Date(a.date);
            return (b.id || 0) - (a.id || 0);
        }).slice(0, 4);
        tbody.innerHTML = '';
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.id || ''}</td>
                <td>${order.id_KH || ''}</td>
                <td>${order.id_NH || ''}</td>
                <td>${order.id_PROMO || ''}</td>
                <td>${order.category || ''}</td>
                <td>${order.total_price ? order.total_price.toLocaleString('vi-VN') : ''}</td>
                <td>${order.order_status || ''}</td>
                <td>${order.date ? order.date.split('T')[0] : ''}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent orders:', error);
        tbody.innerHTML = '<tr><td colspan="8">Không thể tải đơn hàng gần đây</td></tr>';
    }
}

// --- TOP PRODUCTS: LẤY 4 SẢN PHẨM BÁN CHẠY NHẤT ---
export async function loadTopProducts() {
    const topProductsGrid = document.getElementById('top-products-grid');
    if (!topProductsGrid) return;
    topProductsGrid.innerHTML = '';
    try {
        const token = getAdminToken ? getAdminToken() : localStorage.getItem('authToken');
        // Lấy top 4 sản phẩm bán chạy nhất từ API mới
        const resFood = await fetch('http://localhost:5000/api/foods/top-products', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        let foods = [];
        if (resFood.ok) {
            foods = await resFood.json();
        }
        for (const food of foods) {
            let imgHtml = `<img src="../image/Combo_7.png" alt="${food.name}" onerror="this.src='../image/Combo_7.png'">`;
            if (food.image_id) {
                imgHtml = `<img src="../image/${food.image_id}.png" alt="${food.name}" onerror="this.src='../image/Combo_6.png'">`;
            }
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    ${imgHtml}
                </div>
                <div class="product-details">
                    <h3>${food.name}</h3>
                    <div class="product-stats">
                        <div class="product-sales">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Đã bán: ${food.sold_quantity}</span>
                        </div>
                    </div>
                </div>
            `;
            topProductsGrid.appendChild(card);
        }
    } catch (e) {
        topProductsGrid.innerHTML = '<div class="error-message">Failed to load top products</div>';
    }
}

let currentOrderPage = 1;
const ORDERS_PER_PAGE = 4;
let totalOrders = 0;
let allOrdersCache = [];

// --- GÁN SỰ KIỆN CHO NÚT APPLY FILTERS (DATE RANGE) ---
const applyFiltersBtn = document.getElementById('apply-order-filters');
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
        loadOrdersTable(1);
    });
}

const resetFiltersBtn = document.getElementById('reset-order-filters');
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function() {
        const from = document.getElementById('order-date-from');
        const to = document.getElementById('order-date-to');
        if (from) from.value = '';
        if (to) to.value = '';
        const status = document.getElementById('order-status-filter');
        if (status) status.value = 'all';
        loadOrdersTable(1);
    });
}

export async function loadOrdersTable(page = 1) {
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) return;
    const tbody = ordersTable.querySelector('tbody');
    tbody.innerHTML = '';
    try {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center"><div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading orders...</div></td></tr>`;
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/orders?page=1&limit=1000`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        tbody.innerHTML = '';
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        allOrdersCache = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
    } catch (error) {
        allOrdersCache = [];
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Error loading orders</td></tr>`;
    }
    totalOrders = allOrdersCache.length;
    // Lấy giá trị filter ngày
    let dateFrom = document.getElementById('order-date-from')?.value;
    let dateTo = document.getElementById('order-date-to')?.value;
    // Chuyển đổi dd/mm/yyyy sang yyyy-mm-dd nếu có
    function toISODate(str) {
        if (!str) return '';
        if (str.includes('/')) {
            // dd/mm/yyyy
            const parts = str.split('/');
            if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (str.includes('-')) {
            // yyyy-mm-dd
            return str;
        }
        return str;
    }
    function getDateOnly(str) {
        if (!str) return '';
        if (str.includes('T')) return str.split('T')[0];
        return str;
    }
    dateFrom = toISODate(dateFrom);
    dateTo = toISODate(dateTo);
    console.log('Filter dateFrom:', dateFrom, 'dateTo:', dateTo);
    // --- FILTER BY STATUS ---
    const status = document.getElementById('order-status-filter')?.value || 'all';
    let filteredOrders = allOrdersCache;
    if (status !== 'all') {
        filteredOrders = filteredOrders.filter(order => (order.order_status || '').toLowerCase() === status.toLowerCase());
    }
    // --- FILTER BY DATE RANGE ---
    if (dateFrom) {
        filteredOrders = filteredOrders.filter(order => {
            if (!order.date) return false;
            return getDateOnly(order.date) >= dateFrom;
        });
    }
    if (dateTo) {
        filteredOrders = filteredOrders.filter(order => {
            if (!order.date) return false;
            return getDateOnly(order.date) <= dateTo;
        });
    }
    // --- PHÂN TRANG ---
    const startIdx = (page - 1) * ORDERS_PER_PAGE;
    const paged = filteredOrders.slice(startIdx, startIdx + ORDERS_PER_PAGE);
    if (!paged || paged.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">No orders found</td></tr>`;
        renderOrdersPagination(page, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
        return;
    }
    paged.forEach(order => {
        const tr = document.createElement('tr');
        tr.dataset.id = order.id;
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td>${order.id || ''}</td>
            <td>${order.id_KH || ''}</td>
            <td>${order.id_NH || ''}</td>
            <td>${order.id_PROMO || ''}</td>
            <td>${order.category || ''}</td>
            <td>${order.total_price ? order.total_price.toLocaleString('vi-VN') : ''}</td>
            <td>${order.order_status || ''}</td>
            <td>${order.date ? order.date.split('T')[0] : ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${order.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${order.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Add event listeners to action buttons
    const editBtns = ordersTable.querySelectorAll('.edit-btn');
    const deleteBtns = ordersTable.querySelectorAll('.delete-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            openOrderModal(orderId);
        });
    });
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const orderId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this order?')) {
                // Thêm logic xoá đơn hàng nếu cần
            }
        });
    });
    renderOrdersPagination(page, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
}

function renderOrdersPagination(current, totalPages) {
    let pagination = document.getElementById('orders-pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'orders-pagination';
        pagination.className = 'pagination';
        const tableSection = document.getElementById('orders-table');
        if (tableSection) {
            tableSection.parentNode.appendChild(pagination);
        }
    }
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === current ? ' active' : '');
        btn.onclick = () => {
            currentOrderPage = i;
            loadOrdersTable(i);
        };
        pagination.appendChild(btn);
    }
}

// Thêm sự kiện cho filter
const orderStatusFilterEl = document.getElementById('order-status-filter');
if (orderStatusFilterEl) {
    orderStatusFilterEl.addEventListener('change', function() {
        loadOrdersTable(1);
    });
}

// Gọi lần đầu khi vào trang
if (document.getElementById('orders-table')) {
    loadOrdersTable(currentOrderPage);
}

// Load Products Grid
let currentProductPage = 1;
const PRODUCTS_PER_PAGE = 4;
let totalProducts = 0;
let currentType = 'all';
let productSearchTerm = '';

export async function loadProductsGrid(page = 1, type = 'all', search = '') {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';
    try {
        const token = localStorage.getItem('authToken');
        let apiUrl = `http://localhost:5000/api/foods?page=${page}&limit=${PRODUCTS_PER_PAGE}`;
        if (type && type !== 'all') {
            apiUrl += `&type=${encodeURIComponent(type)}`;
        }
        if (search) {
            apiUrl += `&search=${encodeURIComponent(search)}`;
        }
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        productsGrid.innerHTML = '';
        if (response.ok) {
            const data = await response.json();
            let apiProducts = Array.isArray(data.products) ? data.products : data;
            totalProducts = data.total || apiProducts.length || 0;
            if (!apiProducts || apiProducts.length === 0) {
                productsGrid.innerHTML = '<div class="no-results">No products found</div>';
                renderProductsPagination(page, 1);
                renderAddProductButton(productsGrid);
                return;
            }
            for (const product of apiProducts) {
                const statusClass = product.status === 'active' ? 'active' : 'inactive';
                const card = document.createElement('div');
                card.className = 'product-card';
                let imgHtml = `<img src="../image/Combo_1.png" alt="${product.name}" onerror="this.src='../image/Combo_1.png'">`;
                if (product.filename && product.path) {
                    imgHtml = `<img src="http://localhost:5000/${product.path}" alt="${product.name}" onerror="this.src='../image/Combo_1.png'">`;
                }
                card.innerHTML = `
                    <div class="product-actions">
                        <button class="product-action-btn edit" data-product-id="${product.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="product-action-btn delete" data-product-id="${product.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="product-badge ${statusClass}">${product.status}</div>
                    <div class="product-image" id="product-img-wrap-${product.id}">
                        ${imgHtml}
                    </div>
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <div class="product-meta">
                            <span class="product-category">${product.type || ''}</span>
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
                `;
                productsGrid.appendChild(card);
            }
            // Add event listeners to buttons
            const editButtons = productsGrid.querySelectorAll('.product-action-btn.edit');
            const deleteButtons = productsGrid.querySelectorAll('.product-action-btn.delete');
            const statusButtons = productsGrid.querySelectorAll('.product-action-btn.status');
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
                            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                            button.disabled = true;
                            const token = localStorage.getItem('authToken');
                            const res = await fetch(`http://localhost:5000/api/foods/${productId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                            });
                            if (res.ok) {
                                showNotification('Product Deleted', 'Product deleted successfully', 'success');
                                loadProductsGrid(currentProductPage, currentType, productSearchTerm);
                            } else {
                                showNotification('Error', 'Failed to delete product', 'error');
                                button.innerHTML = '<i class="fas fa-trash"></i>';
                                button.disabled = false;
                            }
                        } catch (error) {
                            showNotification('Error', 'Failed to delete product', 'error');
                            button.innerHTML = '<i class="fas fa-trash"></i>';
                            button.disabled = false;
                        }
                    }
                });
            });
            statusButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const productId = this.getAttribute('data-product-id');
                    const currentStatus = this.getAttribute('data-status');
                    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                    try {
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        this.disabled = true;
                        const token = localStorage.getItem('authToken');
                        const res = await fetch(`http://localhost:5000/api/foods/${productId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token ? `Bearer ${token}` : ''
                            },
                            body: JSON.stringify({ status: newStatus })
                        });
                        if (res.ok) {
                            showNotification('Status Updated', 'Product status updated', 'success');
                            loadProductsGrid(currentProductPage, currentType, productSearchTerm);
                        } else {
                            showNotification('Error', 'Failed to update status', 'error');
                            this.innerHTML = '<i class="fas fa-sync-alt"></i>';
                            this.disabled = false;
                        }
                    } catch (error) {
                        showNotification('Error', 'Failed to update status', 'error');
                        this.innerHTML = '<i class="fas fa-sync-alt"></i>';
                        this.disabled = false;
                    }
                });
            });
            renderAddProductButton(productsGrid);
            renderProductsPagination(page, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
        } else {
            productsGrid.innerHTML = '<div class="error-message">Failed to load products</div>';
            renderProductsPagination(page, 1);
            renderAddProductButton(productsGrid);
        }
    } catch (error) {
        productsGrid.innerHTML = '<div class="error-message">Failed to load products</div>';
        renderProductsPagination(page, 1);
        renderAddProductButton(productsGrid);
    }
}

function renderAddProductButton(productsGrid) {
    // Xóa các nút Add Product cũ nếu có
    const oldAddBtns = productsGrid.querySelectorAll('.add-card');
    oldAddBtns.forEach(btn => btn.remove());
    // Thêm mới 1 nút Add Product cuối grid
    const addButton = document.createElement('div');
    addButton.className = 'product-card add-card';
    addButton.innerHTML = `
        <div class="add-product-icon">
            <i class="fas fa-plus"></i>
        </div>
        <h4>Add New Product</h4>
    `;
    // Gán lại event click mỗi lần render
    addButton.onclick = function() {
        if (typeof openProductModal === 'function') {
            openProductModal('add');
        } else {
            alert('Chức năng thêm sản phẩm chưa sẵn sàng!');
        }
    };
    productsGrid.appendChild(addButton);
}

function renderProductsPagination(current, totalPages) {
    // Luôn lấy đúng div đã có trong HTML
    const pagination = document.getElementById('products-pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === current ? ' active' : '');
        btn.onclick = () => {
            currentProductPage = i;
            loadProductsGrid(i, currentType, productSearchTerm);
        };
        pagination.appendChild(btn);
    }
}

// --- FILTER & SEARCH EVENTS FOR PRODUCTS ---
async function renderProductTypeFilter() {
    const filter = document.getElementById('product-type-filter');
    if (!filter) return;
    let types = [];
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:5000/api/foods?page=1&limit=1000', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
            const data = await res.json();
            const products = Array.isArray(data.products) ? data.products : data;
            types = [...new Set(products.map(p => p.type).filter(Boolean))];
        }
    } catch (e) {
        types = [];
    }
    filter.innerHTML = '<option value="all">All Types</option>' +
        types.map(type => `<option value="${type}">${type}</option>`).join('');
}

const productTypeFilter = document.getElementById('product-type-filter');
if (productTypeFilter) {
    productTypeFilter.addEventListener('change', function() {
        currentType = this.value;
        currentProductPage = 1;
        loadProductsGrid(currentProductPage, currentType, productSearchTerm);
    });
}
const productSearchInput = document.getElementById('product-search');
if (productSearchInput) {
    productSearchInput.addEventListener('input', function() {
        productSearchTerm = this.value.trim().toLowerCase();
        currentProductPage = 1;
        loadProductsGrid(currentProductPage, currentType, productSearchTerm);
    });
}

// Gọi lần đầu khi vào trang
if (document.getElementById('products-grid')) {
    renderProductTypeFilter();
    setupAddProductButton();
    loadProductsGrid(currentProductPage, currentType, productSearchTerm);
}

// Load Categories Table
let currentCategoryPage = 1;
const CATEGORIES_PER_PAGE = 4;
let totalCategories = 0;
let categoryStatusFilter = 'all';
let categorySearchTerm = '';
let allCategoriesCache = [];
let currentEditCategoryId = null;

export async function loadCategoriesTable(page = 1) {
    const categoriesTable = document.getElementById('categories-table');
    if (!categoriesTable) return;
    const tbody = categoriesTable.querySelector('tbody');
    tbody.innerHTML = '';
    try {
        const token = localStorage.getItem('authToken');
        // Lấy toàn bộ categories (không phân trang ở API)
        const response = await fetch(`http://localhost:5000/api/categories?page=1&limit=1000`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        let apiCategories = Array.isArray(data.categories) ? data.categories : data;
        allCategoriesCache = apiCategories;
        // --- FILTER CLIENT-SIDE ---
        let filtered = apiCategories;
        if (categoryStatusFilter && categoryStatusFilter !== 'all') {
            filtered = filtered.filter(cat => (cat.status || '').toLowerCase() === categoryStatusFilter);
        }
        if (categorySearchTerm) {
            filtered = filtered.filter(cat => (cat.name || '').toLowerCase().includes(categorySearchTerm));
        }
        totalCategories = filtered.length;
        // --- PHÂN TRANG LẠI SAU FILTER ---
        const startIdx = (page - 1) * CATEGORIES_PER_PAGE;
        const paged = filtered.slice(startIdx, startIdx + CATEGORIES_PER_PAGE);
        if (!paged || paged.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No categories found</td></tr>';
            renderCategoriesPagination(page, Math.ceil(totalCategories / CATEGORIES_PER_PAGE));
            return;
        }
        paged.forEach(category => {
            const tr = document.createElement('tr');
            tr.dataset.id = category.id;
            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox"></td>
                <td>${category.id || ''}</td>
                <td>${category.name || ''}</td>
                <td>${category.products || 0}</td>
                <td><span class="status-badge ${category.status}">${capitalizeFirstLetter(category.status || '')}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-id="${category.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${category.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        // Add event listeners to action buttons
        const editBtns = categoriesTable.querySelectorAll('.edit-btn');
        const deleteBtns = categoriesTable.querySelectorAll('.delete-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                openCategoryModal('edit', categoryId);
            });
        });
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                const categoryId = this.getAttribute('data-id');
                if (confirm(`Are you sure you want to delete category ${categoryId}?`)) {
                    try {
                        const token = localStorage.getItem('authToken');
                        const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': token ? `Bearer ${token}` : ''
                            }
                        });
                        if (res.ok) {
                            showNotification('Success', 'Category deleted', 'success');
                            loadCategoriesTable(currentCategoryPage);
                        } else {
                            showNotification('Error', 'Failed to delete category', 'error');
                        }
                    } catch (err) {
                        showNotification('Error', 'Failed to delete category', 'error');
                    }
                }
            });
        });
        renderCategoriesPagination(page, Math.ceil(totalCategories / CATEGORIES_PER_PAGE));
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading categories</td></tr>';
        renderCategoriesPagination(page, 1);
    }
}

// --- FILTER EVENTS ---
const statusFilterEl = document.getElementById('category-status-filter');
if (statusFilterEl) {
    statusFilterEl.addEventListener('change', function() {
        categoryStatusFilter = this.value;
        loadCategoriesTable(1);
    });
}
const searchInputEl = document.getElementById('category-search');
if (searchInputEl) {
    searchInputEl.addEventListener('input', function() {
        categorySearchTerm = this.value.trim().toLowerCase();
        loadCategoriesTable(1);
    });
}

function renderCategoriesPagination(current, totalPages) {
    let pagination = document.getElementById('categories-pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'categories-pagination';
        pagination.className = 'pagination';
        const tableSection = document.getElementById('categories-table');
        if (tableSection) {
            tableSection.parentNode.appendChild(pagination);
        }
    }
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === current ? ' active' : '');
        btn.onclick = () => {
            currentCategoryPage = i;
            loadCategoriesTable(i);
        };
        pagination.appendChild(btn);
    }
}

// Gọi lần đầu khi vào trang
if (document.getElementById('categories-table')) {
    currentCategoryPage = 1;
    loadCategoriesTable(currentCategoryPage);
}

// --- GLOBALS FOR PROMOTIONS ---
let currentPromotionPage = 1;
const PROMOTIONS_PER_PAGE = 4;
let totalPromotions = 0;
let promotionStatusFilter = 'all';
let promotionSearchTerm = '';
let allPromotionsCache = [];

// --- GLOBAL PROMOTIONS ARRAY ---
let promotions = [];

export async function loadPromotionsTable(page = 1) {
    const promotionsTable = document.getElementById('promotions-table');
    const promotionsTableBody = promotionsTable ? promotionsTable.querySelector('tbody') : null;
    if (!promotionsTableBody) return;
    promotionsTableBody.innerHTML = '';
    try {
        promotionsTableBody.innerHTML = `
            <tr><td colspan="8" class="text-center"><div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading promotions...</div></td></tr>
        `;
        const token = localStorage.getItem('authToken');
        // Lấy toàn bộ promotions (không phân trang ở API)
        const response = await fetch('http://localhost:5000/api/promotions?page=1&limit=1000', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        promotionsTableBody.innerHTML = '';
        if (response.ok) {
            const data = await response.json();
            const apiPromotions = Array.isArray(data.promotions) ? data.promotions : data;
            allPromotionsCache = apiPromotions;
            // Chuyển đổi sang format dùng cho UI
            promotions = allPromotionsCache.map(promo => ({
                code: promo.code || `PROMO-${promo.id}`,
                description: promo.name,
                discount: `${promo.discount_percentage}%`,
                startDate: promo.startDate || '',
                endDate: promo.endDate || '',
                status: promo.status,
                id: promo.id
            }));
            window.promotions = promotions;
            localStorage.setItem('allPromotions', JSON.stringify(promotions));
        } else {
            promotions = JSON.parse(localStorage.getItem('allPromotions') || '[]');
            window.promotions = promotions;
            allPromotionsCache = promotions;
            showNotification('Warning', 'Could not connect to the server. Showing cached promotions.', 'warning');
        }
    } catch (error) {
        promotions = JSON.parse(localStorage.getItem('allPromotions') || '[]');
        window.promotions = promotions;
        allPromotionsCache = promotions;
        showNotification('Error', 'Failed to load promotions. Using local data.', 'error');
    }
    // --- FILTER CLIENT-SIDE ---
    let filtered = promotions;
    if (promotionStatusFilter && promotionStatusFilter !== 'all') {
        let filterValue = promotionStatusFilter.toLowerCase();
        // Map label to real status value
        if (filterValue === 'hoat dong') filterValue = 'active';
        if (filterValue === 'khong hoat dong') filterValue = 'expired';
        filtered = filtered.filter(promo => (promo.status || '').toLowerCase() === filterValue);
    }
    if (promotionSearchTerm) {
        filtered = filtered.filter(promo =>
            (promo.code || '').toLowerCase().includes(promotionSearchTerm) ||
            (promo.description || '').toLowerCase().includes(promotionSearchTerm)
        );
    }
    totalPromotions = filtered.length;
    // --- PHÂN TRANG LẠI SAU FILTER ---
    const startIdx = (page - 1) * PROMOTIONS_PER_PAGE;
    const paged = filtered.slice(startIdx, startIdx + PROMOTIONS_PER_PAGE);
    if (!paged || paged.length === 0) {
        promotionsTableBody.innerHTML = `<tr><td colspan="8" class="text-center">No promotions found</td></tr>`;
        renderPromotionsPagination(page, Math.ceil(totalPromotions / PROMOTIONS_PER_PAGE));
        return;
    }
    paged.forEach(promotion => {
        let statusText = promotion.status;
        let statusClass = '';
        if (statusText === 'Hoat Dong' || statusText === 'active') {
            statusClass = 'active'; statusText = 'Active';
        } else if (statusText === 'Khong Hoat Dong' || statusText === 'inactive') {
            statusClass = 'inactive'; statusText = 'Inactive';
        } else if (statusText === 'scheduled') {
            statusClass = 'pending'; statusText = 'Scheduled';
        } else if (statusText === 'expired') {
            statusClass = 'cancelled'; statusText = 'Expired';
        }
        // Chỉ lấy phần yyyy-mm-dd của ngày
        const startDate = promotion.startDate ? promotion.startDate.split('T')[0] : '';
        const endDate = promotion.endDate ? promotion.endDate.split('T')[0] : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td><span class="promo-code">${promotion.code}</span></td>
            <td>${promotion.description}</td>
            <td><span class="discount-badge">${promotion.discount}</span></td>
            <td class="date-column">${startDate}</td>
            <td class="date-column">${endDate}</td>
            <td><span class="status-badge ${statusClass}" data-status="${promotion.status}">${statusText}</span></td>
            <td><div class="action-buttons">
                <button class="action-btn edit-btn" data-promo-code="${promotion.code}" title="Edit promotion"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-promo-code="${promotion.code}" title="Delete promotion"><i class="fas fa-trash"></i></button>
            </div></td>
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
                    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    button.disabled = true;
                    const promotion = promotions.find(p => p.code === promoCode);
                    if (!promotion) throw new Error('Promotion not found');
                    if (promotion.id) {
                        const token = localStorage.getItem('authToken');
                        const response = await fetch(`http://localhost:5000/api/promotions/${promotion.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Failed to delete promotion from API');
                        }
                    }
                    deletePromotion(promoCode);
                    loadPromotionsTable(currentPromotionPage);
                    showNotification('Success', 'Promotion deleted successfully', 'success');
                } catch (error) {
                    showNotification('Error', `Failed to delete promotion: ${error.message}`, 'error');
                    button.innerHTML = '<i class="fas fa-trash"></i>';
                    button.disabled = false;
                }
            }
        });
    });
    renderPromotionsPagination(page, Math.ceil(totalPromotions / PROMOTIONS_PER_PAGE));
}

// --- FILTER EVENTS FOR PROMOTIONS ---
const promotionStatusFilterEl = document.getElementById('promotion-status-filter');
if (promotionStatusFilterEl) {
    promotionStatusFilterEl.addEventListener('change', function() {
        promotionStatusFilter = this.value;
        loadPromotionsTable(1);
    });
}
const promotionSearchInputEl = document.getElementById('promotion-search');
if (promotionSearchInputEl) {
    promotionSearchInputEl.addEventListener('input', function() {
        promotionSearchTerm = this.value.trim().toLowerCase();
        loadPromotionsTable(1);
    });
}

function renderPromotionsPagination(current, totalPages) {
    let pagination = document.getElementById('promotions-pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'promotions-pagination';
        pagination.className = 'pagination';
        const tableSection = document.getElementById('promotions-table');
        if (tableSection) {
            tableSection.parentNode.appendChild(pagination);
        }
    }
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === current ? ' active' : '');
        btn.onclick = () => {
            currentPromotionPage = i;
            loadPromotionsTable(i);
        };
        pagination.appendChild(btn);
    }
}

// Gọi lần đầu khi vào trang
if (document.getElementById('promotions-table')) {
    loadPromotionsTable(currentPromotionPage);
}

// --- GLOBALS FOR CUSTOMERS ---
let currentCustomerPage = 1;
const CUSTOMERS_PER_PAGE = 4;
let totalCustomers = 0;
let customerStatusFilter = 'all';
let customerSearchTerm = '';
let allCustomersCache = [];

export async function loadCustomersTable(page = 1) {
    const customersTable = document.getElementById('customers-table');
    if (!customersTable) return;
    const tbody = customersTable.querySelector('tbody');
    tbody.innerHTML = '';
    try {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center"><div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading customers...</div></td></tr>`;
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/customers?page=1&limit=1000`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        tbody.innerHTML = '';
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        allCustomersCache = Array.isArray(data) ? data : (data.customers || []);
    } catch (error) {
        allCustomersCache = [];
        showNotification('Error', 'Failed to load customers', 'error');
    }
    // --- FILTER CLIENT-SIDE ---
    let filtered = allCustomersCache;
    if (customerStatusFilter && customerStatusFilter !== 'all') {
        filtered = filtered.filter(cus => (cus.role || '').toLowerCase() === customerStatusFilter.toLowerCase());
    }
    if (customerSearchTerm) {
        filtered = filtered.filter(cus =>
            (cus.name || '').toLowerCase().includes(customerSearchTerm) ||
            (cus.phone_number || '').toLowerCase().includes(customerSearchTerm) ||
            (cus.address || '').toLowerCase().includes(customerSearchTerm)
        );
    }
    totalCustomers = filtered.length;
    // --- PHÂN TRANG LẠI SAU FILTER ---
    const startIdx = (page - 1) * CUSTOMERS_PER_PAGE;
    const paged = filtered.slice(startIdx, startIdx + CUSTOMERS_PER_PAGE);
    if (!paged || paged.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No customers found</td></tr>`;
        renderCustomersPagination(page, Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE));
        return;
    }
    paged.forEach(customer => {
        const tr = document.createElement('tr');
        tr.dataset.id = customer.id;
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td>${customer.id || ''}</td>
            <td>${customer.name || ''}</td>
            <td>${customer.phone_number || ''}</td>
            <td>${customer.address || ''}</td>
            <td>${customer.role || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn delete-btn" data-id="${customer.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Add event listeners to action buttons
    const deleteBtns = customersTable.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const customerId = this.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete customer ${customerId}?`)) {
                try {
                    const token = localStorage.getItem('authToken');
                    const res = await fetch(`http://localhost:5000/api/customers/${customerId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                    });
                    if (res.ok) {
                        showNotification('Success', 'Customer deleted', 'success');
                        loadCustomersTable(currentCustomerPage);
                    } else {
                        showNotification('Error', 'Failed to delete customer', 'error');
                    }
                } catch (err) {
                    showNotification('Error', 'Failed to delete customer', 'error');
                }
            }
        });
    });
    renderCustomersPagination(page, Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE));
}

// --- FILTER EVENTS FOR CUSTOMERS ---
const customerStatusFilterEl = document.getElementById('customer-status-filter');
if (customerStatusFilterEl) {
    customerStatusFilterEl.addEventListener('change', function() {
        customerStatusFilter = this.value;
        loadCustomersTable(1);
    });
}
const customerSearchInputEl = document.getElementById('customer-search');
if (customerSearchInputEl) {
    customerSearchInputEl.addEventListener('input', function() {
        customerSearchTerm = this.value.trim().toLowerCase();
        loadCustomersTable(1);
    });
}

function renderCustomersPagination(current, totalPages) {
    let pagination = document.getElementById('customers-pagination');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'customers-pagination';
        pagination.className = 'pagination';
        const tableSection = document.getElementById('customers-table');
        if (tableSection) {
            tableSection.parentNode.appendChild(pagination);
        }
    }
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === current ? ' active' : '');
        btn.onclick = () => {
            currentCustomerPage = i;
            loadCustomersTable(i);
        };
        pagination.appendChild(btn);
    }
}

// Gọi lần đầu khi vào trang
if (document.getElementById('customers-table')) {
    loadCustomersTable(currentCustomerPage);
}

// Product search
const productSearch = document.getElementById('product-search');
if (productSearch) {
    productSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Client-side filtering for real-time search feedback
        const productCards = document.querySelectorAll('#products-grid .product-card');
        let hasVisibleRows = false;
        
        productCards.forEach(row => {
            let shouldDisplay = false;
            
            // Skip the special messages rows (like "No products found")
            if (row.cells.length === 1 && row.cells[0].colSpan === 9) {
                return;
            }
            
            try {
                const productName = row.querySelector('h3').textContent.toLowerCase() || '';
                
                // Check if any field contains the search term
                if (productName.includes(searchTerm)) {
                    shouldDisplay = true;
                    hasVisibleRows = true;
                }
                
                // Show or hide the row
                row.style.display = shouldDisplay ? 'table-row' : 'none';
            } catch (error) {
                console.error('Error filtering product row:', error);
            }
        });
        
        // Show a "no results" message if needed
        const tbody = document.querySelector('#products-grid tbody');
        const noResultsRow = document.getElementById('no-search-results-row');
        
        if (!hasVisibleRows && searchTerm.length > 0) {
            if (!noResultsRow) {
                const tr = document.createElement('tr');
                tr.id = 'no-search-results-row';
                tr.innerHTML = `
                    <td colspan="9" class="text-center">No products matching "${searchTerm}"</td>
                `;
                tbody.appendChild(tr);
            } else {
                noResultsRow.querySelector('td').textContent = `No products matching "${searchTerm}"`;
                noResultsRow.style.display = 'table-row';
            }
        } else if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
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

// --- CATEGORY FILTER DYNAMIC RENDER ---
async function renderProductCategoryFilter() {
    const filter = document.getElementById('product-category-filter');
    if (!filter) return;
    // Lấy danh sách category từ API hoặc từ products
    let categories = [];
    try {
        const token = localStorage.getItem('authToken');
        // Ưu tiên lấy từ API categories nếu có
        let res = await fetch('http://localhost:5000/api/categories', {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        if (res.ok) {
            const data = await res.json();
            categories = Array.isArray(data.categories) ? data.categories : data;
            categories = categories.map(c => c.name);
        } else {
            // Nếu không có API categories, fallback lấy từ products
            res = await fetch('http://localhost:5000/api/foods?page=1&limit=1000', {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            if (res.ok) {
                const data = await res.json();
                const products = Array.isArray(data.products) ? data.products : data;
                categories = [...new Set(products.map(p => p.category).filter(Boolean))];
            }
        }
    } catch (e) {
        // fallback nếu lỗi
        categories = [];
    }
    // Render lại select
    filter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// --- SỬA LẠI NÚT ADD NEW PRODUCT ---
function setupAddProductButton() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.onclick = function() {
            openProductModal('add');
        };
    }
}

// --- GỌI LẠI HÀM KHI LOAD TRANG ---
if (document.getElementById('products-grid')) {
    renderProductCategoryFilter();
    setupAddProductButton();
    loadProductsGrid(currentProductPage, currentType, productSearchTerm);
}

function openCategoryModal(mode, categoryId = null) {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    // Sửa tiêu đề modal
    const title = modal.querySelector('.modal-header h3');
    const form = document.getElementById('category-form');
    const saveBtn = document.getElementById('save-category-btn');
    if (title) {
        title.textContent = (mode === 'add') ? 'Add Category' : 'Edit Category';
    }

    if (mode === 'add') {
    if (form) form.reset();
        if (form.elements['status']) form.elements['status'].value = 'active';
        if (saveBtn) saveBtn.textContent = 'Add Category';
        window.currentEditCategoryId = null;
    } else if (mode === 'edit' && categoryId) {
        // Không reset form khi edit, chỉ fill lại dữ liệu
        const row = document.querySelector(`#categories-table tr[data-id='${categoryId}']`);
        if (row) {
            form.elements['name'].value = row.children[2]?.textContent.trim() || '';
            // Lấy status từ badge (giống logic promotions)
            let statusValue = row.querySelector('.status-badge')?.textContent.trim().toLowerCase() || 'active';
            if (statusValue === 'hoat dong') statusValue = 'active';
            if (statusValue === 'khong hoat dong') statusValue = 'inactive';
            form.elements['status'].value = statusValue;
            // Nếu có trường description thì lấy luôn
            if (form.elements['description'] && row.children[3]) {
                form.elements['description'].value = row.children[3]?.textContent.trim() || '';
            }
        }
        if (saveBtn) saveBtn.textContent = 'Save Category';
        window.currentEditCategoryId = categoryId;
    }

    // Gán lại sự kiện submit cho form mỗi lần mở modal
    form.onsubmit = async function(e) {
        e.preventDefault();
        const name = form.elements['name'].value.trim();
        const status = form.elements['status'].value;
        const description = form.elements['description'] ? form.elements['description'].value.trim() : "";
        const products = 0;
        if (!name || !status) {
            showNotification('Error', 'Category name and status are required', 'error');
            return;
        }
        const body = JSON.stringify({ name, description, status, products });
        try {
            const token = localStorage.getItem('authToken');
            let url = 'http://localhost:5000/api/categories';
            let method = 'POST';
            if (window.currentEditCategoryId) {
                url = `${url}/${window.currentEditCategoryId}`;
                method = 'PUT';
            }
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body
            });
            if (res.ok) {
                showNotification('Success', `Category ${window.currentEditCategoryId ? 'updated' : 'added'} successfully`, 'success');
                modal.classList.remove('show');
                loadCategoriesTable(1);
            } else {
                showNotification('Error', 'Failed to save category', 'error');
            }
        } catch (err) {
            showNotification('Error', 'Failed to save category', 'error');
        }
    };

    // Hiện modal
    modal.classList.add('show');
}
window.openCategoryModal = openCategoryModal;

document.addEventListener('DOMContentLoaded', function() {
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = function() {
            openCategoryModal('add');
        };
    }
});

// Đảm bảo luôn gán lại sự kiện submit cho form khi trang load
function setupPromotionFormSubmit() {
    const promotionForm = document.getElementById('promotion-form');
    if (promotionForm) {
        promotionForm.onsubmit = async function(e) {
            e.preventDefault();
            const name = promotionForm.elements['description'].value.trim();
            const discount_percentage = parseFloat(promotionForm.elements['discount'].value.trim());
            const min_order_value = parseFloat(promotionForm.elements['min_order_value']?.value.trim() || '0');
            const max_discount_amount = parseFloat(promotionForm.elements['max_discount_amount']?.value.trim() || '0');
            const status = promotionForm.elements['status'].value;
            const startDate = promotionForm.elements['startDate'].value;
            const endDate = promotionForm.elements['endDate'].value;
            if (!name || isNaN(discount_percentage) || !status || !startDate || !endDate) {
                showNotification('Error', 'Please fill all fields', 'error');
                return;
            }
            const body = JSON.stringify({
                name,
                discount_percentage,
                min_order_value,
                max_discount_amount,
                status,
                startDate,
                endDate
            });
            const token = localStorage.getItem('authToken');
            try {
                let url = 'http://localhost:5000/api/promotions';
            let method = 'POST';
                // Lấy mode từ thuộc tính data-mode của form
                const mode = promotionForm.getAttribute('data-mode');
                const promoCode = promotionForm.getAttribute('data-promo-code');
                if (mode === 'edit' && promoCode) {
                    let promotion = (window.promotions || []).find(p => p.code === promoCode);
                    if (!promotion && window.allPromotionsCache) promotion = window.allPromotionsCache.find(p => p.code === promoCode);
                    if (!promotion || !promotion.id) {
                        showNotification('Error', 'Promotion not found', 'error');
                        return;
                    }
                    url = `${url}/${promotion.id}`;
                method = 'PUT';
            }
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: body
                });
                if (res.ok) {
                    showNotification('Success', `Promotion ${mode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
                    document.getElementById('promotion-modal').classList.remove('show');
                    localStorage.removeItem('allPromotions');
                    if (typeof loadPromotionsTable === 'function') loadPromotionsTable(currentPromotionPage);
                } else {
                    showNotification('Error', 'Failed to save promotion', 'error');
                }
            } catch (err) {
                showNotification('Error', 'Failed to save promotion', 'error');
            }
        };
    }
    // Gán lại sự kiện cho nút Cancel Promotion
    const cancelPromotionBtn = document.getElementById('cancel-promotion-btn');
    if (cancelPromotionBtn) {
        cancelPromotionBtn.onclick = function(e) {
            e.preventDefault();
            const modal = document.getElementById('promotion-modal');
            if (modal) modal.classList.remove('show');
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupPromotionFormSubmit();
    // Gán lại sự kiện cho nút Add Promotion (chỉ lấy đúng id)
    const addPromotionBtn = document.getElementById('add-promotion-btn');
    if (addPromotionBtn) {
        addPromotionBtn.onclick = function() {
            openPromotionModal('add');
        };
    }
    // Event delegation cho nút Edit Promotion trong bảng
    const promotionsTable = document.getElementById('promotions-table');
    if (promotionsTable) {
        promotionsTable.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const promoCode = editBtn.getAttribute('data-promo-code');
                openPromotionModal('edit', promoCode);
            }
        });
    }
});

function openPromotionModal(mode, promoCode = null) {
    const modal = document.getElementById('promotion-modal');
    if (!modal) return;
    const modalTitle = document.getElementById('promotion-modal-title');
    const promotionForm = document.getElementById('promotion-form');
    const saveBtn = document.getElementById('save-promotion-btn');

    // Reset form
    if (promotionForm) promotionForm.reset();

    // Gán thuộc tính để biết mode khi submit
    promotionForm.setAttribute('data-mode', mode);
    promotionForm.setAttribute('data-promo-code', promoCode || '');

    if (mode === 'add') {
        if (promotionForm) promotionForm.reset();
        modalTitle.textContent = 'Add New Promotion';
        saveBtn.textContent = 'Add Promotion';
        if (promotionForm.elements['status']) {
            promotionForm.elements['status'].value = 'active';
        }
    } else if (mode === 'edit' && promoCode) {
        modalTitle.textContent = 'Edit Promotion';
        saveBtn.textContent = 'Save Promotion';
        // Không reset form khi edit, chỉ fill lại dữ liệu
        let promotion = (window.promotions || []).find(p => p.code === promoCode);
        if (!promotion && window.allPromotionsCache) promotion = window.allPromotionsCache.find(p => p.code === promoCode);
        if (!promotion) return;
        promotionForm.elements['code'].value = promotion.code;
        promotionForm.elements['description'].value = promotion.description;
        promotionForm.elements['discount'].value = promotion.discount.replace('%','');
        promotionForm.elements['startDate'].value = promotion.startDate ? promotion.startDate.split('T')[0] : '';
        promotionForm.elements['endDate'].value = promotion.endDate ? promotion.endDate.split('T')[0] : '';
        let statusValue = promotion.status.toLowerCase();
        if (statusValue === 'hoat dong') statusValue = 'active';
        if (statusValue === 'khong hoat dong') statusValue = 'inactive';
        promotionForm.elements['status'].value = statusValue;
    }
    // Gán lại sự kiện submit và cancel mỗi lần mở modal
    setupPromotionFormSubmit();
    // Hiện modal
    modal.classList.add('show');
}
window.openPromotionModal = openPromotionModal;

// Khởi tạo tất cả chức năng admin khi trang được load
document.addEventListener('DOMContentLoaded', async function() {
    // Kiểm tra xác thực trước
    await checkAuthentication();
    
    // Khởi tạo dashboard nếu đang ở trang dashboard
    if (document.getElementById('dashboard')) {
        initDashboard();
    }

    // Khởi tạo các bảng dữ liệu
    // loadOrdersTable();
    // // loadProductsGrid();
    // loadCategoriesTable();
    // loadPromotionsTable();
    // loadCustomersTable();

    // Khởi tạo các event listeners cho các nút
    setupEventListeners();
});

// Hàm setup tất cả event listeners
function setupEventListeners() {
    // Add Product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.onclick = () => openProductModal('add');
    }

    // Add Category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = () => openCategoryModal('add');
    }

    // Add Promotion button
    const addPromotionBtn = document.getElementById('add-promotion-btn');
    if (addPromotionBtn) {
        addPromotionBtn.onclick = () => openPromotionModal('add');
    }

    // Add Customer button
    const addCustomerBtn = document.getElementById('add-customer-btn');
    if (addCustomerBtn) {
        addCustomerBtn.onclick = () => openCustomerModal('add');
    }

    // Save buttons
    setupSaveButtons();
}

// Hàm setup các nút Save
function setupSaveButtons() {
    // Save Product
    const saveProductBtn = document.getElementById('save-product-btn');
    if (saveProductBtn) {
        saveProductBtn.onclick = handleSaveProduct;
    }

    // Save Category
    const saveCategoryBtn = document.getElementById('save-category-btn');
    if (saveCategoryBtn) {
        saveCategoryBtn.onclick = handleSaveCategory;
    }

    // Save Customer
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    if (saveCustomerBtn) {
        saveCustomerBtn.onclick = handleSaveCustomer;
    }
}

// Hàm xử lý save Product
async function handleSaveProduct(e) {
    e.preventDefault();
    const form = document.getElementById('product-form');
    if (!form) return;
    const name = form.elements['name'].value.trim();
    const description = form.elements['description'] ? form.elements['description'].value.trim() : "";
    const price = parseFloat(form.elements['price'].value.trim());
    const category = form.elements['category'].value;
    const status = form.elements['status'].value;
    const type = form.elements['type'] ? form.elements['type'].value : "";
    const image_id = parseInt(form.elements['image_id']?.value || '0');
    const sold_quantity = parseInt(form.elements['sold_quantity']?.value || '0');
    if (!name || !description || !category || isNaN(price) || !status || !type || !image_id) {
        showNotification('Error', 'Please fill all required fields and select an image', 'error');
        return;
    }
    const body = JSON.stringify({
        name,
        description,
        price,
        category,
        status,
        type,
        image_id,
        sold_quantity
    });
    try {
        const token = localStorage.getItem('authToken');
        const url = currentEditMode === 'edit' && currentProductId 
            ? `http://localhost:5000/api/foods/${currentProductId}`
            : 'http://localhost:5000/api/foods';
        
        const res = await fetch(url, {
            method: currentEditMode === 'edit' ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: body
        });

        if (res.ok) {
            showNotification('Success', `Product ${currentEditMode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
            document.getElementById('product-modal').classList.remove('show');
            loadProductsGrid();
                } else {
                    showNotification('Error', 'Failed to save product', 'error');
                }
            } catch (err) {
                showNotification('Error', 'Failed to save product', 'error');
    }
}

// Hàm xử lý save Category
async function handleSaveCategory(e) {
    e.preventDefault();
    const form = document.getElementById('category-form');
    if (!form) return;
    const name = form.elements['name'].value.trim();
    const description = form.elements['description'] ? form.elements['description'].value.trim() : "";
    const status = form.elements['status'].value;
    const products = parseInt(form.elements['products']?.value || '0');
    if (!name || !status) {
        showNotification('Error', 'Category name and status are required', 'error');
        return;
    }
    const body = JSON.stringify({
        name,
        description,
        status,
        products
    });
    try {
        const token = localStorage.getItem('authToken');
        const url = currentEditMode === 'edit' && currentCategoryId
            ? `http://localhost:5000/api/categories/${currentCategoryId}`
            : 'http://localhost:5000/api/categories';

        const res = await fetch(url, {
            method: currentEditMode === 'edit' ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: body
        });

        if (res.ok) {
            showNotification('Success', `Category ${currentEditMode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
            document.getElementById('category-modal').classList.remove('show');
            loadCategoriesTable();
        } else {
            showNotification('Error', 'Failed to save category', 'error');
        }
    } catch (err) {
        showNotification('Error', 'Failed to save category', 'error');
    }
}

// Hàm xử lý save Promotion
async function handleSavePromotion(e) {
    e.preventDefault();
    const form = document.getElementById('promotion-form');
    if (!form) return;
    const name = form.elements['description'].value.trim();
    const discount_percentage = parseFloat(form.elements['discount'].value.trim());
    const status = form.elements['status'].value;
    const startDate = form.elements['startDate'].value;
    const endDate = form.elements['endDate'].value;
    if (!name || isNaN(discount_percentage) || !status || !startDate || !endDate) {
        showNotification('Error', 'Please fill all fields', 'error');
        return;
    }
    const body = JSON.stringify({
        name,
        discount_percentage,
        status,
        startDate,
        endDate
    });
    const token = localStorage.getItem('authToken');
    try {
        let url = 'http://localhost:5000/api/promotions';
        let method = 'POST';

        if (currentEditMode === 'edit') {
            const code = form.elements['code'].value;
            const promo = window.promotions.find(p => p.code === code);
            if (promo && promo.id) {
                url = `${url}/${promo.id}`;
                method = 'PUT';
            }
        }

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: body
        });

        if (res.ok) {
            showNotification('Success', `Promotion ${currentEditMode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
            document.getElementById('promotion-modal').classList.remove('show');
            loadPromotionsTable();
        } else {
            showNotification('Error', 'Failed to save promotion', 'error');
        }
    } catch (err) {
        showNotification('Error', 'Failed to save promotion', 'error');
    }
}

// Hàm xử lý save Customer
async function handleSaveCustomer(e) {
    e.preventDefault();
    const form = document.getElementById('customer-form');
    if (!form) return;

    const formData = {
        name: form.elements['name'].value,
        email: form.elements['email'].value,
        phone: form.elements['phone'].value,
        address: form.elements['address'].value,
        status: form.elements['status'].value
    };

    try {
        const token = localStorage.getItem('authToken');
        const url = currentEditMode === 'edit' && currentCustomerId
            ? `http://localhost:5000/api/customers/${currentCustomerId}`
            : 'http://localhost:5000/api/customers';

        const res = await fetch(url, {
            method: currentEditMode === 'edit' ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            showNotification('Success', `Customer ${currentEditMode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
            document.getElementById('customer-modal').classList.remove('show');
            loadCustomersTable();
        } else {
            showNotification('Error', 'Failed to save customer', 'error');
        }
    } catch (err) {
        showNotification('Error', 'Failed to save customer', 'error');
    }
}

// --- XỬ LÝ CHUYỂN SECTION KHI CLICK MENU ---
document.querySelectorAll('.nav-item a').forEach(item => {
    item.addEventListener('click', function(e) {
        // Nếu là link ngoài thì bỏ qua
        if (!this.getAttribute('href').startsWith('#')) return;
        e.preventDefault();
        // Lấy id section từ href
        const targetId = this.getAttribute('href').substring(1);
        // Ẩn tất cả section
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
        // Hiện section được chọn
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove('hidden');
        // Đánh dấu active cho menu
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.parentElement.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');
    if (cancelCategoryBtn) {
        cancelCategoryBtn.onclick = function(e) {
            e.preventDefault();
            const modal = document.getElementById('category-modal');
            if (modal) modal.classList.remove('show');
        };
    }
});

function deletePromotion(promoCode) {
    // Xóa promotion khỏi mảng promotions và localStorage
    promotions = promotions.filter(p => p.code !== promoCode);
    window.promotions = promotions;
    localStorage.setItem('allPromotions', JSON.stringify(promotions));
}

// --- ORDER MODAL LOGIC ---
function openOrderModal(orderId) {
    const modal = document.getElementById('order-modal');
    if (!modal) return;
    const form = document.getElementById('order-form');
    const saveBtn = document.getElementById('save-order-btn');
    const order = allOrdersCache.find(o => o.id == orderId);
    if (!order) return;
    // Fill form
    form.elements['id'].value = order.id;
    form.elements['customer_id'].value = order.id_KH;
    form.elements['restaurant_id'].value = order.id_NH;
    form.elements['promotion_id'].value = order.id_PROMO;
    form.elements['category'].value = order.category;
    form.elements['total_price'].value = order.total_price;
    form.elements['status'].value = order.order_status;
    form.elements['date'].value = order.date ? order.date.split('T')[0] : '';
    // Gán lại submit
    form.onsubmit = async function(e) {
        e.preventDefault();
        const status = form.elements['status'].value;
        try {
            const token = localStorage.getItem('authToken');
            const body = JSON.stringify({ ...order, order_status: status });
            const res = await fetch(`http://localhost:5000/api/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
                body
            });
            if (res.ok) {
                showNotification('Success', 'Order updated successfully', 'success');
                modal.classList.remove('show');
                loadOrdersTable(currentOrderPage);
            } else {
                showNotification('Error', 'Failed to update order', 'error');
            }
        } catch (err) {
            showNotification('Error', 'Failed to update order', 'error');
        }
    };
    // Cancel button
    const cancelBtn = document.getElementById('cancel-order-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            modal.classList.remove('show');
        };
    }
    modal.classList.add('show');
}
window.openOrderModal = openOrderModal;
// Gán event cho nút edit order
if (document.getElementById('orders-table')) {
    document.getElementById('orders-table').addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const orderId = editBtn.getAttribute('data-id');
            openOrderModal(orderId);
        }
    });
}

function openProductModal(mode, productId = null) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    const form = document.getElementById('product-form');
    const saveBtn = document.getElementById('save-product-btn');
    const preview = document.getElementById('product-image-preview');
    if (form) form.reset();
    if (preview) { preview.style.display = 'none'; preview.querySelector('img').src = ''; }
    form.setAttribute('data-mode', mode);
    form.setAttribute('data-product-id', productId || '');
    if (mode === 'add') {
        const modalTitle = document.getElementById('product-modal-title');
        if (modalTitle) modalTitle.textContent = 'Add New Product';
        saveBtn.textContent = 'Add Product';
    } else if (mode === 'edit' && productId) {
        const modalTitle = document.getElementById('product-modal-title');
        if (modalTitle) modalTitle.textContent = 'Edit Product';
        saveBtn.textContent = 'Save Product';
        const product = window.allProductsCache?.find(p => p.id == productId);
        if (product) {
            form.elements['name'].value = product.name;
            form.elements['type'].value = product.type;
            form.elements['price'].value = product.price;
            form.elements['status'].value = product.status;
            if (form.elements['description']) form.elements['description'].value = product.description || '';
            if (form.elements['category']) form.elements['category'].value = product.category || '';
            if (form.elements['sold_quantity']) form.elements['sold_quantity'].value = product.sold_quantity || 0;
            if (form.elements['image_id']) form.elements['image_id'].value = product.image_id || 0;
            if (product.image_url && preview) {
                preview.style.display = 'block';
                preview.querySelector('img').src = product.image_url;
            }
        }
    }
    // Preview ảnh khi chọn file
    form.elements['image'].onchange = function(e) {
        const file = e.target.files[0];
        if (file && preview) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                preview.style.display = 'block';
                preview.querySelector('img').src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else if (preview) {
            preview.style.display = 'none';
            preview.querySelector('img').src = '';
        }
    };
    // Gán lại onsubmit
    form.onsubmit = async function(e) {
        e.preventDefault();
        const name = form.elements['name'].value.trim();
        const description = form.elements['description'] ? form.elements['description'].value.trim() : '';
        const price = parseFloat(form.elements['price'].value.trim());
        const category = form.elements['category'] ? form.elements['category'].value.trim() : '';
        const status = form.elements['status'].value;
        const type = form.elements['type'].value.trim();
        const sold_quantity = parseInt(form.elements['sold_quantity']?.value || '0');
        const imageFile = form.elements['image'].files[0];
        let image_id = 0;
        // Nếu có upload ảnh thì upload trước, lấy image_id
        if (imageFile) {
            const imgForm = new FormData();
            imgForm.append('image', imageFile);
            const token = localStorage.getItem('authToken');
            const imgRes = await fetch('http://localhost:5000/api/images/upload', {
                method: 'POST',
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                body: imgForm
            });
            if (imgRes.ok) {
                const imgData = await imgRes.json();
                image_id = imgData.image_id || 0;
            }
        } else if (form.elements['image_id']) {
            image_id = parseInt(form.elements['image_id'].value) || 0;
        }
        if (!name || isNaN(price) || !status || !type) {
            showNotification('Error', 'Please fill all required fields', 'error');
            return;
        }
        const body = JSON.stringify({
            name,
            description,
            price,
            category,
            status,
            type,
            image_id,
            sold_quantity
        });
        const token = localStorage.getItem('authToken');
        let url = 'http://localhost:5000/api/foods';
        let method = 'POST';
        if (mode === 'edit' && productId) {
            url = `${url}/${productId}`;
            method = 'PUT';
        }
        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body
            });
            if (res.ok) {
                showNotification('Success', `Product ${mode === 'edit' ? 'updated' : 'added'} successfully`, 'success');
                modal.classList.remove('show');
                loadProductsGrid();
            } else {
                showNotification('Error', 'Failed to save product', 'error');
            }
        } catch (err) {
            showNotification('Error', 'Failed to save product', 'error');
        }
    };
    // Cancel button
    const cancelBtn = document.getElementById('cancel-product-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            modal.classList.remove('show');
        };
    }
    modal.classList.add('show');
}
window.openProductModal = openProductModal;
// Gán event cho nút Add Product
const addProductBtn = document.getElementById('add-product-btn');
if (addProductBtn) {
    addProductBtn.onclick = function() {
        openProductModal('add');
    };
}
// Gán event cho nút Edit/Delete trên card
function setupProductCardEvents() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.querySelectorAll('.product-card .edit').forEach(btn => {
        btn.onclick = function() {
            const id = this.getAttribute('data-product-id');
            openProductModal('edit', id);
        };
    });
    grid.querySelectorAll('.product-card .delete').forEach(btn => {
        btn.onclick = async function() {
            const id = this.getAttribute('data-product-id');
            if (confirm('Are you sure you want to delete this product?')) {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`http://localhost:5000/api/foods/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                });
                if (res.ok) {
                    showNotification('Success', 'Product deleted', 'success');
                    loadProductsGrid();
                } else {
                    showNotification('Error', 'Failed to delete product', 'error');
                }
            }
        };
    });
}
// Gọi lại sau mỗi lần loadProductsGrid
const origLoadProductsGrid = loadProductsGrid;
window.loadProductsGrid = async function(...args) {
    await origLoadProductsGrid.apply(this, args);
    setupProductCardEvents();
};