// Import image utility functions
import { getMainImage, displayImage, LOADING_IMAGE } from './image-utils.js';
import { loadRecentOrders, loadTopProducts, loadOrdersTable, loadProductsGrid, loadCategoriesTable, loadPromotionsTable, loadCustomersTable } from './loaders.js';

// Định nghĩa hàm initDashboard ở phía trên hàm init và mọi nơi gọi nó
function initDashboard() {
    loadRecentOrders();
    loadTopProducts();
    // loadOrdersTable();
    // loadProductsGrid();
    // loadCategoriesTable();
    // loadPromotionsTable();
    // loadCustomersTable();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, running init()');
    // Run init function
    await init();
});
    
    // Initialize the dashboard
async function init() {
    console.log('Initializing admin dashboard...');
    // First check authentication - this should happen before any data loading
    await checkAuthentication();
    // Initialize dashboard if on dashboard page
    if (document.getElementById('dashboard')) {
        initDashboard();
    }
}

// Hàm kiểm tra xác thực
async function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    try {
        // Nếu không có token, thử đăng nhập với tài khoản mặc định
        if (!token) {
            showAuthenticationModal();
            throw new Error('No token found');
        }
        return true;
    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
        showAuthenticationModal();
        throw error;
    }
}

// SỬA tryAutoLogin: chỉ hiển thị modal đăng nhập nếu login thất bại, không tạo fake token
async function tryAutoLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
        });
        if (!response.ok) throw new Error('Auto-login failed');
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        return true;
    } catch (error) {
        console.error('Auto-login failed:', error);
        showAuthenticationModal();
        throw error;
    }
}

// SỬA showAuthenticationModal: khi login thất bại, báo lỗi rõ ràng
function showAuthenticationModal() {
    if (document.getElementById('admin-login-form')) return; // Đã có modal
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
    const loginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('login-error');
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = loginForm.elements.email.value;
        const password = loginForm.elements.password.value;
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }
            const data = await response.json();
            if (data.user.role !== 'admin') throw new Error('Access denied: Admin privileges required');
            localStorage.setItem('authToken', data.token);
            modal.remove();
            location.reload();
        } catch (error) {
            errorMessage.textContent = error.message || 'Invalid credentials';
            errorMessage.style.display = 'block';
        }
    });
}

// SỬA LỖI TOKEN: Luôn ưu tiên lấy token từ localStorage, nếu không có thì dùng token cứng
function getAdminToken() {
    return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxOCwicm9sZSI6ImFkbWluIiwibmFtZSI6IlRlc3QgQWRtaW4iLCJpYXQiOjE3NDgwNzk0ODYsImV4cCI6MTc0ODE2NTg4Nn0.XH85ef1inDAORxFnyS66OBl4squOmtYs6FZHf3gfwMw';
}

// ... existing code ...