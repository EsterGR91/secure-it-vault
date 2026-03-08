/**
 * Maneja el comportamiento de los inputs OTP
 * - Avanza automáticamente al siguiente
 * - Permite borrar hacia atrás
 */

const inputs = document.querySelectorAll(".otp");

inputs.forEach((input, index) => {

  input.addEventListener("input", () => {

    // Solo números
    input.value = input.value.replace(/[^0-9]/g, "");

    // Si escribe algo pasa al siguiente
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

  });

  // Permite regresar con backspace
  input.addEventListener("keydown", (e) => {

    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }

  });

});


/**
 * Verifica el código MFA
 */
async function verifyCode() {

  let code = "";

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

      // Si el código es válido entra al sistema
      window.location.href = "dashboard.html";

    } else {

      alert("Código inválido o expirado");

    }

  } catch (error) {

    console.error(error);
    alert("Error verificando código");

  }

}