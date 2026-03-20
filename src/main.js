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
const userService = require('./services/user.service');


// ===============================
// UTILIDADES
// ===============================
const pool = require('./db/connection');
const { generateVerificationCode } = require('./security/code-generator');
const { sendVerificationEmail } = require('./security/email');
const { hashPassword } = require('./security/hash');


// ===============================
// VARIABLES DE SESIÓN
// ===============================
let pendingUserId = null;
let currentUserId = null;


// ===============================
// CONFIGURACIÓN GLOBAL
// ===============================
app.commandLine.appendSwitch("force-device-scale-factor", "1");


// ===============================
// CREAR VENTANA PRINCIPAL
// ===============================
function createWindow() {

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer/login.html'));
}


// ===============================
// LOGIN
// ===============================
ipcMain.handle('login', async (event, username, password) => {

  const result = await login(username, password);

  pendingUserId = result.id;
  currentUserId = result.id;

  console.log("Usuario logueado:", currentUserId);

  return result;
});


// ===============================
// MFA - VERIFICACIÓN DE CÓDIGO
// ===============================
ipcMain.handle('verify-code', async (event, code) => {

  if (!pendingUserId) return false;

  const valid = await verificationRepository.verifyCode(pendingUserId, code);

  if (valid) pendingUserId = null;

  return valid;
});


// ===============================
// RECUPERAR PASSWORD
// ===============================
ipcMain.handle('recover-password', async (event, userInput) => {

  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
    [userInput, userInput]
  );

  if (rows.length === 0) throw new Error("User not found");

  const user = rows[0];

  const code = generateVerificationCode();

  await verificationRepository.saveCode(user.id, code);
  await sendVerificationEmail(user.email, code);

  pendingUserId = user.id;

  return true;
});


// ===============================
// TOGGLE USUARIO (ACTIVAR / DESACTIVAR)
// ===============================
ipcMain.handle("toggle-user", async (event, id, state) => {

  /*
    Este handler recibe la solicitud desde el frontend
    y delega la lógica al service (arquitectura correcta).
    Evita acceso directo a base de datos desde aquí.
  */

  console.log("Toggle usuario:", id, state);

  return await userService.toggleUser(id, state);
});


// ===============================
// RESET PASSWORD (RECUPERACIÓN)
// ===============================
ipcMain.handle('reset-password', async (event, password) => {

  if (!pendingUserId) throw new Error("No user session");

  const hash = await hashPassword(password);

  await pool.execute(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [hash, pendingUserId]
  );

  pendingUserId = null;

  return true;
});


// ===============================
// USERS - LISTAR
// ===============================
ipcMain.handle('users:get', async (e, showInactive) => {

  /*
    showInactive = true  → trae todos
    showInactive = false → solo activos
  */

  return await userService.getUsers(showInactive);
});


// ===============================
// USERS - CREAR
// ===============================
ipcMain.handle('users:create', async (e, data) => {

  if (!currentUserId) {
    console.warn("No hay usuario en sesión");
    currentUserId = 1;
  }

  return await userService.createUser(data, currentUserId);
});


// ===============================
// USERS - ACTUALIZAR
// ===============================
ipcMain.handle('users:update', async (e, id, data) => {

  return await userService.updateUser(id, data, currentUserId);
});


// ===============================
// USERS - ELIMINAR (SOFT DELETE)
// ===============================
ipcMain.handle('users:delete', async (e, id) => {

  console.log("Desactivando usuario:", id);

  return await userService.deleteUser(id, currentUserId);
});


// ===============================
// ACTUALIZAR PASSWORD (ADMIN)
// ===============================
ipcMain.handle('updateUserPassword', async (e, id, pass) => {

  const hashedPassword = await hashPassword(pass);

  await pool.execute(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [hashedPassword, id]
  );

  return true;
});


// ===============================
// INICIALIZACIÓN DE LA APP
// ===============================
app.whenReady().then(createWindow);