const pool = require('./connection');
// Importo la conexión a la base de datos para poder ejecutar consultas MySQL

async function saveCode(userId, code) {

  // Inserto el código de verificación en la tabla
  // Lo asocio al usuario y le establezco una expiración de 5 minutos
  const sql = `
  INSERT INTO email_verification_codes
  (user_id, code, expires_at)
  VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
  `;

  // Ejecuto la consulta enviando los parámetros de forma segura
  await pool.execute(sql, [userId, code]);

}

async function verifyCode(userId, code) {

  // Busco un código que:
  // - Pertenezca al usuario
  // - Coincida exactamente
  // - No haya sido usado
  // - No esté expirado
  const sql = `
  SELECT * FROM email_verification_codes
  WHERE user_id = ?
  AND code = ?
  AND used = FALSE
  AND expires_at > NOW()
  LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [userId, code]);

  // Si no encuentro un código válido, retorno false
  if (!rows[0]) return false;

  // Si el código es válido, lo marco como usado
  // Esto evita que pueda reutilizarse
  const updateSql = `
  UPDATE email_verification_codes
  SET used = TRUE
  WHERE id = ?
  `;

  await pool.execute(updateSql, [rows[0].id]);

  // Retorno true indicando que la verificación fue exitosa
  return true;
}

module.exports = {
  saveCode,
  verifyCode
};