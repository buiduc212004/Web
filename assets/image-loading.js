/**
 * Script tự động tạo ảnh loading và ảnh lỗi nếu chưa có
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ảnh loading ở dạng base64
  const loadingImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIiBjbGFzcz0ibGRzLXJvbGxpbmciIHN0eWxlPSJiYWNrZ3JvdW5kOiBub25lOyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA4OGNjIiBzdHJva2Utd2lkdGg9IjciIHI9IjM1IiBzdHJva2UtZGFzaGFycmF5PSIxNjQuOTMzNjE0MzEzNDY0MTUgNTYuOTc3ODcxNDM3ODIxMzgiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgZHVyPSIxcyIgdmFsdWVzPSIwIDUwIDUwOzM2MCA1MCA1MCIga2V5VGltZXM9IjA7MSI+PC9hbmltYXRlVHJhbnNmb3JtPjwvY2lyY2xlPjwvc3ZnPg==';
  
  // Ảnh lỗi ở dạng base64
  const errorImageBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjVmNWY1Ii8+PHBhdGggZD0iTTUwIDIwQzMzLjQzMTUgMjAgMjAgMzMuNDMxNSAyMCA1MEMyMCA2Ni41Njg1IDMzLjQzMTUgODAgNTAgODBDNjYuNTY4NSA4MCA4MCA2Ni41Njg1IDgwIDUwQzgwIDMzLjQzMTUgNjYuNTY4NSAyMCA1MCAyMFpNNDUgNjVMMzUgNTVMNDUgNDVMNDAgNDBMMzAgNTBMNDAgNjBMNDUgNjVaTTU1IDY1TDY1IDU1TDU1IDQ1TDYwIDQwTDcwIDUwTDYwIDYwTDU1IDY1WiIgZmlsbD0iI2ZmMzMzMyIvPjwvc3ZnPg==';
  
  // Kiểm tra và tạo ảnh loading
  checkAndCreateImage('../image/loading.png', loadingImageBase64);
  
  // Kiểm tra và tạo ảnh lỗi
  checkAndCreateImage('../image/error.png', errorImageBase64);
  
  /**
   * Kiểm tra xem ảnh có tồn tại không và tạo ảnh base64 nếu không
   * @param {string} src - Đường dẫn ảnh cần kiểm tra
   * @param {string} fallbackBase64 - Dữ liệu base64 nếu ảnh không tồn tại
   */
  function checkAndCreateImage(src, fallbackBase64) {
    const img = new Image();
    img.onerror = function() {
      console.log(`Image not found: ${src}, using base64 fallback`);
      replaceImagesWithBase64(src, fallbackBase64);
    };
    img.src = src;
  }
  
  /**
   * Thay thế tất cả đường dẫn ảnh bằng ảnh base64
   * @param {string} src - Đường dẫn ảnh cần thay thế
   * @param {string} base64 - Dữ liệu base64 để thay thế
   */
  function replaceImagesWithBase64(src, base64) {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.endsWith(src)) {
        img.src = base64;
      }
    });
    
    // Lưu vào localStorage để sử dụng sau này
    localStorage.setItem(src, base64);
  }
}); 