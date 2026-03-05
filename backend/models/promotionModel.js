const sql = require('mssql');

exports.autoUpdateStatus = async () => {
  const pool = await sql.connect();
  await pool.request().query(`
    UPDATE Promotions
    SET status =
      CASE
        WHEN endDate < CAST(GETDATE() AS DATE) THEN 'expired'
        WHEN startDate > CAST(GETDATE() AS DATE) THEN 'scheduled'
        ELSE 'active'
      END
  `);
};

exports.getAll = async (limit, offset, { status, search, fromDate, toDate } = {}) => {
  const pool = await sql.connect();

  let where = 'WHERE 1=1';
  if (status && status !== 'all') where += ' AND status = @status';
  if (search) where += ' AND (name LIKE @search OR status LIKE @search)';
  if (fromDate) where += ' AND startDate >= @fromDate';
  if (toDate) where += ' AND endDate <= @toDate';

  const addParams = (req) => {
    if (status && status !== 'all') req.input('status', sql.NVarChar, status);
    if (search) req.input('search', sql.NVarChar, `%${search}%`);
    if (fromDate) req.input('fromDate', sql.Date, fromDate);
    if (toDate) req.input('toDate', sql.Date, toDate);
    return req;
  };

  const countRequest = addParams(pool.request());
  const total = (await countRequest.query(`SELECT COUNT(*) as total FROM Promotions ${where}`)).recordset[0].total;

  const dataRequest = addParams(pool.request())
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset);
  const result = await dataRequest.query(`
    SELECT id, name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate
    FROM Promotions ${where}
    ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  return { promotions: result.recordset, total };
};

exports.getById = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT id, name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate FROM Promotions WHERE Id = @Id');
  return result.recordset[0] || null;
};

exports.create = async ({ name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('name', sql.NVarChar, name)
    .input('discount_percentage', sql.Float, parseFloat(discount_percentage))
    .input('min_order_value', sql.Float, parseFloat(min_order_value))
    .input('max_discount_amount', sql.Float, parseFloat(max_discount_amount))
    .input('status', sql.NVarChar, status)
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query('INSERT INTO Promotions (name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate) OUTPUT INSERTED.* VALUES (@name, @discount_percentage, @min_order_value, @max_discount_amount, @status, @startDate, @endDate)');
  return result.recordset[0];
};

exports.update = async (id, { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('discount_percentage', sql.Float, parseFloat(discount_percentage))
    .input('min_order_value', sql.Float, parseFloat(min_order_value))
    .input('max_discount_amount', sql.Float, parseFloat(max_discount_amount))
    .input('status', sql.NVarChar, status)
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query('UPDATE Promotions SET name=@name, discount_percentage=@discount_percentage, min_order_value=@min_order_value, max_discount_amount=@max_discount_amount, status=@status, startDate=@startDate, endDate=@endDate WHERE id=@id');
  return result.rowsAffected[0];
};

exports.delete = async (id) => {
  const pool = await sql.connect();
  await pool.request()
    .input('id_PROMO', sql.Int, id)
    .query('DELETE FROM Orders WHERE id_PROMO=@id_PROMO');
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Promotions WHERE id=@Id');
  return result.rowsAffected[0];
};
