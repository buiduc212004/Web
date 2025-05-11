/**
 * Utility functions để xử lý ảnh từ API
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Lấy ảnh chính của một đối tượng theo loại và ID
 * @param {string} referenceType - Loại đối tượng (Food, Restaurant, ...)
 * @param {number} referenceId - ID của đối tượng
 * @param {function} callback - Hàm callback nhận URL ảnh
 * @param {string} fallbackImage - Ảnh mặc định nếu không có ảnh
 */
export async function getMainImage(referenceType, referenceId, callback, fallbackImage = '../image/Combo_1.png') {
    try {
        const response = await fetch(`${API_URL}/upload/main/${referenceType}/${referenceId}`);
        
        if (!response.ok) {
            console.warn(`No image found for ${referenceType} with ID ${referenceId}`);
            callback(fallbackImage);
            return;
        }
        
        const image = await response.json();
        callback(image.fullPath || image.path || fallbackImage);
    } catch (error) {
        console.error('Error fetching image:', error);
        callback(fallbackImage);
    }
}

/**
 * Lấy tất cả ảnh của một đối tượng theo loại và ID
 * @param {string} referenceType - Loại đối tượng (Food, Restaurant, ...)
 * @param {number} referenceId - ID của đối tượng
 * @param {function} callback - Hàm callback nhận mảng URL ảnh
 */
export async function getAllImages(referenceType, referenceId, callback) {
    try {
        const response = await fetch(`${API_URL}/upload/reference/${referenceType}/${referenceId}`);
        
        if (!response.ok) {
            console.warn(`No images found for ${referenceType} with ID ${referenceId}`);
            callback([]);
            return;
        }
        
        const images = await response.json();
        callback(images.map(img => img.fullPath || img.path));
    } catch (error) {
        console.error('Error fetching images:', error);
        callback([]);
    }
}

/**
 * Hiển thị ảnh trong một phần tử HTML
 * @param {string} selector - CSS selector của phần tử
 * @param {string} referenceType - Loại đối tượng (Food, Restaurant, ...)
 * @param {number} referenceId - ID của đối tượng
 * @param {string} fallbackImage - Ảnh mặc định nếu không có ảnh
 */
export function displayImage(selector, referenceType, referenceId, fallbackImage = '../image/Combo_1.png') {
    const element = document.querySelector(selector);
    if (!element) {
        console.error(`Element not found: ${selector}`);
        return;
    }
    
    getMainImage(referenceType, referenceId, (imageUrl) => {
        if (element.tagName.toLowerCase() === 'img') {
            element.src = imageUrl;
        } else {
            element.style.backgroundImage = `url(${imageUrl})`;
        }
    }, fallbackImage);
}

/**
 * Upload ảnh lên server
 * @param {File} file - File ảnh
 * @param {string} referenceType - Loại đối tượng (Food, Restaurant, ...)
 * @param {number} referenceId - ID của đối tượng
 * @param {boolean} isMain - Có phải ảnh chính không
 * @param {function} callback - Callback nhận kết quả upload
 */
export async function uploadImage(file, referenceType, referenceId, isMain = false, callback) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('referenceType', referenceType);
        formData.append('referenceId', referenceId);
        formData.append('isMain', isMain ? '1' : '0');
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }
        
        callback(result);
    } catch (error) {
        console.error('Error uploading image:', error);
        callback({ success: false, error: error.message });
    }
}

/**
 * Xóa ảnh từ server
 * @param {number} imageId - ID ảnh cần xóa
 * @param {function} callback - Callback nhận kết quả xóa
 */
export async function deleteImage(imageId, callback) {
    try {
        const response = await fetch(`${API_URL}/upload/${imageId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Delete failed');
        }
        
        callback(result);
    } catch (error) {
        console.error('Error deleting image:', error);
        callback({ success: false, error: error.message });
    }
} 