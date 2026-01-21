const { contextBridge, ipcRenderer } = require('electron'); 
// Importa herramientas de Electron para comunicación segura entre frontend y backend

contextBridge.exposeInMainWorld('api', {
  // Expone la función login al frontend de forma segura
  login: (username, password) =>
    ipcRenderer.invoke('login', { username, password }) 
    // Envía las credenciales al proceso principal usando IPC
});
