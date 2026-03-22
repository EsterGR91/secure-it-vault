// ===============================
// IMPORTACIONES PRINCIPALES
// ===============================
const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');


// ===============================
// IMPORTACIÓN DE REPOSITORIOS
// ===============================
const credentialsRepository = require('./db/credentials.repository');
const verificationRepository = require('./db/verification.repository');
const auditRepo = require('./db/audit.repository');


// ===============================
// IMPORTACIÓN DE SERVICIOS
// ===============================
const { login } = require('./services/auth.service');
const userService = require('./services/user.service');
const vaultService = require('./services/vault.service');
const credentialsService = require('./services/credentials.service');


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
// CREAR VENTANA
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
// MFA
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
// TOGGLE USER
// ===============================
ipcMain.handle("toggle-user", async (event, id, state) => {

  console.log("Toggle usuario:", id, state);

  return await userService.toggleUser(id, state);
});


// ===============================
// RESET PASSWORD
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
// USERS
// ===============================
ipcMain.handle('users:get', async (e, showInactive) => {
  return await userService.getUsers(showInactive);
});

ipcMain.handle('users:create', async (e, data) => {

  if (!currentUserId) currentUserId = 1;

  return await userService.createUser(data, currentUserId);
});

ipcMain.handle('users:update', async (e, id, data) => {
  return await userService.updateUser(id, data, currentUserId);
});

ipcMain.handle('users:delete', async (e, id) => {
  return await userService.deleteUser(id, currentUserId);
});

ipcMain.handle('updateUserPassword', async (e, id, pass) => {

  const hashedPassword = await hashPassword(pass);

  await pool.execute(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [hashedPassword, id]
  );

  return true;
});


// ===============================
// VAULTS
// ===============================
ipcMain.handle('vaults:get', async () => {

  if (!currentUserId) return [];

  return await vaultService.getVaults(currentUserId);
});

ipcMain.handle('vaults:create', async (event, data) => {

  if (!currentUserId) throw new Error("No session");

  return await vaultService.createVault(data, currentUserId);
});

ipcMain.handle('vaults:update', async (event, id, data) => {

  if (!currentUserId) throw new Error("No session");

  return await vaultService.updateVault(id, data, currentUserId);
});

ipcMain.handle('vaults:delete', async (event, id) => {

  if (!currentUserId) throw new Error("No session");

  return await vaultService.deleteVault(id, currentUserId);
});


// ===============================
// CREDENTIALS
// ===============================
ipcMain.handle('credentials:get', async (e, vaultId) => {
  return await credentialsService.getCredentials(vaultId);
});

ipcMain.handle('credentials:getOne', async (e, id) => {
  return await credentialsService.getCredential(id);
});

ipcMain.handle('credentials:create', async (e, data) => {
  return await credentialsService.createCredential(data, currentUserId);
});

ipcMain.handle('credentials:update', async (e, id, data) => {
  return await credentialsService.updateCredential(id, data, currentUserId);
});

ipcMain.handle('credentials:delete', async (e, id) => {
  return await credentialsService.deleteCredential(id, currentUserId);
});


// ===============================
// COPY CLIPBOARD
// ===============================
ipcMain.handle("copy-to-clipboard", (_, text) => {

  clipboard.writeText(text);

  return true;
});


// ===============================
// AUDITORÍA (MEJORA SEGURA)
// ===============================
ipcMain.handle('audit:get', async () => {

  try {

    const logs = await auditRepo.getAuditLogs();

    console.log("Logs enviados al frontend:", logs); // debug controlado

    return logs || [];

  } catch (error) {

    console.error("Error en audit:get:", error);

    return []; 

  }
});


// ===============================
// INICIO APP
// ===============================
app.whenReady().then(createWindow);