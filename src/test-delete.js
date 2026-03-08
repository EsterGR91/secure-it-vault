require('dotenv').config();

const {
  deleteCredential,
  getCredentialById
} = require('./db/credentials.repository');

async function test() {
  try {
    const deleted = await deleteCredential(3);
    console.log("¿Se eliminó?", deleted);

    const credential = await getCredentialById(3);
    console.log("¿Existe todavía?", credential);

  } catch (error) {
    console.error("Error:", error);
  }
}

test();