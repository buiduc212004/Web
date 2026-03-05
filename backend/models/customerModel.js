const sql = require('mssql');

exports.getAll = async (limit, offset) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset)
    .query('SELECT id, name, phone_number, address, role FROM Customer ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
  return result.recordset;
};

exports.getById = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT id, name, phone_number, address, role FROM Customer WHERE id = @Id');
  return result.recordset[0] || null;
};

exports.update = async (id, { name, phone_number, address }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('phone_number', sql.NVarChar, phone_number)
    .input('address', sql.NVarChar, address)
    .query('UPDATE Customer SET name=@name, phone_number=@phone_number, address=@address WHERE id=@Id');
  return result.rowsAffected[0];
};

exports.delete = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Customer WHERE Id=@Id');
  return result.rowsAffected[0];
};
