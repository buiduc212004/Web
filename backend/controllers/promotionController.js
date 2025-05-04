const sql = require('mssql');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query('SELECT * FROM Promotions ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('SELECT * FROM Promotions WHERE Id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, discount_percentage, min_order_value, max_discount_amount, status } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('discount_percentage', sql.Float, discount_percentage)
      .input('min_order_value', sql.Float, min_order_value)
      .input('max_discount_amount', sql.Float, max_discount_amount)
      .input('status', sql.NVarChar, status)
      .query('INSERT INTO Promotions (name, discount_percentage, min_order_value, max_discount_amount, status) VALUES (@name, @discount_percentage, @min_order_value, @max_discount_amount, @status)');
    res.status(201).json({ message: 'Promotion created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { Name, Discount, StartDate, EndDate } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar, Name)
      .input('Discount', sql.Float, Discount)
      .input('StartDate', sql.DateTime, StartDate)
      .input('EndDate', sql.DateTime, EndDate)
      .query('UPDATE Promotions SET Name=@Name, Discount=@Discount, StartDate=@StartDate, EndDate=@EndDate WHERE Id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Promotion updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pool = await sql.connect();
    // Xóa các đơn hàng liên quan đến promotion này trước
    await pool.request()
      .input('id_PROMO', sql.Int, req.params.id)
      .query('DELETE FROM Orders WHERE id_PROMO=@id_PROMO');
    // Sau đó mới xóa promotion
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Promotions WHERE id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 