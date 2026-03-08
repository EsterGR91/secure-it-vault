require('dotenv').config();

const { getCredentialsByVault } = require('./db/credentials.repository');

async function test() {
  try {
    const list = await getCredentialsByVault(1);
    console.log("Lista de credenciales:", list);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();