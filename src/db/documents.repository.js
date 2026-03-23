// =====================================================
// IMPORTACIONES
// =====================================================

// Conexión a la base de datos
const pool = require('./connection');

// Funciones de cifrado
const { encrypt, decrypt } = require('../security/crypto');


// =====================================================
// CREAR DOCUMENTO (CIFRADO)
// =====================================================

/**
 * Guarda un documento cifrado en la base de datos.
 * Se convierte a base64 y se cifra con AES-256-GCM.
 * El authTag se concatena junto con los datos cifrados.
 */
async function createDocument({ vaultId, title, fileBuffer, createdBy }) {

  const buffer = Buffer.from(fileBuffer);

  const base64 = buffer.toString('base64');

  const encrypted = encrypt(base64);

  // Se guarda encryptedData + authTag juntos
  const combined = encrypted.encryptedData + ":" + encrypted.authTag;

  const [result] = await pool.execute(`
    INSERT INTO documents
    (vault_id, title, file_enc, iv, created_by)
    VALUES (?, ?, ?, ?, ?)
  `, [
    vaultId,
    title,
    combined,
    encrypted.iv,
    createdBy
  ]);

  return result.insertId;
}


// =====================================================
// OBTENER DOCUMENTOS POR VAULT
// =====================================================

async function getDocumentsByVault(vaultId){

  const [rows] = await pool.execute(`
    SELECT id, title, created_at
    FROM documents
    WHERE vault_id = ?
    ORDER BY created_at DESC
  `, [vaultId]);

  return rows;
}


// =====================================================
// OBTENER DOCUMENTO (DESCIFRADO)
// =====================================================

/**
 * Recupera y descifra el documento correctamente.
 */
async function getDocumentById(id){

  const [rows] = await pool.execute(`
    SELECT file_enc, iv FROM documents WHERE id = ?
  `, [id]);

  if(!rows[0]) return null;

  const doc = rows[0];

  // FIX IMPORTANTE: BLOB → STRING
  const fileEncString = doc.file_enc.toString();

  const parts = fileEncString.split(":");

  const encryptedData = parts[0];
  const authTag = parts[1];

  if(!encryptedData || !authTag){
    throw new Error("Datos cifrados incompletos");
  }

  const decrypted = decrypt(
    encryptedData,
    doc.iv,
    authTag
  );

  const buffer = Buffer.from(decrypted, 'base64');

  return Array.from(buffer);
}


// =====================================================
// ELIMINAR DOCUMENTO
// =====================================================

async function deleteDocument(id){

  const [result] = await pool.execute(`
    DELETE FROM documents WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
}


// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  createDocument,
  getDocumentsByVault,
  getDocumentById,
  deleteDocument
};