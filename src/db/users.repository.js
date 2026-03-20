// ===============================
// IMPORTACIÓN DE CONEXIÓN
// ===============================
const pool = require('./connection');


// ===============================
// CREAR USUARIO
// ===============================
async function createUser({ username, email, passwordHash, role = 'user' }) {

  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    username,
    email,
    passwordHash,
    role
  ]);

  return result.insertId;
}


// ===============================
// BUSCAR USUARIO POR USERNAME
// ===============================
async function findUserByUsername(username) {

  // Solo usuarios activos
  const sql = `
    SELECT * FROM users
    WHERE username = ? AND is_active = 1
  `;

  const [rows] = await pool.execute(sql, [username]);

  return rows[0];
}


// ===============================
// ACTUALIZAR ÚLTIMO LOGIN
// ===============================
async function updateLastLogin(userId) {

  const sql = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = ?
  `;

  await pool.execute(sql, [userId]);
}


// ===============================
// OBTENER TODOS (SIN FILTRO)
// ===============================
async function getAllUsersRaw(){

  const [rows] = await pool.execute(`
    SELECT id, username, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return rows;
}


// ===============================
// OBTENER TODOS LOS USUARIOS ACTIVOS
// ===============================
async function getAllUsers() {

  const [rows] = await pool.execute(`
    SELECT id, username, email, role, is_active, created_at
    FROM users
    WHERE is_active = 1
    ORDER BY created_at DESC
  `);

  return rows;
}


// ===============================
// ACTUALIZAR USUARIO
// ===============================
async function updateUser(id, { username, email, role }) {

  const [result] = await pool.execute(`
    UPDATE users
    SET username = ?, email = ?, role = ?
    WHERE id = ?
  `, [username, email, role, id]);

  return result.affectedRows > 0;
}


// ===============================
// SOFT DELETE (DESACTIVAR USUARIO)
// ===============================
async function deleteUser(id) {

  const [result] = await pool.execute(`
    UPDATE users
    SET is_active = 0
    WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}


// ===============================
//  ACTIVAR / DESACTIVAR USUARIO (NUEVO)
// ===============================
async function toggleUser(id, state){

  /*
    state:
    true  → activar (1)
    false → desactivar (0)
  */

  const [result] = await pool.execute(`
    UPDATE users
    SET is_active = ?
    WHERE id = ?
  `, [state ? 1 : 0, id]);

  return result.affectedRows > 0;
}


// ===============================
// ACTUALIZAR PASSWORD
// ===============================
async function updatePassword(id, passwordHash){

  const sql = `
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
  `;

  await pool.execute(sql, [passwordHash, id]);
}


// ===============================
// EXPORTACIONES
// ===============================
module.exports = {
  createUser,
  findUserByUsername,
  updateLastLogin,
  updatePassword,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllUsersRaw,
  toggleUser //
};