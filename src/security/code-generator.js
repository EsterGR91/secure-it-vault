function generateVerificationCode() {

  // Genera un número aleatorio entre 100000 y 999999
  // Esto garantiza que siempre sea un código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();

}

module.exports = { generateVerificationCode };
// Exporta la función para usarla en el flujo de verificación (login, registro, reset, etc.)