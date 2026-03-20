// ===============================
// IMPORTACIONES
// ===============================
const { hashPassword } = require('../security/hash');
const userRepo = require('../db/users.repository');
const auditRepo = require('../db/audit.repository');


// ===============================
// CREAR USUARIO
// ===============================
async function createUser(data, currentUserId) {

  const passwordHash = await hashPassword(data.password);

  const id = await userRepo.createUser({
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role
  });

  // Auditoría
  await auditRepo.logAction(
    currentUserId,
    "CREATE_USER",
    `User ID ${id}`
  );

  return id;
}


// ===============================
// ACTIVAR / DESACTIVAR USUARIO
// ===============================
async function toggleUser(id, state){

  /*
    Delega al repository
    state:
      true  → activo
      false → inactivo
  */

  const result = await userRepo.toggleUser(id, state);

  // Auditoría
  await auditRepo.logAction(
    null,
    state ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    `User ID ${id}`
  );

  return result;
}


// ===============================
// ACTUALIZAR USUARIO
// ===============================
async function updateUser(id, data, currentUserId) {

  const result = await userRepo.updateUser(id, data);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_USER",
    `User ID ${id}`
  );

  return result;
}


// ===============================
// OBTENER USUARIOS
// ===============================
async function getUsers(showInactive = false){

  /*
    showInactive = true  → todos
    showInactive = false → solo activos
  */

  if(showInactive){
    return await userRepo.getAllUsersRaw();
  }

  return await userRepo.getAllUsers();
}


// ===============================
// ELIMINAR USUARIO (SOFT DELETE)
// ===============================
async function deleteUser(id, currentUserId){

  const result = await userRepo.deleteUser(id);

  await auditRepo.logAction(
    currentUserId,
    "DEACTIVATE_USER",
    `User ID ${id}`
  );

  return result;
}


// ===============================
// ACTUALIZAR PASSWORD
// ===============================
async function updatePassword(id, password, currentUserId) {

  const passwordHash = await hashPassword(password);

  await userRepo.updatePassword(id, passwordHash);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_PASSWORD",
    `User ID ${id}`
  );

  return true;
}


// ===============================
// EXPORTS
// ===============================
module.exports = {
  createUser,
  toggleUser,
  updateUser,
  getUsers,
  deleteUser,
  updatePassword
};