const userRepo = require('../db/users.repository'); // Repositorio de usuarios (acceso a BD)
const { verifyPassword } = require('../security/hash'); // Función para validar contraseñas

async function login(username, password) {
  // 1. Buscar el usuario activo por username
  const user = await userRepo.findUserByUsername(username);

  if (!user) {
    throw new Error('Usuario no encontrado'); // Usuario no existe o está inactivo
  }

  // 2. Verificar que la contraseña coincida con el hash almacenado
  const isValid = await verifyPassword(user.password_hash, password);

  if (!isValid) {
    throw new Error('Contraseña incorrecta'); // La contraseña no coincide
  }


  await userRepo.updateLastLogin(user.id);

  // 3. Retornar solo información segura del usuario
  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}

module.exports = {
  login
}; // Exporta la función de login
