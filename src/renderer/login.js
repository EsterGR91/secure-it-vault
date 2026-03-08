/**
 * Función de login temporal
 * Valida credenciales estáticas para pruebas
 */
function login() {

  // Obtiene los valores ingresados en los campos
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  // Cuenta maestra temporal (solo para pruebas)
  if (user === "admin" && pass === "EastWest123") {

    // Redirige a la página principal del sistema
    window.location.href = "index.html";

  } else {

    // Muestra mensaje si las credenciales no coinciden
    alert("Credenciales incorrectas");
  }
}


/**
 * Mostrar / ocultar contraseña
 */
function togglePassword() {

  const input = document.getElementById("password");

  // Cambia el tipo del input entre password y text
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}


/**
 * Acción para recuperación de contraseña
 */
function forgotPassword() {

  // Mensaje informativo (funcionalidad futura)
  alert("Contacte al administrador del sistema.");
}