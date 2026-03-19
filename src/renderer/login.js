/**
 * =====================================================
 * CONTROL DE INTENTOS FALLIDOS POR USUARIO (ANTI FUERZA BRUTA)
 * =====================================================
 * Se utiliza un objeto en localStorage para manejar
 * intentos independientes por cada usuario.
 */

let loginAttempts = JSON.parse(localStorage.getItem("loginAttempts")) || {};


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


  // =====================================================
  // OBTENER DATOS DEL USUARIO (INTENTOS)
  // =====================================================

  let userData = loginAttempts[username] || {
    attempts: 0,
    lockUntil: null
  };


  // =====================================================
  // VALIDACIÓN DE BLOQUEO SOLO PARA ESTE USUARIO
  // =====================================================

  if (userData.lockUntil && Date.now() < userData.lockUntil) {

    const minutes = Math.ceil((userData.lockUntil - Date.now()) / 60000);

    document.getElementById("error").innerText =
      "Cuenta bloqueada. Intente en " + minutes + " minutos";

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
       * LOGIN CORRECTO
       * - Se eliminan los intentos SOLO de este usuario
       * =====================================================
       */

      delete loginAttempts[username];

      localStorage.setItem(
        "loginAttempts",
        JSON.stringify(loginAttempts)
      );


      /**
       * =====================================================
       * REDIRECCIÓN A MFA
       * =====================================================
       */

      window.location.href = "enter-code.html?mode=login";

    }

  } catch (error) {

    /**
     * =====================================================
     * LOGIN FALLIDO (SOLO ESTE USUARIO)
     * =====================================================
     */

    userData.attempts++;


    if (userData.attempts >= 3) {

      /**
       * =====================================================
       * BLOQUEO POR 15 MINUTOS
       * =====================================================
       */

      userData.lockUntil = Date.now() + (15 * 60 * 1000);

      document.getElementById("error").innerText =
        "Demasiados intentos. Cuenta bloqueada por 15 minutos";

    } else {

      /**
       * =====================================================
       * MENSAJE DE ERROR NORMAL
       * =====================================================
       */

      document.getElementById("error").innerText =
        "Credenciales incorrectas (" + userData.attempts + "/3)";
    }


    /**
     * =====================================================
     * GUARDAR CAMBIOS SOLO DE ESTE USUARIO
     * =====================================================
     */

    loginAttempts[username] = userData;

    localStorage.setItem(
      "loginAttempts",
      JSON.stringify(loginAttempts)
    );

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