const sql = require('mssql');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const type = req.query.type || '';

  let where = 'WHERE 1=1';
  if (search) {
    where += ` AND (f.name LIKE N'%${search}%' OR f.description LIKE N'%${search}%')`;
  }
  if (category && category !== 'all') {
    where += ` AND f.category = N'${category}'`;
  }
  if (type && type !== 'all') {
    where += ` AND f.type = N'${type}'`;
  }

  const sqlCount = `SELECT COUNT(*) as total FROM Food f ${where}`;
  const sqlData = `
    SELECT f.*, i.filename, i.path
    FROM Food f
    LEFT JOIN images i ON f.image_id = i.id
    ${where}
    ORDER BY f.id
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  try {
    const pool = await sql.connect();
    const total = (await pool.request().query(sqlCount)).recordset[0].total;
    const result = await pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(sqlData);
    res.json({ products: result.recordset, total });
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
  console.log('Food create body:', req.body);
  try {
    const { name, description, price, category, status, type, image_id, sold_quantity } = req.body;
    if (!name || price == null || !category || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('price', sql.Float, parseFloat(price))
      .input('category', sql.NVarChar, category)
      .input('status', sql.NVarChar, status)
      .input('type', sql.NVarChar, type || '')
      .input('image_id', sql.Int, image_id ? parseInt(image_id) : null)
      .input('sold_quantity', sql.Int, sold_quantity ? parseInt(sold_quantity) : 0)
      .query('INSERT INTO Food (name, description, price, category, status, type, image_id, sold_quantity) VALUES (@name, @description, @price, @category, @status, @type, @image_id, @sold_quantity)');
    res.status(201).json({ message: 'Food created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  console.log('Food update body:', req.body);
  try {
    const { name, description, price, category, status, type, image_id, sold_quantity } = req.body;
    if (!name || price == null || !category || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('price', sql.Float, parseFloat(price))
      .input('category', sql.NVarChar, category)
      .input('status', sql.NVarChar, status)
      .input('type', sql.NVarChar, type || '')
      .input('image_id', sql.Int, image_id ? parseInt(image_id) : null)
      .input('sold_quantity', sql.Int, sold_quantity ? parseInt(sold_quantity) : 0)
      .query('UPDATE Food SET name=@name, description=@description, price=@price, category=@category, status=@status, type=@type, image_id=@image_id, sold_quantity=@sold_quantity WHERE Id=@Id');
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

exports.getTopProducts = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .query('SELECT TOP 4 * FROM Food ORDER BY sold_quantity DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 