// ===============================
// IMPORTACIONES
// ===============================
const folderRepo = require('../db/folders.repository');
const auditRepo = require('../db/audit.repository');


// ===============================
// CREAR FOLDER
// ===============================
async function createFolder(data, currentUserId){

  const id = await folderRepo.createFolder({
    name: data.name,
    description: data.description,
    vault_id: data.vault_id,
    created_by: currentUserId
  });

  await auditRepo.logAction(
    currentUserId,
    "CREATE_FOLDER",
    `Folder ID ${id}`
  );

  return id;
}


// ===============================
// OBTENER FOLDERS
// ===============================
async function getFoldersByVault(vaultId){

  return await folderRepo.getFoldersByVault(vaultId);
}


// ===============================
// ACTUALIZAR
// ===============================
async function updateFolder(id, data, currentUserId){

  const result = await folderRepo.updateFolder(id, data);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_FOLDER",
    `Folder ID ${id}`
  );

  return result;
}


// ===============================
// ELIMINAR
// ===============================
async function deleteFolder(id, currentUserId){

  const result = await folderRepo.deleteFolder(id);

  await auditRepo.logAction(
    currentUserId,
    "DELETE_FOLDER",
    `Folder ID ${id}`
  );

  return result;
}


// ===============================
module.exports = {
  createFolder,
  getFoldersByVault,
  updateFolder,
  deleteFolder
};