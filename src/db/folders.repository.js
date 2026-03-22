// ===============================
// IMPORTACIÓN DE CONEXIÓN
// ===============================
const pool = require('./connection');


/*
  Este archivo maneja el acceso directo a la tabla folders
  NO contiene lógica de negocio, solo SQL
*/


// ===============================
// CREAR FOLDER
// ===============================
async function createFolder({ name, description, vault_id, created_by }){

  const [result] = await pool.execute(`
    INSERT INTO folders (name, description, vault_id, created_by)
    VALUES (?, ?, ?, ?)
  `, [name, description, vault_id, created_by]);

  return result.insertId;
}


// ===============================
// OBTENER FOLDERS POR VAULT
// ===============================
async function getFoldersByVault(vaultId){

  const [rows] = await pool.execute(`
    SELECT *
    FROM folders
    WHERE vault_id = ?
    ORDER BY created_at DESC
  `, [vaultId]);

  return rows;
}


// ===============================
// ACTUALIZAR FOLDER
// ===============================
async function updateFolder(id, { name, description }){

  const [result] = await pool.execute(`
    UPDATE folders
    SET name = ?, description = ?
    WHERE id = ?
  `, [name, description, id]);

  return result.affectedRows > 0;
}


// ===============================
// ELIMINAR FOLDER
// ===============================
async function deleteFolder(id){

  const [result] = await pool.execute(`
    DELETE FROM folders
    WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}


// ===============================
module.exports = {
  createFolder,
  getFoldersByVault,
  updateFolder,
  deleteFolder
};