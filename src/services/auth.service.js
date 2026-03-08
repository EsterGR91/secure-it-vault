// Importa la conexión a la base de datos
const pool = require('../db/connection');

// Importa Argon2 para verificar contraseñas
const argon2 = require('argon2');

// Importa generador de códigos de verificación
const { generateVerificationCode } = require('../security/code-generator');

// Importa servicio de envío de correo
const { sendVerificationEmail } = require('../security/email');

// Importa funciones para guardar y validar códigos
const verificationRepository =  require('../db/verification.repository');


/**
 * Servicio de autenticación
 * Valida usuario y contraseña
 * Si son correctos genera un código MFA
 */
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

  // Si la contraseña es incorrecta
  if (!validPassword) {
    throw new Error("Contraseña incorrecta");
  }

  // =====================================================
  // MFA - GENERACIÓN DE CÓDIGO
  // =====================================================

  // Genera código de verificación de 6 dígitos
  const code = generateVerificationCode();

  console.log("Código generado:", code);

  // Guarda el código en base de datos
  await verificationRepository.saveCode(user.id, code);

  // Envía el código al correo del usuario
  await sendVerificationEmail(user.email, code);

  // Devuelve información mínima al frontend
  return {
    id: user.id,
    username: user.username,
    mfa_required: true
  };

}

// Exporta función login
module.exports = { login };