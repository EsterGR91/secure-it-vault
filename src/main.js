// ===============================
// IMPORTACIONES PRINCIPALES
// ===============================

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Repositorios / servicios
const credentialsRepository = require('./db/credentials.repository');
const verificationRepository = require('./db/verification.repository'); // ← NUEVO

const { login } = require('./services/auth.service');


// ===============================
// VARIABLE TEMPORAL DE SESIÓN MFA
// (user pendiente de verificar código)
// ===============================
let pendingUserId = null; // ← NUEVO


// ===============================
// CONFIGURACIÓN GLOBAL DE ESCALADO
// ===============================
app.commandLine.appendSwitch("force-device-scale-factor", "1");


// ===============================
// CREACIÓN DE LA VENTANA PRINCIPAL
// ===============================
function createWindow() {

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      zoomFactor: 1
    }
  });

  win.webContents.setZoomFactor(1);

  // Inicia siempre en login
  win.loadFile(path.join(__dirname, 'renderer/login.html'));
}


// ===============================
// MANEJO DE EVENTOS IPC
// ===============================

/**
 * LOGIN
 * Valida usuario y contraseña.
 * Si es correcto, el servicio ya generó y envió el código MFA.
 * Aquí guardamos el userId para poder verificar el código luego.
 */
ipcMain.handle('login', async (event, username, password) => {
  try {

    const result = await login(username, password);

    // Guardamos el userId para el paso de verificación MFA
    pendingUserId = result.id; // ← NUEVO

    return result;

  } catch (error) {
    throw error;
  }
});


/**
 * VERIFY CODE (MFA)
 * Valida el código de verificación ingresado por el usuario.
 */
ipcMain.handle('verify-code', async (event, code) => {

  if (!pendingUserId) {
    return false;
  }

  const valid = await verificationRepository.verifyCode(pendingUserId, code);

  // Si fue válido limpiamos la variable
  if (valid) {
    pendingUserId = null;
  }

  return valid;
});


/**
 * LISTAR CREDENCIALES
 */
ipcMain.handle('list-credentials', async (event, vaultId) => {
  return await credentialsRepository.getCredentialsByVault(vaultId);
});


// ===============================
// INICIO DE LA APLICACIÓN
// ===============================
app.whenReady().then(createWindow);