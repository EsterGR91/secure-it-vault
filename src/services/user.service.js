const { hashPassword } = require('../security/hash'); // Función para encriptar contraseñas
const userRepo = require('../db/users.repository');   // Repositorio de usuarios (acceso a BD)

async function registerUser({ username, email, password, role }) {
  // Encripta la contraseña antes de guardarla
  const passwordHash = await hashPassword(password);

  // Crea el usuario en la base de datos
  const userId = await userRepo.createUser({
    username,
    email,
    passwordHash,
    role
  });

  // Retorna el ID del usuario creado
  return userId;
}

module.exports = {
  registerUser
}; // Exporta la función de registro
