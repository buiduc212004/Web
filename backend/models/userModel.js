const sql = require('mssql');
const bcrypt = require('bcryptjs');

exports.createUser = async (name, phone_number, password, address, role = 'user') => {
  const hashed = await bcrypt.hash(password, 10);
  const pool = await sql.connect();
  await pool.request()
    .input('name', sql.NVarChar, name)
    .input('phone_number', sql.NVarChar, phone_number)
    .input('password', sql.NVarChar, hashed)
    .input('address', sql.NVarChar, address)
    .input('role', sql.NVarChar, role)
    .query('INSERT INTO Customer (name, phone_number, password, address, role) VALUES (@name, @phone_number, @password, @address, @role)');
};

exports.findUserByPhone = async (phone_number) => {
  const pool = await sql.connect();
  const result = await pool.request()
    .input('phone_number', sql.NVarChar, phone_number)
    .query('SELECT * FROM Customer WHERE phone_number = @phone_number');
  return result.recordset[0];
}; 