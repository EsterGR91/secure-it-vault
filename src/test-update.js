require('dotenv').config();

const {
  updateCredential,
  getCredentialById
} = require('./db/credentials.repository');

async function test() {
  try {
    const updated = await updateCredential(3, {
      title: 'Sistema Contabilidad ACTUALIZADO',
      username: 'nuevo_admin',
      password: 'NuevaPass123!',
      url: 'https://empresa-update.local',
      notes: 'Cuenta actualizada'
    });

    console.log("¿Se actualizó?", updated);

    const credential = await getCredentialById(3);
    console.log("Credencial después del update:", credential);

  } catch (error) {
    console.error("Error:", error);
  }
}

test();