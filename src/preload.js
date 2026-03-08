const { contextBridge, ipcRenderer } = require('electron');
// Permite comunicar el frontend con el proceso principal de forma segura

contextBridge.exposeInMainWorld('api', {

  /**
   * LOGIN
   * Envía el usuario y contraseña al proceso principal
   */
  login: (username, password) =>
    ipcRenderer.invoke('login', username, password),

/*verificarcion de codigo */

  verifyCode: (code) =>
  ipcRenderer.invoke('verify-code', code),
  
  /**
   * LISTAR CREDENCIALES
   * Solicita al backend la lista de credenciales de un vault
   */
  listCredentials: (vaultId) =>
    ipcRenderer.invoke('list-credentials', vaultId),

});
