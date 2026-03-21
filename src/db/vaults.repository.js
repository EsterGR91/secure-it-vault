// ===============================
// IMPORTAR CONEXIÓN
// ===============================
const pool = require('./connection');


// ===============================
// CREAR VAULT
// ===============================
async function createVault({ name, description, createdBy }){

  const sql = `
    INSERT INTO vaults (name, description, created_by)
    VALUES (?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    name,
    description,
    createdBy
  ]);

  return result.insertId;
}


// ===============================
// OBTENER VAULTS POR USUARIO
// ===============================
async function getVaultsByUser(userId){

  /*
    Trae vaults donde el usuario tenga acceso
    usando la tabla vault_users
  */

  const sql = `
    SELECT v.*
    FROM vaults v
    JOIN vault_users vu ON v.id = vu.vault_id
    WHERE vu.user_id = ?
    ORDER BY v.created_at DESC
  `;

  const [rows] = await pool.execute(sql, [userId]);

  return rows;
}


// ===============================
// EXPORTAR
// ===============================
module.exports = {
  createVault,
  getVaultsByUser
};