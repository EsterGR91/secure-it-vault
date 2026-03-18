const { contextBridge, ipcRenderer } = require('electron');
// Permite comunicar el frontend con el proceso principal de forma segura

contextBridge.exposeInMainWorld('api', {

  /**
   * =====================================================
   * LOGIN
   * Envía el usuario y contraseña al proceso principal
   * =====================================================
   */
  login: (username, password) =>
    ipcRenderer.invoke('login', username, password),

  /**
 * =====================================================
 * USERS
 * Obtiene la lista de usuarios desde el backend
 * =====================================================
 */
getUsers: () =>
  ipcRenderer.invoke('get-users'),
  /**
   * =====================================================
   * VERIFICACIÓN MFA
   * Envía el código ingresado por el usuario
   * =====================================================
   */
  verifyCode: (code) =>
    ipcRenderer.invoke('verify-code', code),


  /**
   * =====================================================
   * LISTAR CREDENCIALES
   * Solicita al backend la lista de credenciales
   * almacenadas en un vault específico
   * =====================================================
   */
  listCredentials: (vaultId) =>
    ipcRenderer.invoke('list-credentials', vaultId),


  /**
   * =====================================================
   * RECUPERAR CONTRASEÑA
   * Envía username o email para iniciar
   * el proceso de recuperación
   * =====================================================
   */
  recoverPassword: (userInput) =>
    ipcRenderer.invoke('recover-password', userInput),


  /**
   * =====================================================
   * RESET PASSWORD
   * Envía la nueva contraseña al backend
   * para actualizarla en la base de datos
   * =====================================================
   */
  resetPassword: (password) =>
    ipcRenderer.invoke('reset-password', password)

});
