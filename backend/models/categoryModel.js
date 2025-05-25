const sql = require('mssql');

// Lấy tất cả categories có phân trang
exports.getAllCategories = async (page = 1, limit = 4) => {
  const offset = (page - 1) * limit;
  const pool = await sql.connect();
  // Lấy tổng số lượng
  const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM Categories');
  const total = totalResult.recordset[0].total;
  // Lấy dữ liệu phân trang
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset)
    .query('SELECT id, name, description, status, products FROM Categories ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
  return { data: result.recordset, total };
};

// Thêm category mới
exports.createCategory = async (name, description = '', status = 'active', products = 0) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('status', sql.NVarChar, status)
    .input('products', sql.Int, parseInt(products) || 0)
    .query('INSERT INTO Categories (name, description, status, products) OUTPUT INSERTED.* VALUES (@name, @description, @status, @products)');
  return result.recordset[0];
};

// Xóa category theo id
exports.deleteCategory = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Categories WHERE id = @id');
  return result.rowsAffected[0] > 0;
};

// Cập nhật category theo id
exports.updateCategory = async (id, name, description, status, products) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('status', sql.NVarChar, status)
    .input('products', sql.Int, parseInt(products) || 0)
    .query('UPDATE Categories SET name = @name, description = @description, status = @status, products = @products WHERE id = @id');
  return result.rowsAffected[0] > 0;
}; 