document.addEventListener('DOMContentLoaded', function() {
    // Handle Sign In form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const email = this.querySelector('input[name="email"]').value;
            const password = this.querySelector('input[name="password"]').value;
            
            // Simulate form submission
            console.log('Sign In Form Submitted:', { email, password });
            
            // Simulate successful login by setting a token
            localStorage.setItem('token', 'sample-token');
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userId', '123');
            localStorage.setItem('userName', 'User');
            
            // Show success message
            showSuccessMessage(this, 'Đăng nhập thành công! Đang chuyển hướng...', function() {
                window.location.href = 'Home.html';
            });
        });
    }
    
    // Handle Forgot Password 1 form
    const forgotForm1 = document.getElementById('forgot-form1');
    if (forgotForm1) {
        forgotForm1.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get phone number
            const phone = document.getElementById('phone-input').value;
            
            // Simulate form submission
            console.log('Forgot Password Form 1 Submitted:', { phone });
            
            // Redirect to forgot-password2.html
            window.location.href = 'forgot-password2.html';
        });
    }
    
    // Handle Forgot Password 2 form
    const forgotForm2 = document.getElementById('forgot-form2');
    if (forgotForm2) {
        forgotForm2.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const newPassword = this.querySelector('input[name="new-password"]').value;
            const confirmPassword = this.querySelector('input[name="confirm-password"]').value;
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Simulate form submission
            console.log('Forgot Password Form 2 Submitted:', { newPassword });
            
            // Show success message and redirect to sign in
            showSuccessMessage(this, 'Password reset successful! Redirecting to login...', function() {
                window.location.href = 'signin.html';
            });
        });
    }
    
    // Handle Sign Up form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullname = this.querySelector('input[name="fullname"]').value;
            const phone_number = this.querySelector('input[name="phone_number"]').value;
            const password = this.querySelector('input[name="password"]').value;
            
            // Simulate form submission
            console.log('Sign Up Form Submitted:', { fullname, phone_number, password });
            
            // Show success message and redirect to sign in
            showSuccessMessage(this, 'Account created successfully! Redirecting to login...', function() {
                window.location.href = 'signin.html';
            });
        });
    }
    
    // Handle Change Password form
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const currentPassword = this.querySelector('input[name="current-password"]').value;
            const newPassword = this.querySelector('input[name="new-password"]').value;
            const confirmPassword = this.querySelector('input[name="confirm-password"]').value;
            
            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }
            
            // Simulate form submission
            console.log('Change Password Form Submitted:', { currentPassword, newPassword });
            
            // Show success message
            showSuccessMessage(this, 'Password changed successfully!');
        });
    }
    
    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Simple password validation
            if (this.value.length < 6) {
                this.style.borderColor = '#ff3333';
            } else {
                this.style.borderColor = '#00cc66';
            }
        });
    });
    
    // Check password confirmation match
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirm-password"]');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const form = this.closest('form');
            const newPassword = form.querySelector('input[name="new-password"]').value;
            
            if (this.value && this.value !== newPassword) {
                this.style.borderColor = '#ff3333';
            } else if (this.value) {
                this.style.borderColor = '#00cc66';
            }
        });
    });
    
    // Function to show success message
    function showSuccessMessage(form, message, callback) {
        const formContent = form.closest('.form-content');
        const originalContent = formContent.innerHTML;
        
        // Create success message
        formContent.innerHTML = `
            <div class="success-message">
                <h2>${message}</h2>
            </div>
        `;
        
        // Reset form and restore original content after delay
        setTimeout(() => {
            if (callback) {
                callback();
            } else {
                formContent.innerHTML = originalContent;
                form.reset();
            }
        }, 2000);
    }
});