// File: login.js

// Hàm xử lý đăng nhập
function handleLogin(username, password) {
    // Kiểm tra xem người dùng có phải là admin không
    const isAdmin = username === 'admin@example.com'; // Hoặc kiểm tra từ phản hồi của máy chủ
    
    if (isAdmin) {
        localStorage.setItem('userRole', 'admin');
    } else {
        localStorage.setItem('userRole', 'customer');
    }
    
    // Chuyển hướng đến trang chủ
    window.location.href = 'home.html';
}

// Thêm sự kiện lắng nghe cho form đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            handleLogin(username, password);
        });
    }
});

// Hàm đăng xuất
function handleLogout() {
    localStorage.removeItem('userRole');
    window.location.href = 'signin.html';
}