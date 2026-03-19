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

// Servicio de autenticación (login)
const { login } = require('./services/auth.service');

// Servicio de usuarios (CRUD + lógica)
const userService = require('./services/user.service');


// ===============================
// IMPORTACIÓN DE UTILIDADES
// ===============================

const pool = require('./db/connection');
const { generateVerificationCode } = require('./security/code-generator');
const { sendVerificationEmail } = require('./security/email');
const { hashPassword } = require('./security/hash');


// ===============================
// VARIABLES DE SESIÓN
// ===============================

// Usuario pendiente para MFA
let pendingUserId = null;

// Usuario autenticado actual
let currentUserId = 1;


// ===============================
// CONFIGURACIÓN GLOBAL
// ===============================

app.commandLine.appendSwitch("force-device-scale-factor", "1");


// ===============================
// CREAR VENTANA
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

    pendingUserId = result.id;
    currentUserId = result.id;

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

  if (!pendingUserId) return false;

  const valid = await verificationRepository.verifyCode(
    pendingUserId,
    code
  );

  if (valid) pendingUserId = null;

  return valid;

});


// ===============================
// RECUPERACIÓN PASSWORD
// ===============================

ipcMain.handle('recover-password', async (event, userInput) => {

  try {

    const [rows] = await pool.execute(
      "SELECT * FROM secure_it_vault.users WHERE username = ? OR email = ? LIMIT 1",
      [userInput, userInput]
    );

    if (rows.length === 0) throw new Error("User not found");

    const user = rows[0];

    const code = generateVerificationCode();

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

  try{

    if(!pendingUserId) throw new Error("No user session");

    const hash = await hashPassword(password);

    await pool.execute(
      "UPDATE secure_it_vault.users SET password_hash = ? WHERE id = ?",
      [hash, pendingUserId]
    );

    pendingUserId = null;

    return true;

  }catch(error){

    console.error("Error reset password:", error.message);
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
// USERS - LISTAR
// ===============================

ipcMain.handle('get-users', async () => {

  const [rows] = await pool.execute(`
    SELECT id, username, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return rows;

});


// ===============================
// USERS - CRUD
// ===============================

ipcMain.handle('users:get', async () => {

  return await userService.getUsers();

});

ipcMain.handle('users:create', async (e, data) => {

  return await userService.createUser(data, currentUserId);

});

ipcMain.handle('users:update', async (e, id, data) => {

  return await userService.updateUser(id, data, currentUserId);

});


/* =========================================================
    DELETE USER (CORREGIDO Y DEBUG)
========================================================= */
ipcMain.handle('users:delete', async (e, id) => {

  try {

    console.log(" DELETE recibido en backend:", id);

    // Ejecuta delete en el servicio
    const result = await userService.deleteUser(id, currentUserId);

    console.log("Resultado delete:", result);

    //  IMPORTANTE: devolver algo al frontend
    return result || true;

  } catch (error) {

    console.error("Error eliminando usuario:", error.message);
    throw error;

  }

});


// ===============================
// UPDATE PASSWORD ADMIN
// ===============================

ipcMain.handle('updateUserPassword', async (e, id, pass) => {

  try{

    const hashedPassword = await hashPassword(pass);

    await pool.execute(
      "UPDATE secure_it_vault.users SET password_hash = ? WHERE id = ?",
      [hashedPassword, id]
    );

    return true;

  }catch(error){

    console.error("Error updateUserPassword:", error.message);
    throw error;

  }

});


// ===============================
// INICIO APP
// ===============================

app.whenReady().then(createWindow);