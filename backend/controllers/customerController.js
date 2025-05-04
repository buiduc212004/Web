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
      .query('SELECT id, name, phone_number, address, role FROM Customer ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
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
      .query('SELECT id, name, phone_number, address, role FROM Customer WHERE id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { name, phone_number, address } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('phone_number', sql.NVarChar, phone_number)
      .input('address', sql.NVarChar, address)
      .query('UPDATE Customer SET name=@name, phone_number=@phone_number, address=@address WHERE id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Customer WHERE Id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 