const sql = require('mssql');

exports.getAll = async (limit, offset, search, category, type) => {
  const pool = await sql.connect();
  const request = pool.request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset);

  let where = 'WHERE 1=1';
  if (search) {
    where += ' AND (f.name LIKE @search OR f.description LIKE @search)';
    request.input('search', sql.NVarChar, `%${search}%`);
  }
  if (category && category !== 'all') {
    where += ' AND f.category = @category';
    request.input('category', sql.NVarChar, category);
  }
  if (type && type !== 'all') {
    where += ' AND f.type = @type';
    request.input('type', sql.NVarChar, type);
  }

  const countRequest = pool.request();
  if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
  if (category && category !== 'all') countRequest.input('category', sql.NVarChar, category);
  if (type && type !== 'all') countRequest.input('type', sql.NVarChar, type);

  const total = (await countRequest.query(`SELECT COUNT(*) as total FROM Food f ${where}`)).recordset[0].total;

  const result = await request.query(`
    SELECT f.*, i.filename, i.path
    FROM Food f
    LEFT JOIN images i ON f.image_id = i.id
    ${where}
    ORDER BY f.id
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { products: result.recordset, total };
};

exports.getById = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT * FROM Food WHERE Id = @Id');
  return result.recordset[0] || null;
};

exports.create = async ({ name, description, price, category, status, type, image_id, sold_quantity }) => {
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
};

exports.update = async (id, { name, description, price, category, status, type, image_id, sold_quantity }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description || '')
    .input('price', sql.Float, parseFloat(price))
    .input('category', sql.NVarChar, category)
    .input('status', sql.NVarChar, status)
    .input('type', sql.NVarChar, type || '')
    .input('image_id', sql.Int, image_id ? parseInt(image_id) : null)
    .input('sold_quantity', sql.Int, sold_quantity ? parseInt(sold_quantity) : 0)
    .query('UPDATE Food SET name=@name, description=@description, price=@price, category=@category, status=@status, type=@type, image_id=@image_id, sold_quantity=@sold_quantity WHERE Id=@Id');
  return result.rowsAffected[0];
};

exports.delete = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Food WHERE Id=@Id');
  return result.rowsAffected[0];
};

exports.getTopProducts = async () => {
  const pool = await sql.connect();
  const result = await pool.request()
    .query('SELECT TOP 4 * FROM Food ORDER BY sold_quantity DESC');
  return result.recordset;
};
