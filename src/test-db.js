// estoo es un test para porbar la BD

const pool = require('./db/connection'); // Importa el pool de conexión a la base de datos

async function testDB() {
  try {
    // Ejecuta una consulta simple para verificar la conexión
    const [rows] = await pool.query('SELECT DATABASE() AS db, NOW() AS now');
    
    console.log('✅ Conectado a MySQL'); // Mensaje si la conexión es exitosa
    console.log(rows);                  // Muestra la base de datos actual y la fecha/hora
    
    process.exit(0); // Finaliza el proceso correctamente
  } catch (error) {
    console.error('❌ Error conectando a MySQL'); // Mensaje en caso de error
    console.error(error);                        // Muestra el detalle del error
    
    process.exit(1); // Finaliza el proceso con error
  }
}

testDB(); // Llama a la función para probar la conexión
