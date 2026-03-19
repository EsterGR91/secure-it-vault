const pool = require('./connection');
// Importo la conexión a la base de datos
// La utilizaré para registrar eventos en la tabla de auditoría

async function logAction(userId, action, target) {

  // Inserto un registro en la tabla audit_logs
  // user_id  → quién realizó la acción
  // action   → qué acción realizó (ej: LOGIN, CREATE_USER, DELETE_PASSWORD)
  // target   → sobre qué recurso se ejecutó la acción
  // ip_address → dirección desde donde se ejecutó (en este caso LOCAL)

  const sql = `
    INSERT INTO audit_logs (user_id, action, target, ip_address)
    VALUES (?, ?, ?, 'LOCAL')
  `;

  // Ejecuto la consulta usando parámetros preparados
  // Esto previene inyección SQL
  await pool.execute(sql, [userId, action, target]);
}

module.exports = { logAction };
// Exporto la función para poder registrar auditoría desde cualquier módulo