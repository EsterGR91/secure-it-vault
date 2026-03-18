// ===============================
// IMPORTACIONES PRINCIPALES
// ===============================

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


// ===============================
// IMPORTACIÓN DE REPOSITORIOS
// ===============================

const credentialsRepository = require('./db/credentials.repository');
const verificationRepository = require('./db/verification.repository');


// ===============================
// IMPORTACIÓN DE SERVICIOS
// ===============================

const { login } = require('./services/auth.service');


// ===============================
// IMPORTACIÓN DE UTILIDADES
// ===============================

const pool = require('./db/connection');
const { generateVerificationCode } = require('./security/code-generator');
const { sendVerificationEmail } = require('./security/email');

// IMPORTAMOS HASH DE CONTRASEÑA
const { hashPassword } = require('./security/hash');


// ===============================
// VARIABLE TEMPORAL DE SESIÓN MFA
// ===============================

let pendingUserId = null;


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

  win.loadFile(path.join(__dirname, 'renderer/login.html'));

}


// ===============================
// LOGIN
// ===============================

ipcMain.handle('login', async (event, username, password) => {

  try {

    const result = await login(username, password);

    // Guardamos el usuario para MFA
    pendingUserId = result.id;

    return result;

  } catch (error) {

    console.error("Error login:", error.message);
    throw error;

  }

});


// ===============================
// VERIFY CODE (MFA)
// ===============================

ipcMain.handle('verify-code', async (event, code) => {

  if (!pendingUserId) {
    return false;
  }

  const valid = await verificationRepository.verifyCode(
    pendingUserId,
    code
  );

  if (valid) {
    pendingUserId = null;
  }

  return valid;

});


// ===============================
// RECOVER PASSWORD
// ===============================

ipcMain.handle('recover-password', async (event, userInput) => {

  try {

    console.log("Input recibido:", userInput);

    const [rows] = await pool.execute(

      "SELECT * FROM secure_it_vault.users WHERE username = ? OR email = ? LIMIT 1",

      [userInput, userInput]

    );

    console.log("Resultado DB:", rows);

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    const user = rows[0];

    if (!user.email) {
      throw new Error("User has no email registered");
    }

    const code = generateVerificationCode();

    console.log("Código recuperación generado:", code);

    await verificationRepository.saveCode(user.id, code);

    await sendVerificationEmail(user.email, code);

    pendingUserId = user.id;

    return true;

  } catch (error) {

    console.error("Error recuperación:", error.message);
    throw error;

  }

});


// ===============================
// RESET PASSWORD
// ===============================

ipcMain.handle('reset-password', async (event, password) => {

  /**
   * =====================================================
   * ACTUALIZA LA CONTRASEÑA DEL USUARIO
   * =====================================================
   * Este proceso ocurre después de que el usuario:
   * 1. solicitó recuperación
   * 2. verificó el código MFA
   * =====================================================
   */

  try{

    if(!pendingUserId){
      throw new Error("No user session");
    }

    // Genera hash seguro de la nueva contraseña
    const hash = await hashPassword(password);

    // Actualiza contraseña en DB
    await pool.execute(

      "UPDATE secure_it_vault.users SET password_hash = ? WHERE id = ?",

      [hash, pendingUserId]

    );

    // Limpia sesión temporal
    pendingUserId = null;

    console.log("Password actualizada correctamente");

    return true;

  }catch(error){

    console.error("Error actualizando password:", error.message);
    throw error;

  }

});


// ===============================
// LISTAR CREDENCIALES
// ===============================

ipcMain.handle('list-credentials', async (event, vaultId) => {

  return await credentialsRepository.getCredentialsByVault(vaultId);

});


// ===============================
// INICIO DE LA APP
// ===============================

app.whenReady().then(createWindow);