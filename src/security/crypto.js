const crypto = require('crypto'); 
// Módulo nativo de Node.js para trabajar con criptografía

const ALGORITHM = 'aes-256-gcm'; 
// Algoritmo de cifrado seguro (AES 256 en modo GCM)

const SECRET = process.env.AES_SECRET; 
// Clave secreta almacenada en variables de entorno

// Convierte la clave en un buffer de 32 bytes usando SHA-256
// Esto garantiza que tenga el tamaño correcto para AES-256
const key = crypto.createHash('sha256').update(SECRET).digest();

function encrypt(text) {
  // Genera un IV (vector de inicialización) aleatorio de 12 bytes
  // 12 bytes es el tamaño recomendado para GCM
  const iv = crypto.randomBytes(12);

  // Crea el objeto de cifrado con el algoritmo, clave y IV
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Cifra el texto
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  // Obtiene el authTag (necesario para validar integridad en GCM)
  const authTag = cipher.getAuthTag();

  // Retorna los datos cifrados en formato hexadecimal
  return {
    encryptedData: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encryptedData, iv, authTag) {
  // Crea el objeto de descifrado usando el mismo algoritmo y clave
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  // Asigna el authTag para validar la integridad de los datos
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  // Descifra la información
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]);

  // Retorna el texto original en formato UTF-8
  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt
}; // Exporta las funciones para usarlas en el sistema