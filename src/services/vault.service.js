// ===============================
// IMPORTACIONES
// ===============================
const vaultRepo = require('../db/vaults.repository');
const auditRepo = require('../db/audit.repository');


// ===============================
// CREAR VAULT
// ===============================
async function createVault(data, currentUserId){

  const id = await vaultRepo.createVault({
    name: data.name,
    description: data.description,
    createdBy: currentUserId
  });

  // auditoría
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
module.exports = {
  createVault,
  getVaults
};