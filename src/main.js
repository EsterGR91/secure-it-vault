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

// Usuario pendiente para MFA (verificación por código)
let pendingUserId = null;

// Usuario autenticado actual (para auditoría)
let currentUserId = 1; // luego se conecta con login real


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

  // Asegura zoom fijo
  win.webContents.setZoomFactor(1);

  // Pantalla inicial
  win.loadFile(path.join(__dirname, 'renderer/login.html'));

}


// ===============================
// LOGIN
// ===============================

ipcMain.handle('login', async (event, username, password) => {

  try {

    const result = await login(username, password);

    // Guardamos usuario para MFA
    pendingUserId = result.id;

    // Guardamos usuario activo (para auditoría)
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
// RECUPERACIÓN DE CONTRASEÑA
// ===============================

ipcMain.handle('recover-password', async (event, userInput) => {

  try {

    console.log("Input recibido:", userInput);

    const [rows] = await pool.execute(
      "SELECT * FROM secure_it_vault.users WHERE username = ? OR email = ? LIMIT 1",
      [userInput, userInput]
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    const user = rows[0];

    if (!user.email) {
      throw new Error("User has no email registered");
    }

    // Genera código de verificación
    const code = generateVerificationCode();

    console.log("Código recuperación generado:", code);

    // Guarda código en DB
    await verificationRepository.saveCode(user.id, code);

    // Envía correo
    await sendVerificationEmail(user.email, code);

    // Guarda usuario temporal
    pendingUserId = user.id;

    return true;

  } catch (error) {

    console.error("Error recuperación:", error.message);
    throw error;

  }

});


// ===============================
// RESET PASSWORD (DESDE RECOVERY)
// ===============================

ipcMain.handle('reset-password', async (event, password) => {

  try{

    if(!pendingUserId){
      throw new Error("No user session");
    }

    // Hash seguro
    const hash = await hashPassword(password);

    // Actualización en DB
    await pool.execute(
      "UPDATE secure_it_vault.users SET password_hash = ? WHERE id = ?",
      [hash, pendingUserId]
    );

    // Limpiar sesión temporal
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
// USERS - LISTAR (SQL DIRECTO)
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
// USERS - CRUD COMPLETO (SERVICE)
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

ipcMain.handle('users:delete', async (e, id) => {

  return await userService.deleteUser(id, currentUserId);

});


// ===============================
//  UPDATE PASSWORD DESDE ADMIN
// ===============================

ipcMain.handle('updateUserPassword', async (e, id, pass) => {

  try{

    // Hash seguro
    const hashedPassword = await hashPassword(pass);

    // Update en DB
    await pool.execute(
      "UPDATE secure_it_vault.users SET password_hash = ? WHERE id = ?",
      [hashedPassword, id]
    );

    console.log("Password actualizada para usuario:", id);

    return true;

  }catch(error){

    console.error("Error updateUserPassword:", error.message);
    throw error;

  }

});


// ===============================
// INICIO DE LA APP
// ===============================

app.whenReady().then(createWindow);