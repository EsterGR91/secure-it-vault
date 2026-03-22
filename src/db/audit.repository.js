// ===============================
// IMPORTACIÓN DE CONEXIÓN
// ===============================
const pool = require('./connection');
// Se importa la conexión a la base de datos
// Se utiliza para ejecutar consultas SQL de forma segura


// ===============================
// REGISTRAR ACCIÓN EN AUDITORÍA
// ===============================
async function logAction(userId, action, target) {

  /*
    Esta función inserta un registro en la tabla audit_logs

    user_id   → quién realizó la acción
    action    → tipo de acción (LOGIN, CREATE_USER, etc.)
    target    → sobre qué recurso se ejecutó
    ip_address → en este caso se define como LOCAL
  */

  const sql = `
    INSERT INTO audit_logs (user_id, action, target, ip_address)
    VALUES (?, ?, ?, 'LOCAL')
  `;

  // Se ejecuta la consulta con parámetros preparados
  // Esto previene inyección SQL
  await pool.execute(sql, [userId, action, target]);
}


// ===============================
// OBTENER LOGS DE AUDITORÍA
// ===============================
async function getAuditLogs() {

  /*
    Esta función obtiene los registros de auditoría

    IMPORTANTE:
    - Se hace un LEFT JOIN con la tabla users
    - Esto permite obtener el username en lugar del user_id
    - No afecta la lógica existente, solo mejora la visualización
  */

  const sql = `
    SELECT 
      a.id,
      COALESCE(u.username, 'Sistema') AS user,
      a.action,
      a.target,
      a.ip_address,
      a.created_at
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
  `;

  // Se ejecuta la consulta
  const [rows] = await pool.execute(sql);

  // Se retornan los resultados al servicio o frontend
  return rows;
}


// ===============================
// EXPORTACIÓN
// ===============================
module.exports = {
  logAction,
  getAuditLogs
};
// Se exportan ambas funciones:
// - logAction → para registrar eventos
// - getAuditLogs → para visualizar auditoría