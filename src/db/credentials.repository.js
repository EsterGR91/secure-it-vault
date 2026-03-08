const pool = require('./connection');
// Conexión a la base de datos

const { encrypt, decrypt } = require('../security/crypto');
// Funciones de cifrado y descifrado AES-256-GCM


/**
 * Crear credencial
 * Cifra todos los datos sensibles antes de almacenarlos
 */
async function createCredential({
  vaultId,
  folderId,
  title,
  username,
  password,
  url,
  notes,
  createdBy
}) {

  // Cifro cada campo sensible de forma independiente
  // Cada uno tendrá su propio IV y authTag
  const encryptedUsername = encrypt(username);
  const encryptedPassword = encrypt(password);
  const encryptedUrl = encrypt(url || '');
  const encryptedNotes = encrypt(notes || '');

  const sql = `
    INSERT INTO credentials
    (vault_id, folder_id, title,

     username_enc, username_iv, username_auth_tag,

     password_enc, password_iv, password_auth_tag,

     url_enc, url_iv, url_auth_tag,

     notes_enc, notes_iv, notes_auth_tag,

     created_by)

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Inserto en BD los datos cifrados junto con su IV y authTag
  const [result] = await pool.execute(sql, [
    vaultId,
    folderId,
    title,

    encryptedUsername.encryptedData,
    encryptedUsername.iv,
    encryptedUsername.authTag,

    encryptedPassword.encryptedData,
    encryptedPassword.iv,
    encryptedPassword.authTag,

    encryptedUrl.encryptedData,
    encryptedUrl.iv,
    encryptedUrl.authTag,

    encryptedNotes.encryptedData,
    encryptedNotes.iv,
    encryptedNotes.authTag,

    createdBy
  ]);

  // Retorno el ID de la credencial creada
  return result.insertId;
}


/**
 * Obtener credencial por ID
 * Descifra los campos sensibles antes de retornarlos
 */
async function getCredentialById(id) {

  const sql = `SELECT * FROM credentials WHERE id = ?`;
  const [rows] = await pool.execute(sql, [id]);

  if (!rows[0]) return null; // Si no existe la credencial

  const row = rows[0];

  // Descifro cada campo usando su propio IV y authTag
  return {
    id: row.id,
    title: row.title,

    username: decrypt(
      row.username_enc,
      row.username_iv,
      row.username_auth_tag
    ),

    password: decrypt(
      row.password_enc,
      row.password_iv,
      row.password_auth_tag
    ),

    url: decrypt(
      row.url_enc,
      row.url_iv,
      row.url_auth_tag
    ),

    notes: decrypt(
      row.notes_enc,
      row.notes_iv,
      row.notes_auth_tag
    )
  };
}


/**
 * Listar credenciales por Vault
 * NO descifra datos sensibles
 * Solo devuelve metadata para mostrar en el listado
 */
async function getCredentialsByVault(vaultId) {

  const sql = `
    SELECT id, title, created_at
    FROM credentials
    WHERE vault_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await pool.execute(sql, [vaultId]);

  return rows; // Solo información básica
}


/**
 * Eliminar credencial por ID
 * Borra el registro de la base de datos
 */
async function deleteCredential(id) {

  const sql = `DELETE FROM credentials WHERE id = ?`;
  // Ejecuta la eliminación usando el ID como parámetro

  const [result] = await pool.execute(sql, [id]);

  // Retorna true si se eliminó al menos un registro
  return result.affectedRows > 0;
}

/**
 * Actualizar credencial
 * Vuelve a cifrar los campos sensibles antes de guardarlos
 */
async function updateCredential(id, {
  title,
  username,
  password,
  url,
  notes
}) {

  // Cifro nuevamente cada campo sensible
  // Cada actualización genera nuevo IV y authTag
  const encryptedUsername = encrypt(username);
  const encryptedPassword = encrypt(password);
  const encryptedUrl = encrypt(url || '');
  const encryptedNotes = encrypt(notes || '');

  const sql = `
    UPDATE credentials SET
      title = ?,

      username_enc = ?, username_iv = ?, username_auth_tag = ?,

      password_enc = ?, password_iv = ?, password_auth_tag = ?,

      url_enc = ?, url_iv = ?, url_auth_tag = ?,

      notes_enc = ?, notes_iv = ?, notes_auth_tag = ?,

      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?
  `;

  // Ejecuta la actualización en la base de datos
  const [result] = await pool.execute(sql, [

    title,

    encryptedUsername.encryptedData,
    encryptedUsername.iv,
    encryptedUsername.authTag,

    encryptedPassword.encryptedData,
    encryptedPassword.iv,
    encryptedPassword.authTag,

    encryptedUrl.encryptedData,
    encryptedUrl.iv,
    encryptedUrl.authTag,

    encryptedNotes.encryptedData,
    encryptedNotes.iv,
    encryptedNotes.authTag,

    id
  ]);

  // Retorna true si se actualizó al menos un registro
  return result.affectedRows > 0;
}


module.exports = {
  createCredential,
  getCredentialById,
  getCredentialsByVault,
  updateCredential,
  deleteCredential
};