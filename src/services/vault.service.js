// ===============================
// IMPORTACIONES (SIEMPRE ARRIBA)
// ===============================

const vaultRepo = require('../db/vaults.repository');
const auditRepo = require('../db/audit.repository');
const pool = require('../db/connection');

// DEBUG (después del require, no antes)
console.log("Funciones vaultRepo:", Object.keys(vaultRepo));


// ===============================
// CREAR VAULT
// ===============================
async function createVault(data, currentUserId){

  const id = await vaultRepo.createVault({
    name: data.name,
    description: data.description,
    createdBy: currentUserId
  });

  await pool.execute(`
    INSERT INTO vault_users (vault_id, user_id, access_level)
    VALUES (?, ?, 'admin')
  `, [id, currentUserId]);

  await auditRepo.logAction(
    currentUserId,
    "CREATE_VAULT",
    `Vault ID ${id}`
  );

  return id;
}


// ===============================
// OBTENER VAULTS
// ===============================
async function getVaults(userId){

  return await vaultRepo.getVaultsByUser(userId);

}


// ===============================
// ACTUALIZAR VAULT
// ===============================
async function updateVault(id, data, currentUserId){

  await vaultRepo.updateVault(id, data);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_VAULT",
    `Vault ID ${id}`
  );
}


// ===============================
// ELIMINAR VAULT
// ===============================
async function deleteVault(id, currentUserId){

  await vaultRepo.deleteVault(id);

  await auditRepo.logAction(
    currentUserId,
    "DELETE_VAULT",
    `Vault ID ${id}`
  );
}


// ===============================
module.exports = {
  createVault,
  getVaults,
  updateVault,
  deleteVault
};