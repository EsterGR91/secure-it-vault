const argon2 = require('argon2'); // Librería para encriptar y verificar contraseñas de forma segura

async function hashPassword(password) {
  // Genera el hash de la contraseña usando Argon2
  return await argon2.hash(password);
}

async function verifyPassword(hash, password) {
  // Verifica si la contraseña coincide con el hash almacenado
  return await argon2.verify(hash, password);
}

module.exports = {
  hashPassword,
  verifyPassword
}; // Exporta las funciones para usarlas en otros archivos
