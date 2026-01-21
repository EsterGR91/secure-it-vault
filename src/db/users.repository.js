const pool = require('./connection'); // Importa el pool de conexión a la base de datos

async function createUser({ username, email, passwordHash, role = 'user' }) {
  // Consulta SQL para insertar un nuevo usuario
  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;

  // Ejecuta la consulta con parámetros para evitar SQL Injection
  const [result] = await pool.execute(sql, [
    username,
    email,
    passwordHash,
    role
  ]);

  // Retorna el ID del usuario creado
  return result.insertId;
}

async function findUserByUsername(username) {
  // Consulta SQL para buscar un usuario activo por su username
  const sql = `
    SELECT * FROM users
    WHERE username = ? AND is_active = 1
  `;

  // Ejecuta la consulta y retorna el primer resultado
  const [rows] = await pool.execute(sql, [username]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  updateLastLogin
}; // Exporta las funciones del modelo de usuarios

async function updateLastLogin(userId) {
  // Consulta SQL para actualizar la fecha y hora del último inicio de sesión
  const sql = `
    UPDATE users
    SET last_login = NOW()
    WHERE id = ?
  `;

  // Ejecuta la actualización usando el ID del usuario
  await pool.execute(sql, [userId]);
}
