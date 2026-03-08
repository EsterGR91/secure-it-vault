require('dotenv').config();

const { encrypt, decrypt } = require('./security/crypto');

function testCrypto() {
  const original = "MiPasswordSuperSecreta123!";

  console.log("Texto original:", original);

  const encrypted = encrypt(original);

  console.log("Encriptado:", encrypted);

  const decrypted = decrypt(
    encrypted.encryptedData,
    encrypted.iv,
    encrypted.authTag
  );

  console.log("Desencriptado:", decrypted);
}

testCrypto();