/**
 * =====================================================
 * FUNCIÓN LOGIN
 * Se ejecuta cuando el usuario presiona el botón Ingresar
 * =====================================================
 */

async function login() {

  // Obtiene valores del formulario
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;


  // =====================================================
  // VALIDACIÓN DE CAMPOS VACÍOS
  // =====================================================

  if (!username || !password) {

    document.getElementById("error").innerText =
      "Ingrese usuario y contraseña";

    return;

  }


  try {

    // =====================================================
    // ENVÍA CREDENCIALES AL BACKEND
    // =====================================================

    const result = await window.api.login(username, password);


    if (result) {

      /**
       * =====================================================
       * REDIRECCIÓN A MFA
       * Enviamos mode=login para indicar que
       * después del código se debe ir al dashboard
       * =====================================================
       */

      window.location.href = "enter-code.html?mode=login";

    }

  } catch (error) {

    document.getElementById("error").innerText =
      "Credenciales incorrectas";

  }

}


/**
 * =====================================================
 * FUNCIÓN RECUPERAR CONTRASEÑA
 * =====================================================
 */

function forgotPassword(){

  // Redirige a pantalla de recuperación
  window.location.href = "recover-password.html";

}