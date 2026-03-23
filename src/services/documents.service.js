// Importo el repositorio de documentos
const docRepo = require('../db/documents.repository');

// Importo el repositorio de auditoría para registrar acciones
const auditRepo = require('../db/audit.repository');


/* ======================================
   CREAR DOCUMENTO
====================================== */
async function createDocument(data, userId){

  // Llamo al repositorio para guardar el documento en base de datos
  // Se almacena el vault al que pertenece, título, archivo (buffer)
  // y el usuario que lo creó
  const id = await docRepo.createDocument({
    vaultId: data.vaultId,
    title: data.title,
    fileBuffer: data.file,
    createdBy: userId
  });

  // Registro la acción en auditoría
  await auditRepo.logAction(
    userId,
    "CREATE_DOCUMENT",
    `Document ID ${id}`
  );

  // Retorno el ID generado
  return id;
}


/* ======================================
   LISTAR DOCUMENTOS POR VAULT
====================================== */
async function getDocuments(vaultId){

  // Obtengo todos los documentos asociados a un vault específico
  return await docRepo.getDocumentsByVault(vaultId);
}


/* ======================================
   OBTENER DOCUMENTO POR ID
====================================== */
async function getDocument(id){

  // Devuelvo la información completa de un documento específico
  return await docRepo.getDocumentById(id);
}


/* ======================================
   ELIMINAR DOCUMENTO
====================================== */
async function deleteDocument(id, userId){

  // Elimino el documento desde el repositorio
  const result = await docRepo.deleteDocument(id);

  // Registro la acción en auditoría
  await auditRepo.logAction(
    userId,
    "DELETE_DOCUMENT",
    `Document ID ${id}`
  );

  return result;
}


/* ======================================
   EXPORTACIÓN DE FUNCIONES
====================================== */
module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  deleteDocument
};

async function getDocument(id){
  return await docRepo.getDocumentById(id);
}


async function deleteDocument(id, userId){

  const result = await docRepo.deleteDocument(id);

  await auditRepo.logAction(
    userId,
    "DELETE_DOCUMENT",
    `Document ID ${id}`
  );

  return result;
}


module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  deleteDocument
};