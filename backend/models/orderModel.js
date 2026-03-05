const sql = require('mssql');

exports.getAll = async (limit, offset) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset)
    .query('SELECT id, id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time FROM Orders ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
  return result.recordset;
};

exports.getById = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT id, id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time FROM Orders WHERE id = @Id');
  return result.recordset[0] || null;
};

exports.create = async ({ id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time }) => {
  const pool = await sql.connect();
  await pool.request()
    .input('id_KH', sql.Int, parseInt(id_KH))
    .input('id_NH', sql.Int, parseInt(id_NH))
    .input('id_PROMO', sql.Int, id_PROMO ? parseInt(id_PROMO) : null)
    .input('category', sql.NVarChar, category)
    .input('total_price', sql.Float, parseFloat(total_price))
    .input('order_status', sql.NVarChar, order_status)
    .input('date', sql.Date, date)
    .input('time', sql.VarChar, time)
    .query('INSERT INTO Orders (id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time) VALUES (@id_KH, @id_NH, @id_PROMO, @category, @total_price, @order_status, @date, @time)');
};

exports.update = async (id, { id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .input('id_KH', sql.Int, parseInt(id_KH))
    .input('id_NH', sql.Int, parseInt(id_NH))
    .input('id_PROMO', sql.Int, id_PROMO ? parseInt(id_PROMO) : null)
    .input('category', sql.NVarChar, category)
    .input('total_price', sql.Float, parseFloat(total_price))
    .input('order_status', sql.NVarChar, order_status)
    .input('date', sql.Date, date)
    .input('time', sql.VarChar, time)
    .query('UPDATE Orders SET id_KH=@id_KH, id_NH=@id_NH, id_PROMO=@id_PROMO, category=@category, total_price=@total_price, order_status=@order_status, date=@date, time=@time WHERE id=@Id');
  return result.rowsAffected[0];
};

exports.delete = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Orders WHERE id=@Id');
  return result.rowsAffected[0];
};
