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
      .query('SELECT id, id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time FROM Orders ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
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
      .query('SELECT id, id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time FROM Orders WHERE id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  console.log('Order create body:', req.body);
  try {
    const { id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time } = req.body;
    if (!id_KH || !id_NH || !category || !total_price || !order_status || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    await pool.request()
      .input('id_KH', sql.Int, id_KH)
      .input('id_NH', sql.Int, id_NH)
      .input('id_PROMO', sql.Int, id_PROMO)
      .input('category', sql.NVarChar, category)
      .input('total_price', sql.Float, total_price)
      .input('order_status', sql.NVarChar, order_status)
      .input('date', sql.DateTime, date)
      .input('time', sql.DateTime, time)
      .query('INSERT INTO Orders (id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time) VALUES (@id_KH, @id_NH, @id_PROMO, @category, @total_price, @order_status, @date, @time)');
    res.status(201).json({ message: 'Order created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  console.log('Order update body:', req.body);
  try {
    const { id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time } = req.body;
    if (!id_KH || !id_NH || !category || !total_price || !order_status || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('id_KH', sql.Int, id_KH)
      .input('id_NH', sql.Int, id_NH)
      .input('id_PROMO', sql.Int, id_PROMO)
      .input('category', sql.NVarChar, category)
      .input('total_price', sql.Float, total_price)
      .input('order_status', sql.NVarChar, order_status)
      .input('date', sql.DateTime, date)
      .input('time', sql.DateTime, time)
      .query('UPDATE Orders SET id_KH=@id_KH, id_NH=@id_NH, id_PROMO=@id_PROMO, category=@category, total_price=@total_price, order_status=@order_status, date=@date, time=@time WHERE id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Orders WHERE id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 