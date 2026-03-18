// =====================================================
// IMPORTACIÓN DE LIBRERÍA
// =====================================================

// Nodemailer permite enviar correos electrónicos desde Node.js
const nodemailer = require("nodemailer");


// =====================================================
// FUNCIÓN PARA ENVIAR CÓDIGO DE VERIFICACIÓN (MFA)
// =====================================================

/**
 * Envía el código de verificación al correo del usuario
 * 
 * @param {string} email - correo del usuario que inició sesión
 * @param {string} code  - código MFA generado por el sistema
 */
async function sendVerificationEmail(email, code) {

  console.log("=================================");
  console.log("Servicio de envío de correo iniciado");
  console.log("Correo destino:", email);
  console.log("Código generado:", code);
  console.log("=================================");


  // =====================================================
  // CONFIGURACIÓN DEL TRANSPORTE DE CORREO
  // =====================================================

  // Se configura el servicio Gmail usando las variables
  // de entorno definidas en el archivo .env

  const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

      // Correo que envía los mensajes
      user: process.env.EMAIL_USER,

      // Contraseña o App Password de Gmail
      pass: process.env.EMAIL_PASS

    }

  });


  // =====================================================
  // ESTRUCTURA DEL MENSAJE
  // =====================================================

  const message = {

    // Remitente del correo
    from: `"Secure IT Vault" <${process.env.EMAIL_USER}>`,

    // Destinatario (correo del usuario registrado)
    to: email,

    // Asunto del correo
    subject: "Código de verificación - Secure IT Vault",

    // Contenido del correo
    text: `Tu código de verificación es: ${code}

Este código expirará en 5 minutos.

Si no solicitaste este código puedes ignorar este mensaje.`

  };


  // =====================================================
  // ENVÍO DEL CORREO
  // =====================================================

  try {

    await transporter.sendMail(message);

    console.log("Correo enviado correctamente al usuario");

  } catch (error) {

    console.error("Error enviando correo:", error);

  }

}


// =====================================================
// EXPORTACIÓN DE LA FUNCIÓN
// =====================================================

// Permite usar esta función desde otros módulos del sistema
module.exports = { sendVerificationEmail };