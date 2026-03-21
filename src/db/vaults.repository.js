// ===============================
// IMPORTACIÓN DE CONEXIÓN
// ===============================
const pool = require('./connection');


/*
  Este archivo se encarga de TODO el acceso a la base de datos
  relacionado con la tabla vaults

  Aquí NO hay lógica de negocio, solo queries SQL
*/


// ===============================
// CREAR VAULT
// ===============================
async function createVault(data){

  const [result] = await pool.execute(
    `
    INSERT INTO vaults (name, description, created_by)
    VALUES (?, ?, ?)
    `,
    [data.name, data.description, data.createdBy]
  );

  // retorno el id generado
  return result.insertId;
}


// ===============================
// OBTENER VAULTS POR USUARIO
// ===============================
async function getVaultsByUser(userId){

  /*
    Trae solo los vaults a los que el usuario tiene acceso
    usando la tabla intermedia vault_users
  */

  const [rows] = await pool.execute(
    `
    SELECT v.*
    FROM vaults v
    INNER JOIN vault_users vu ON v.id = vu.vault_id
    WHERE vu.user_id = ?
    ORDER BY v.created_at DESC
    `,
    [userId]
  );

  return rows;
}


// ===============================
// ACTUALIZAR VAULT
// ===============================
async function updateVault(id, data){

  /*
    Permite actualizar nombre y descripción del vault
  */

  return pool.execute(
    `
    UPDATE vaults
    SET name = ?, description = ?
    WHERE id = ?
    `,
    [data.name, data.description, id]
  );
}


// ===============================
// ELIMINAR VAULT
// ===============================
async function deleteVault(id){

  /*
    Eliminación directa
    
  */

  return pool.execute(
    `
    DELETE FROM vaults
    WHERE id = ?
    `,
    [id]
  );
}


// ===============================
// EXPORTACIÓN
// ===============================
module.exports = {
  createVault,
  getVaultsByUser,
  updateVault,
  deleteVault
};