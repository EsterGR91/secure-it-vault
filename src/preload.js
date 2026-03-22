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
   * USERS
   * =====================================================
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
   */
  recoverPassword: (userInput) =>
    ipcRenderer.invoke('recover-password', userInput),

  resetPassword: (password) =>
    ipcRenderer.invoke('reset-password', password),

  /**
   * =====================================================
   * VAULTS
   * =====================================================
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
   * AUDIT LOGS (ESTA ES LA CORRECCIÓN)
   * =====================================================
   */
  getAuditLogs: () =>
    ipcRenderer.invoke('audit:get')

});