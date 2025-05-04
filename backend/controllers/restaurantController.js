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
      .query('SELECT * FROM Restaurant ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
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
      .query('SELECT * FROM Restaurant WHERE Id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { name, description, phone_number, opening_hours, status } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('phone_number', sql.NVarChar, phone_number)
      .input('opening_hours', sql.NVarChar, opening_hours)
      .input('status', sql.NVarChar, status)
      .query('INSERT INTO Restaurant (name, description, phone_number, opening_hours, status) VALUES (@name, @description, @phone_number, @opening_hours, @status)');
    res.status(201).json({ message: 'Restaurant created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { Name, Address, Phone } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar, Name)
      .input('Address', sql.NVarChar, Address)
      .input('Phone', sql.NVarChar, Phone)
      .query('UPDATE Restaurant SET Name=@Name, Address=@Address, Phone=@Phone WHERE Id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Restaurant updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pool = await sql.connect();
    // Xóa các đơn hàng liên quan đến nhà hàng này trước
    await pool.request()
      .input('id_NH', sql.Int, req.params.id)
      .query('DELETE FROM Orders WHERE id_NH=@id_NH');
    // Sau đó mới xóa nhà hàng
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Restaurant WHERE id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 