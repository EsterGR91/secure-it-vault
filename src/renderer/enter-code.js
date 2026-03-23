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

    // Permitir solo números
    input.value = input.value.replace(/[^0-9]/g, "");

    // Avanzar automáticamente al siguiente campo
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

  });

  // Permitir borrar hacia atrás con Backspace
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

  // Construir código completo a partir de los inputs
  inputs.forEach(input => {
    code += input.value;
  });

  // Validación de longitud
  if (code.length !== 6) {

    alert("Ingrese el código completo");
    return;

  }

  try {

    const result = await window.api.verifyCode(code);

    if (result) {

      /**
       * =====================================================
       * OBTENER USERNAME DESDE LOGIN
       * =====================================================
       */
      const username = localStorage.getItem("lastUser");


      /**
       * =====================================================
       * OBTENER USUARIO REAL DESDE BD (ROL CORRECTO)
       * =====================================================
       * Aquí se consulta el backend para obtener el role real
       */
      const user = await window.api.getUserByUsername(username);


      /**
       * =====================================================
       * VALIDACIÓN DE SEGURIDAD
       * =====================================================
       */
      if (!user) {
        alert("No se pudo obtener el usuario");
        return;
      }


      /**
       * =====================================================
       * GUARDAR USUARIO FINAL (CON ROLE REAL)
       * =====================================================
       */
      localStorage.setItem("user", JSON.stringify(user));


      /**
       * =====================================================
       * REDIRECCIÓN SEGÚN EL FLUJO
       * =====================================================
       */

      if(mode === "recovery"){

        window.location.href = "reset-password.html";

      }else{

        window.location.href = "dashboard.html";

      }

    } else {

      alert("Código inválido o expirado");

    }

  } catch (error) {

    console.error("Error verificando código:", error);
    alert("Error verificando código");

  }

}