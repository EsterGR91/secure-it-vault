/**
 * =====================================================
 * ENVÍA CÓDIGO DE RECUPERACIÓN
 * =====================================================
 */

async function sendRecoveryCode(){

  // Obtiene el username o email ingresado
  const userInput = document.getElementById("userInput").value.trim();

  const errorBox = document.getElementById("error");

  // Limpia mensaje anterior
  errorBox.innerText = "";

  // =====================================================
  // VALIDACIÓN CAMPO VACÍO
  // =====================================================

  if(!userInput){

    errorBox.innerText = "Enter username or email";
    return;

  }

  try{

    // =====================================================
    // LLAMA AL BACKEND PARA GENERAR EL CÓDIGO
    // =====================================================

    const result = await window.api.recoverPassword(userInput);

    if(result){

      /**
       * =====================================================
       * REDIRECCIÓN A PANTALLA DE VERIFICACIÓN
       * IMPORTANTE:
       * Enviamos el parámetro mode=recovery
       * para que enter-code.js sepa que este flujo
       * viene desde RECUPERAR CONTRASEÑA
       * =====================================================
       */

      window.location.href = "enter-code.html?mode=recovery";

    }

  }catch(error){

    // Usuario no encontrado
    errorBox.innerText = "User not found";

  }

}