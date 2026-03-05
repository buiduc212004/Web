const sql = require('mssql');

exports.getAll = async (limit, offset) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, offset)
    .query('SELECT * FROM Restaurant ORDER BY Id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
  return result.recordset;
};

exports.getById = async (id) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('SELECT * FROM Restaurant WHERE Id = @Id');
  return result.recordset[0] || null;
};

exports.create = async ({ name, description, phone_number, opening_hours, status }) => {
  const pool = await sql.connect();
  await pool.request()
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('phone_number', sql.NVarChar, phone_number)
    .input('opening_hours', sql.NVarChar, opening_hours)
    .input('status', sql.NVarChar, status)
    .query('INSERT INTO Restaurant (name, description, phone_number, opening_hours, status) VALUES (@name, @description, @phone_number, @opening_hours, @status)');
};

exports.update = async (id, { name, description, phone_number, opening_hours, status }) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('phone_number', sql.NVarChar, phone_number)
    .input('opening_hours', sql.NVarChar, opening_hours)
    .input('status', sql.NVarChar, status)
    .query('UPDATE Restaurant SET name=@name, description=@description, phone_number=@phone_number, opening_hours=@opening_hours, status=@status WHERE id=@id');
  return result.rowsAffected[0];
};

exports.delete = async (id) => {
  const pool = await sql.connect();
  await pool.request()
    .input('id_NH', sql.Int, id)
    .query('DELETE FROM Orders WHERE id_NH=@id_NH');
  const result = await pool.request()
    .input('Id', sql.Int, id)
    .query('DELETE FROM Restaurant WHERE id=@Id');
  return result.rowsAffected[0];
};
