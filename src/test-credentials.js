require('dotenv').config();

const repo = require('./db/credentials.repository');

async function test() {

  const id = await repo.createCredential({
    vaultId: 1,
    folderId: 1,
    title: "Sistema Contabilidad",
    username: "admin_sistema",
    password: "PassSuperSecreta!",
    url: "https://empresa.local",
    notes: "Cuenta principal",
    createdBy: 1
  });

  console.log("Credencial creada ID:", id);

  const credential = await repo.getCredentialById(id);

  console.log("Credencial recuperada:", credential);
}

test();