const { contextBridge, ipcRenderer } = require('electron');

/*
  Este archivo actúa como una capa segura entre el frontend (renderer)
  y el backend (main process), exponiendo únicamente funciones controladas
  mediante el objeto global "window.api".

  Se utiliza ipcRenderer.invoke para comunicación asincrónica segura.
*/

contextBridge.exposeInMainWorld('api', {

  /**
   * =====================================================
   * LOGIN
   * =====================================================
   * Permite autenticar al usuario en el sistema
   */
  login: (username, password) =>
    ipcRenderer.invoke('login', username, password),


  /**
   * =====================================================
   * USERS
   * =====================================================
   * Gestión completa de usuarios del sistema
   */
  getUsersFull: (showInactive = false) =>
    ipcRenderer.invoke('users:get', showInactive),

  createUser: (data) =>
    ipcRenderer.invoke('users:create', data),

  updateUser: (id, data) =>
    ipcRenderer.invoke('users:update', id, data),

  deleteUser: (id) =>
    ipcRenderer.invoke('users:delete', id),

  toggleUser: (id, state) =>
    ipcRenderer.invoke('toggle-user', id, state),

  updateUserPassword: (id, pass) =>
    ipcRenderer.invoke('updateUserPassword', id, pass),

  


  /**
   * =====================================================
   * MFA (MULTI FACTOR AUTHENTICATION)
   * =====================================================
   * Validación de códigos de verificación
   */
  verifyCode: (code) =>
    ipcRenderer.invoke('verify-code', code),


  /**
   * =====================================================
   * CREDENCIALES
   * =====================================================
   * Gestión de credenciales dentro de los vaults
   */
  listCredentials: (vaultId) =>
    ipcRenderer.invoke('list-credentials', vaultId),

  getCredentials: (vaultId) =>
    ipcRenderer.invoke('credentials:get', vaultId),

  getCredential: (id) =>
    ipcRenderer.invoke('credentials:getOne', id),

  createCredential: (data) =>
    ipcRenderer.invoke('credentials:create', data),

  updateCredential: (id, data) =>
    ipcRenderer.invoke('credentials:update', id, data),

  deleteCredential: (id) =>
    ipcRenderer.invoke('credentials:delete', id),

  copyToClipboard: (text) =>
    ipcRenderer.invoke("copy-to-clipboard", text),


  /**
   * =====================================================
   * PASSWORD
   * =====================================================
   * Recuperación y restablecimiento de contraseñas
   */
  recoverPassword: (userInput) =>
    ipcRenderer.invoke('recover-password', userInput),

  resetPassword: (password) =>
    ipcRenderer.invoke('reset-password', password),


  /**
   * =====================================================
   * VAULTS
   * =====================================================
   * Gestión de bóvedas seguras
   */
  getVaults: () =>
    ipcRenderer.invoke('vaults:get'),

  createVault: (data) =>
    ipcRenderer.invoke('vaults:create', data),

  updateVault: (id, data) =>
    ipcRenderer.invoke('vaults:update', id, data),

  deleteVault: (id) =>
    ipcRenderer.invoke('vaults:delete', id),


  /**
   * =====================================================
   * AUDIT LOGS
   * =====================================================
   * Obtención de registros de auditoría del sistema
   */
  getAuditLogs: () =>
    ipcRenderer.invoke('audit:get'),


  /**
   * =====================================================
   * FOLDERS
   * =====================================================
   * Gestión de carpetas dentro de cada vault
   * Este módulo permite organizar las credenciales
   */
  getFoldersByVault: (vaultId) =>
    ipcRenderer.invoke('folders:get', vaultId),

  createFolder: (data) =>
    ipcRenderer.invoke('folders:create', data),

  updateFolder: (data) =>
    ipcRenderer.invoke('folders:update', data),

  deleteFolder: (id) =>
    ipcRenderer.invoke('folders:delete', id),




// ===============================
// DOCUMENTS - FUNCIONES EXPUESTAS AL FRONTEND
// ===============================

// Obtiene todos los documentos de un vault específico
// Envía el vaultId al proceso principal mediante IPC
getDocuments: (vaultId)=>
  ipcRenderer.invoke('documents:get', vaultId),

// Crea un nuevo documento
// Envía al main los datos necesarios (vaultId, título, archivo, etc.)
createDocument: (data)=>
  ipcRenderer.invoke('documents:create', data),

// Obtiene un documento específico por su ID
getDocument: (id)=>
  ipcRenderer.invoke('documents:getOne', id),

// Elimina un documento por su ID
// El proceso principal se encargará también de registrar auditoría
deleteDocument: (id)=>
  ipcRenderer.invoke('documents:delete', id),

// Obtiene un usuario por username vía IPC
getUserByUsername: (username) =>
  ipcRenderer.invoke('users:getByUsername', username),

});