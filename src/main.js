const { app, BrowserWindow, ipcMain } = require('electron'); 
// Importa los módulos principales de Electron
const path = require('path'); 
// Manejo de rutas de archivos
const { login } = require('./services/auth.service'); 
// Servicio de autenticación

function createWindow() {
  // Crea la ventana principal de la aplicación
  const win = new BrowserWindow({
    width: 400,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') // Archivo preload para comunicación segura
    }
  });

  // Carga la pantalla de login
  win.loadFile(path.join(__dirname, 'renderer/login.html'));
}

// Maneja el evento de login desde el frontend
ipcMain.handle('login', async (event, { username, password }) => {
  try {
    // Llama al servicio de autenticación
    return await login(username, password);
  } catch (err) {
    // Retorna el mensaje de error al frontend
    throw new Error(err.message);
  }
});

// Inicializa la aplicación cuando Electron está listo
app.whenReady().then(createWindow);
