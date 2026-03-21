// ===============================
// IMPORTACIONES
// ===============================
const credentialsRepo = require('../db/credentials.repository');
const auditRepo = require('../db/audit.repository');


// ===============================
// CREAR CREDENCIAL
// ===============================
async function createCredential(data, currentUserId){

  const id = await credentialsRepo.createCredential({
    vaultId: data.vaultId,
    folderId: data.folderId || 1,
    title: data.title,
    username: data.username,
    password: data.password,
    url: data.url,
    notes: data.notes,
    createdBy: currentUserId
  });

  // Auditoría
  await auditRepo.logAction(
    currentUserId,
    "CREATE_CREDENTIAL",
    `Credential ID ${id}`
  );

  return id;
}


// ===============================
// LISTAR CREDENCIALES
// ===============================
async function getCredentials(vaultId){

  return await credentialsRepo.getCredentialsByVault(vaultId);

}


// ===============================
// OBTENER DETALLE (DESCIFRADO)
// ===============================
async function getCredential(id){

  return await credentialsRepo.getCredentialById(id);

}


// ===============================
// ACTUALIZAR
// ===============================
async function updateCredential(id, data, currentUserId){

  const result = await credentialsRepo.updateCredential(id, data);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_CREDENTIAL",
    `Credential ID ${id}`
  );

  return result;
}


// ===============================
// ELIMINAR
// ===============================
async function deleteCredential(id, currentUserId){

  const result = await credentialsRepo.deleteCredential(id);

  await auditRepo.logAction(
    currentUserId,
    "DELETE_CREDENTIAL",
    `Credential ID ${id}`
  );

  return result;
}


// ===============================
module.exports = {
  createCredential,
  getCredentials,
  getCredential,
  updateCredential,
  deleteCredential
};