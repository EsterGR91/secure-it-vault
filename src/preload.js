const { contextBridge, ipcRenderer } = require('electron');

// Expone funciones seguras al frontend
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
   * USERS - OBTENER LISTA
   * =====================================================
   * showInactive:
   *   true  → trae todos
   *   false → solo activos
   */
  getUsersFull: (showInactive = false) =>
    ipcRenderer.invoke('users:get', showInactive),


  /**
   * =====================================================
   * USERS - CREAR
   * =====================================================
   */
  createUser: (data) =>
    ipcRenderer.invoke('users:create', data),


  /**
   * =====================================================
   * USERS - ACTUALIZAR
   * =====================================================
   */
  updateUser: (id, data) =>
    ipcRenderer.invoke('users:update', id, data),


  /**
   * =====================================================
   * USERS - ELIMINAR (SOFT DELETE)
   * =====================================================
   */
  deleteUser: (id) =>
    ipcRenderer.invoke('users:delete', id),


  /**
   * =====================================================
   * USERS - ACTIVAR / DESACTIVAR
   * =====================================================
   * Llama al handler "toggle-user" en main.js
   */
  toggleUser: (id, state) =>
    ipcRenderer.invoke('toggle-user', id, state),


  /**
   * =====================================================
   * ACTUALIZAR PASSWORD (ADMIN)
   * =====================================================
   */
  updateUserPassword: (id, pass) =>
    ipcRenderer.invoke('updateUserPassword', id, pass),


  /**
   * =====================================================
   * MFA
   * =====================================================
   */
  verifyCode: (code) =>
    ipcRenderer.invoke('verify-code', code),


  /**
   * =====================================================
   * CREDENCIALES
   * =====================================================
   */
  listCredentials: (vaultId) =>
    ipcRenderer.invoke('list-credentials', vaultId),


  /**
   * =====================================================
   * RECUPERAR PASSWORD
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