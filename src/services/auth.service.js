// =====================================================
// IMPORTACIONES
// =====================================================

// Conexión a base de datos
const pool = require('../db/connection');

// Librería para verificar contraseñas
const argon2 = require('argon2');

// Generador de códigos MFA
const { generateVerificationCode } = require('../security/code-generator');

// Servicio de envío de correo
const { sendVerificationEmail } = require('../security/email');

// Repositorio de códigos de verificación
const verificationRepository = require('../db/verification.repository');


// =====================================================
// LOGIN CON MFA
// =====================================================

async function login(username, password) {

  console.log("Usuario ingresado:", username);
  console.log("Password ingresada:", password);

  // Busca el usuario en la base de datos
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  // Si el usuario no existe
  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = rows[0];

  console.log("Hash en DB:", user.password_hash);

  // Verifica contraseña usando Argon2
  const validPassword = await argon2.verify(
    user.password_hash,
    password
  );

  if (!validPassword) {
    throw new Error("Contraseña incorrecta");
  }

  // =====================================================
  // GENERACIÓN DE CÓDIGO MFA
  // =====================================================

  const code = generateVerificationCode();

  console.log("Código generado:", code);

  // Guarda código en DB
  await verificationRepository.saveCode(user.id, code);

  // Envía correo al usuario
  await sendVerificationEmail(user.email, code);

  return {
    id: user.id,
    username: user.username,
    mfa_required: true
  };
}


// =====================================================
// RECUPERACIÓN DE CONTRASEÑA
// =====================================================

async function recoverPassword(userInput){

  console.log("Solicitud de recuperación:", userInput);

  // =====================================================
  // BUSCA USUARIO POR USERNAME O EMAIL
  // =====================================================

  const [rows] = await pool.execute(
    `SELECT * FROM users 
     WHERE username = ? 
     OR email = ?
     LIMIT 1`,
    [userInput, userInput]
  );

  // Si no existe usuario
  if(rows.length === 0){
    throw new Error("Usuario no encontrado");
  }

  const user = rows[0];

  console.log("Usuario encontrado:", user.username);


  // =====================================================
  // GENERA CÓDIGO DE RECUPERACIÓN
  // =====================================================

  const code = generateVerificationCode();

  console.log("Código recuperación:", code);


  // Guarda código en base de datos
  await verificationRepository.saveCode(user.id, code);


  // Envía correo al usuario
  await sendVerificationEmail(user.email, code);


  // Devuelve resultado al frontend
  return {
    success: true,
    userId: user.id
  };

}


// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
  login,
  recoverPassword
};