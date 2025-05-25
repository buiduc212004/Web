export function getAdminToken() {
    return localStorage.getItem('authToken') || '';
}

export function showNotification(title, message, type = 'default') {
    // ... nội dung showNotification từ admin.js ...
}

export function formatPrice(price) {
    return price ? price.toLocaleString() + ' đ' : '';
}

export function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}

export function formatDateFromInput(dateStr) {
    if (!dateStr) return '';
    try {
        if (dateStr.includes('-')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
    } catch (err) {}
    return dateStr;
}

// Các hàm modal và delete sẽ được import lại từ admin.js nếu cần
// export function openOrderDetailsModal(orderId, mode) { ... }
// export function openProductModal(mode, productId) { ... }
// export function openCategoryModal(mode, categoryId) { ... }
// export function openPromotionModal(mode, promoCode) { ... }
// export function deleteOrder(orderId) { ... }
// export function deleteProduct(productId) { ... }
// export function deletePromotion(promoCode) { ... }
// export function deleteCustomer(customerId) { ... } 