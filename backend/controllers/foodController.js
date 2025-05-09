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
      .query('SELECT * FROM Food ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  // Validate id là số nguyên hợp lệ
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id. Id must be a positive integer." });
  }
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .query('SELECT * FROM Food WHERE Id = @Id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const { Name, Price, category } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('Name', sql.NVarChar, Name)
      .input('Price', sql.Float, Price)
      .input('category', sql.NVarChar, category)
      .query('INSERT INTO Food (Name, Price, category) VALUES (@Name, @Price, @category)');
    res.status(201).json({ message: 'Food created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const { Name, Price, category } = req.body;
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('Name', sql.NVarChar, Name)
      .input('Price', sql.Float, Price)
      .input('category', sql.NVarChar, category)
      .query('UPDATE Food SET Name=@Name, Price=@Price, category=@category WHERE Id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Food updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Food WHERE Id=@Id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 