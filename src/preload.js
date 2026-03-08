const { contextBridge, ipcRenderer } = require('electron');
// Importa herramientas para comunicación segura entre renderer y main

contextBridge.exposeInMainWorld('api', {

  // Solicita al proceso principal la lista de credenciales
  // Usa IPC para mantener separación entre frontend y backend
  listCredentials: (vaultId) => 
    ipcRenderer.invoke('list-credentials', vaultId),

});