const mysql = require('mysql2/promise'); // Librería MySQL usando promesas para trabajar con async/await
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // Dirección del servidor de la base de datos
  user: process.env.DB_USER,        // Usuario de conexión a MySQL
  password: process.env.DB_PASSWORD || undefined, // Contraseña (opcional según el entorno)
  database: process.env.DB_NAME,    // Nombre de la base de datos
  port: process.env.DB_PORT,        // Puerto de conexión (por defecto 3306)
  waitForConnections: true,         // Espera si no hay conexiones disponibles
  connectionLimit: 10,              // Máximo de conexiones simultáneas
  queueLimit: 0                     // Sin límite de solicitudes en cola
});

module.exports = pool; // Exporta el pool para usarlo en otros archivos

