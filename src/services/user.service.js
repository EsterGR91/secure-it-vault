// ===============================
// IMPORTACIONES
// ===============================

//  Función para generar hash seguro de contraseñas (Argon2)
const { hashPassword } = require('../security/hash');

//  Repositorio de usuarios (acceso directo a DB)
const userRepo = require('../db/users.repository');

//  Repositorio de auditoría (registro de acciones)
const auditRepo = require('../db/audit.repository');


// ===============================
// CREAR USUARIO
// ===============================

/**
 * =====================================================
 * CREA UN NUEVO USUARIO EN EL SISTEMA
 * =====================================================
 * - Hashea la contraseña
 * - Inserta en la base de datos
 * - Registra la acción en auditoría
 */
async function createUser(data, currentUserId) {

  // 1 Generar hash seguro de la contraseña
  const passwordHash = await hashPassword(data.password);

  // 2 Crear usuario en DB
  const id = await userRepo.createUser({
    username: data.username,
    email: data.email,
    passwordHash,
    role: data.role
  });

  // 3 Registrar acción en auditoría
  await auditRepo.logAction(
    currentUserId,
    "CREATE_USER",
    `User ID ${id}`
  );

  // 4 Retornar ID del usuario creado
  return id;
}


// ===============================
// ACTUALIZAR USUARIO
// ===============================

/**
 * =====================================================
 * ACTUALIZA DATOS DE UN USUARIO
 * =====================================================
 */
async function updateUser(id, data, currentUserId) {

  // Actualiza información en DB
  await userRepo.updateUser(id, data);

  // Registrar en auditoría
  await auditRepo.logAction(
    currentUserId,
    "UPDATE_USER",
    `User ID ${id}`
  );

}


// ===============================
// ELIMINAR USUARIO
// ===============================

/**
 * =====================================================
 * ELIMINA UN USUARIO DEL SISTEMA
 * =====================================================
 */
async function deleteUser(id, currentUserId) {

  // Elimina usuario en DB
  await userRepo.deleteUser(id);

  // Registrar en auditoría
  await auditRepo.logAction(
    currentUserId,
    "DELETE_USER",
    `User ID ${id}`
  );

}


// ===============================
// OBTENER USUARIOS
// ===============================

/**
 * =====================================================
 * RETORNA TODOS LOS USUARIOS
 * =====================================================
 */
async function getUsers() {

  return await userRepo.getAllUsers();

}


// ===============================
//  ACTUALIZAR PASSWORD (NUEVO)
// ===============================

/**
 * =====================================================
 * ACTUALIZA LA CONTRASEÑA DE UN USUARIO
 * =====================================================
 * - Genera hash seguro
 * - Actualiza en DB
 * - Registra auditoría
 */
async function updatePassword(id, password, currentUserId) {

  // 1️⃣ Generar hash
  const passwordHash = await hashPassword(password);

  // 2️⃣ Actualizar en DB
  await userRepo.updatePassword(id, passwordHash);

  // 3️⃣ Registrar auditoría
  await auditRepo.logAction(
    currentUserId,
    "UPDATE_PASSWORD",
    `User ID ${id}`
  );

  return true;
}


// ===============================
// EXPORTACIONES
// ===============================

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  updatePassword 
};