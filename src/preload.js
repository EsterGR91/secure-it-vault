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
   * USERS - ELIMINAR
   * =====================================================
   */
  deleteUser: (id) =>
    ipcRenderer.invoke('users:delete', id),


  /**
   * =====================================================
   * USERS - ACTIVAR / DESACTIVAR
   * =====================================================
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
    ipcRenderer.invoke('reset-password', password),


  /**
   * =====================================================
   * VAULTS (NUEVO - SOLO ESTO SE AGREGÓ)
   * =====================================================
   */

  // Obtener vaults
  getVaults: () =>
    ipcRenderer.invoke('vaults:get'),

  // Crear vault
  createVault: (data) =>
    ipcRenderer.invoke('vaults:create', data),

  // Actualizar vault
  updateVault: (id, data) =>
    ipcRenderer.invoke('vaults:update', id, data),

  // Eliminar vault
  deleteVault: (id) =>
    ipcRenderer.invoke('vaults:delete', id)

});