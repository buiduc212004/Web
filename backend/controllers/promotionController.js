const sql = require('mssql');

// Helper: Tự động cập nhật status dựa vào ngày hiện tại
async function autoUpdatePromotionStatus(pool) {
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
  await pool.request().query(`
    UPDATE Promotions
    SET status =
      CASE
        WHEN endDate < '${today}' THEN 'expired'
        WHEN startDate > '${today}' THEN 'scheduled'
        ELSE 'active'
      END
  `);
}

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  const { status, search, fromDate, toDate } = req.query;
  try {
    const pool = await sql.connect();
    await autoUpdatePromotionStatus(pool);
    // Xây dựng query động
    let where = 'WHERE 1=1';
    if (status && status !== 'all') {
      where += ` AND status = @status`;
    }
    if (search) {
      where += ` AND (name LIKE @search OR status LIKE @search)`;
    }
    if (fromDate) {
      where += ` AND startDate >= @fromDate`;
    }
    if (toDate) {
      where += ` AND endDate <= @toDate`;
    }
    // Đếm tổng số lượng
    let countQuery = `SELECT COUNT(*) as total FROM Promotions ${where}`;
    let countRequest = pool.request();
    if (status && status !== 'all') countRequest.input('status', sql.NVarChar, status);
    if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
    if (fromDate) countRequest.input('fromDate', sql.Date, fromDate);
    if (toDate) countRequest.input('toDate', sql.Date, toDate);
    const totalResult = await countRequest.query(countQuery);
    const total = totalResult.recordset[0].total;
    // Lấy dữ liệu phân trang
    let dataQuery = `SELECT id, name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate FROM Promotions ${where} ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    let dataRequest = pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset);
    if (status && status !== 'all') dataRequest.input('status', sql.NVarChar, status);
    if (search) dataRequest.input('search', sql.NVarChar, `%${search}%`);
    if (fromDate) dataRequest.input('fromDate', sql.Date, fromDate);
    if (toDate) dataRequest.input('toDate', sql.Date, toDate);
    const result = await dataRequest.query(dataQuery);
    res.json({ promotions: result.recordset, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('SELECT id, name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate FROM Promotions WHERE Id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate } = req.body;
    if (!name || !discount_percentage || !min_order_value || !max_discount_amount || !status || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('discount_percentage', sql.Float, discount_percentage)
      .input('min_order_value', sql.Float, min_order_value)
      .input('max_discount_amount', sql.Float, max_discount_amount)
      .input('status', sql.NVarChar, status)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query('INSERT INTO Promotions (name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate) OUTPUT INSERTED.* VALUES (@name, @discount_percentage, @min_order_value, @max_discount_amount, @status, @startDate, @endDate)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate } = req.body;
    if (!name || !discount_percentage || !min_order_value || !max_discount_amount || !status || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('discount_percentage', sql.Float, discount_percentage)
      .input('min_order_value', sql.Float, min_order_value)
      .input('max_discount_amount', sql.Float, max_discount_amount)
      .input('status', sql.NVarChar, status)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query('UPDATE Promotions SET name=@name, discount_percentage=@discount_percentage, min_order_value=@min_order_value, max_discount_amount=@max_discount_amount, status=@status, startDate=@startDate, endDate=@endDate WHERE id=@id');
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