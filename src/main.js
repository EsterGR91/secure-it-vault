// ===============================
// IMPORTACIONES PRINCIPALES
// ===============================

const { app, BrowserWindow, ipcMain } = require('electron');
// Importa los módulos principales de Electron

const path = require('path');
// Permite construir rutas seguras y compatibles con cualquier sistema operativo

const credentialsRepository = require('./db/credentials.repository');
// Importa el repositorio encargado de interactuar con la base de datos



// ===============================
// CONFIGURACIÓN GLOBAL DE ESCALADO
// ===============================

// Fuerza el factor de escala a 1 para evitar diferencias
// de ancho causadas por escalado de Windows (125%, 150%, etc.)
app.commandLine.appendSwitch("force-device-scale-factor", "1");



// ===============================
// CREACIÓN DE VENTANA PRINCIPAL
// ===============================

function createWindow() {

  // Crea la ventana principal de la aplicación
  const win = new BrowserWindow({
    width: 1000,
    height: 700,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Archivo preload que expone APIs seguras al frontend

      contextIsolation: true,
      // Aísla el contexto del renderer para mayor seguridad

      nodeIntegration: false,
      // Evita que el frontend tenga acceso directo a Node.js

      zoomFactor: 1
      // Fuerza el zoom interno del renderer a 100%
    }
  });

  // Refuerza el zoom en 100%
  win.webContents.setZoomFactor(1);

  // 🔥 CAMBIO IMPORTANTE 🔥
  // Antes se estaba cargando index.html.
  // Ahora se carga login.html, que es el archivo que estoy editando.
  win.loadFile(path.join(__dirname, 'renderer/login.html'));

}



// ===============================
// MANEJO DE EVENTOS IPC
// ===============================

// Maneja la solicitud del renderer para listar credenciales
ipcMain.handle('list-credentials', async (event, vaultId) => {

  return await credentialsRepository.getCredentialsByVault(vaultId);

});



// ===============================
// INICIO DE LA APLICACIÓN
// ===============================

// Inicia la aplicación cuando Electron está listo
app.whenReady().then(createWindow);