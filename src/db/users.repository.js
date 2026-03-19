const pool = require('./connection');

// =======================
// EXISTENTES (NO BORRAR)
// =======================

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

async function findUserByUsername(username) {

  const sql = `
    SELECT * FROM users
    WHERE username = ? AND is_active = 1
  `;

  const [rows] = await pool.execute(sql, [username]);
  return rows[0];
}

async function updateLastLogin(userId) {

  const sql = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = ?
  `;

  await pool.execute(sql, [userId]);
}


// =======================
// NUEVAS FUNCIONES CRUD
// =======================

async function getAllUsers() {

  const [rows] = await pool.execute(`
    SELECT id, username, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return rows;
}

async function updateUser(id, { username, email, role }) {

  const [result] = await pool.execute(`
    UPDATE users
    SET username = ?, email = ?, role = ?
    WHERE id = ?
  `, [username, email, role, id]);

  return result.affectedRows > 0;
}

async function deleteUser(id) {

  const [result] = await pool.execute(`
    UPDATE users
    SET is_active = 0
    WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}

// =====================================================
// ACTUALIZAR PASSWORD
// =====================================================
async function updatePassword(id, passwordHash){

  const sql = `
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
  `;

  await pool.execute(sql, [passwordHash, id]);

}
// =======================
// EXPORTS
// =======================

module.exports = {
  createUser,
  findUserByUsername,
  updateLastLogin,
  updatePassword,  

  getAllUsers,
  updateUser,
  deleteUser
};