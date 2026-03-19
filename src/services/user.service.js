// ===============================
// IMPORTACIONES
// ===============================
// Hash seguro de contraseñas
const { hashPassword } = require('../security/hash');

// Repositorio de usuarios
const userRepo = require('../db/users.repository');

// Auditoría
const auditRepo = require('../db/audit.repository');

//  IMPORTANTE: conexión DB 
const pool = require('../db/connection');


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

  await auditRepo.logAction(
    currentUserId,
    "CREATE_USER",
    `User ID ${id}`
  );

  return id;
}


// ===============================
// ACTUALIZAR USUARIO
// ===============================
async function updateUser(id, data, currentUserId) {

  await userRepo.updateUser(id, data);

  await auditRepo.logAction(
    currentUserId,
    "UPDATE_USER",
    `User ID ${id}`
  );
}


// ===============================
// ELIMINAR USUARIO (FIX REAL )
// ===============================
async function deleteUser(id, currentUserId){

  try {

    console.log("🔥 Eliminando usuario:", id);

    // 🔥 1. eliminar dependencias
    await pool.execute(
      "DELETE FROM secure_it_vault.email_verification_codes WHERE user_id = ?",
      [id]
    );

    // 🔥 2. eliminar usuario
    const [result] = await pool.execute(
      "DELETE FROM secure_it_vault.users WHERE id = ?",
      [id]
    );

    console.log("Resultado SQL:", result);

    if (result.affectedRows === 0) {
      throw new Error("Usuario no encontrado");
    }

    // 🔥 3. auditoría segura
    if(currentUserId){
      await auditRepo.logAction(
        currentUserId,
        "DELETE_USER",
        `User ID ${id}`
      );
    }

    return true;

  } catch (error){

    console.error("Error en deleteUser:", error.message);
    throw error;

  }
}

// ===============================
// OBTENER USUARIOS
// ===============================
async function getUsers() {

  return await userRepo.getAllUsers();

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
// EXPORTACIONES
// ===============================
module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  updatePassword 
};