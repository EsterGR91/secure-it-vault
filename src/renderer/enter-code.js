/**
 * =====================================================
 * DETECTAR DESDE QUÉ FLUJO VIENE EL USUARIO
 * =====================================================
 * login     -> ir a dashboard
 * recovery  -> ir a reset-password
 */

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");


/**
 * =====================================================
 * MANEJO DE INPUTS OTP
 * =====================================================
 */

const inputs = document.querySelectorAll(".otp");

inputs.forEach((input, index) => {

  input.addEventListener("input", () => {

    // Solo números
    input.value = input.value.replace(/[^0-9]/g, "");

    // Avanza al siguiente input
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

  });

  // Permite borrar hacia atrás
  input.addEventListener("keydown", (e) => {

    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }

  });

});


/**
 * =====================================================
 * VERIFICAR CÓDIGO MFA
 * =====================================================
 */

async function verifyCode() {

  let code = "";

  // Une los 6 inputs OTP
  inputs.forEach(input => {
    code += input.value;
  });

  if (code.length !== 6) {

    alert("Ingrese el código completo");
    return;

  }

  try {

    const result = await window.api.verifyCode(code);

    if (result) {

      /**
       * =====================================================
       * REDIRECCIÓN SEGÚN EL FLUJO
       * =====================================================
       */

      if(mode === "recovery"){

        // Si viene de recuperar contraseña
        window.location.href = "reset-password.html";

      }else{

        // Si viene de login normal
        window.location.href = "dashboard.html";

      }

    } else {

      alert("Código inválido o expirado");

    }

  } catch (error) {

    console.error(error);
    alert("Error verificando código");

  }

}