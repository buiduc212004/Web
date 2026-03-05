const sql = require('mssql');
const db = require('../config/db');

exports.setOthersNotMain = async (referenceType, referenceId) => {
  const pool = await sql.connect(db.config);
  await pool.request()
    .input('referenceType', sql.VarChar(50), referenceType)
    .input('referenceId', sql.Int, referenceId)
    .query('UPDATE dbo.Images SET is_main = 0 WHERE referenceType = @referenceType AND referenceId = @referenceId');
};

exports.save = async ({ filename, originalname, path, mimetype, size, referenceType, referenceId, isMain }) => {
  const pool = await sql.connect(db.config);
  const result = await pool.request()
    .input('filename', sql.VarChar(255), filename)
    .input('originalname', sql.VarChar(255), originalname)
    .input('path', sql.VarChar(500), path)
    .input('mimetype', sql.VarChar(100), mimetype)
    .input('size', sql.Int, size)
    .input('referenceType', sql.VarChar(50), referenceType)
    .input('referenceId', sql.Int, referenceId)
    .input('isMain', sql.Bit, isMain)
    .query(`
      INSERT INTO dbo.Images (filename, originalname, path, mimetype, size, referenceType, referenceId, uploadDate, is_main)
      VALUES (@filename, @originalname, @path, @mimetype, @size, @referenceType, @referenceId, GETDATE(), @isMain);
      SELECT SCOPE_IDENTITY() AS id;
    `);
  return result.recordset[0].id;
};

exports.findByReference = async (referenceType, referenceId) => {
  const pool = await sql.connect(db.config);
  const result = await pool.request()
    .input('referenceType', sql.VarChar(50), referenceType)
    .input('referenceId', sql.Int, referenceId)
    .query('SELECT * FROM dbo.Images WHERE referenceType = @referenceType AND referenceId = @referenceId ORDER BY is_main DESC, uploadDate DESC');
  return result.recordset;
};

exports.findMainByReference = async (referenceType, referenceId) => {
  const pool = await sql.connect(db.config);
  const mainResult = await pool.request()
    .input('referenceType', sql.VarChar(50), referenceType)
    .input('referenceId', sql.Int, referenceId)
    .query('SELECT TOP 1 * FROM dbo.Images WHERE referenceType = @referenceType AND referenceId = @referenceId AND is_main = 1 ORDER BY uploadDate DESC');

  if (mainResult.recordset.length > 0) return mainResult.recordset[0];

  const fallback = await pool.request()
    .input('referenceType', sql.VarChar(50), referenceType)
    .input('referenceId', sql.Int, referenceId)
    .query('SELECT TOP 1 * FROM dbo.Images WHERE referenceType = @referenceType AND referenceId = @referenceId ORDER BY uploadDate DESC');

  return fallback.recordset[0] || null;
};

exports.findById = async (id) => {
  const pool = await sql.connect(db.config);
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM dbo.Images WHERE id = @id');
  return result.recordset[0] || null;
};

exports.delete = async (id) => {
  const pool = await sql.connect(db.config);
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM dbo.Images WHERE id = @id');
};
