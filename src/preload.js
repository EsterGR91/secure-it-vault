const { contextBridge, ipcRenderer } = require('electron');
// Permite comunicar el frontend con el proceso principal de forma segura

contextBridge.exposeInMainWorld('api', {

  /**
   * =====================================================
   * LOGIN
   * =====================================================
   */
  login: (username, password) =>
    ipcRenderer.invoke('login', username, password),

  /**
   * =====================================================
   * USERS (MÉTODO SIMPLE QUE YA TENÍAS)
   * =====================================================
   */
  getUsers: () =>
    ipcRenderer.invoke('get-users'),

  /**
   * =====================================================
   * 🔥 USERS (CRUD COMPLETO - NUEVO)
   * =====================================================
   */

  // Obtener lista completa desde el nuevo servicio
  getUsersFull: () =>
    ipcRenderer.invoke('users:get'),

  // Crear usuario
  createUser: (data) =>
    ipcRenderer.invoke('users:create', data),

  // Actualizar usuario
  updateUser: (id, data) =>
    ipcRenderer.invoke('users:update', id, data),

  // Eliminar usuario
  deleteUser: (id) =>
    ipcRenderer.invoke('users:delete', id),

  /**
   * =====================================================
   * 🔐 ACTUALIZAR PASSWORD DE USUARIO (NUEVO)
   * =====================================================
   * Permite cambiar la contraseña de un usuario específico
   * desde el dashboard o panel admin
   */
  updateUserPassword: (id, pass) =>
    ipcRenderer.invoke('updateUserPassword', id, pass),

  /**
   * =====================================================
   * VERIFICACIÓN MFA
   * =====================================================
   */
  verifyCode: (code) =>
    ipcRenderer.invoke('verify-code', code),

  /**
   * =====================================================
   * LISTAR CREDENCIALES
   * =====================================================
   */
  listCredentials: (vaultId) =>
    ipcRenderer.invoke('list-credentials', vaultId),

  /**
   * =====================================================
   * RECUPERAR CONTRASEÑA
   * =====================================================
   */
  recoverPassword: (userInput) =>
    ipcRenderer.invoke('recover-password', userInput),

  /**
   * =====================================================
   * RESET PASSWORD
   * =====================================================
   */
  resetPassword: (password) =>
    ipcRenderer.invoke('reset-password', password)

});