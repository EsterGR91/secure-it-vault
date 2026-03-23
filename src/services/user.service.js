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

// Función para activar o desactivar un usuario
async function toggleUser(id, state){

  /*
    state:
      true  → usuario activo
      false → usuario inactivo
  */

  // PROTECCIÓN DEL ADMIN PRINCIPAL
  // Si el usuario es el ID 1 (admin principal) y se intenta desactivar,
  // lanzo un error para evitar que el sistema quede sin administrador.
  if(id === 1 && !state){
    throw new Error("No se puede desactivar el usuario administrador");
  }

  // Llamo al repositorio para actualizar el estado en base de datos
  const result = await userRepo.toggleUser(id, state);

  // Registro la acción en la tabla de auditoría
  // Dependiendo del estado, guardo si fue activación o desactivación
  await auditRepo.logAction(
    null, // luego se puede reemplazar por el usuario logueado
    state ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    `User ID ${id}`
  );

  // Devuelvo el resultado de la operación
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
// OBTENER USUARIO POR USERNAME (PARA ROLES)
// ===============================
/**
 * Obtiene el usuario desde la base de datos
 * incluyendo su rol, sin afectar el flujo de login.
 */
async function getUserByUsername(username){

  const user = await userRepo.findUserByUsername(username);

  if(!user){
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
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
  updatePassword,
  getUserByUsername
};