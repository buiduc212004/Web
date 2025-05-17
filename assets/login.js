// File: login.js

const API_URL = 'http://localhost:5000/api';

// Hàm hiển thị thông báo lỗi
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Hàm hiển thị loading
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
}

// Hàm ẩn loading
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Hàm xử lý đăng nhập
async function handleLogin(username, password) {
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone_number: username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // Lưu token và thông tin người dùng
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);

        // Chuyển hướng dựa trên role
        if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'Home.html';
        }
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Thêm sự kiện lắng nghe cho form đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showError('Vui lòng nhập đầy đủ thông tin');
                return;
            }
            
            handleLogin(username, password);
        });
    }

    // Kiểm tra trạng thái đăng nhập
    const token = localStorage.getItem('token');
    if (token) {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'Home.html';
        }
    }
});

// Hàm đăng xuất
async function handleLogout() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Xóa thông tin người dùng
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // Chuyển hướng về trang đăng nhập
        window.location.href = 'signin.html';
    }
}

// Hàm kiểm tra token
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'signin.html';
        return false;
    }
    return true;
}

// Hàm lấy thông tin người dùng
async function getUserInfo() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin người dùng');
        }

        return await response.json();
    } catch (error) {
        console.error('Get user info error:', error);
        return null;
    }
}