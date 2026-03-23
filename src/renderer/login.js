/**
 * =====================================================
 * CONTROL DE INTENTOS FALLIDOS POR USUARIO (ANTI FUERZA BRUTA)
 * =====================================================
 */

let loginAttempts = JSON.parse(localStorage.getItem("loginAttempts")) || {};


/**
 * =====================================================
 * FUNCIÓN LOGIN
 * =====================================================
 */

async function login() {

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
  // VALIDACIÓN DE BLOQUEO
  // =====================================================

  if (userData.lockUntil && Date.now() < userData.lockUntil) {

    const minutes = Math.ceil((userData.lockUntil - Date.now()) / 60000);

    document.getElementById("error").innerText =
      "Cuenta bloqueada. Intente en " + minutes + " minutos";

    return;

  }

  try {

    // =====================================================
    // ENVÍO AL BACKEND
    // =====================================================

    const result = await window.api.login(username, password);
    // Guardar username para usarlo después del MFA
      localStorage.setItem("lastUser", username);

    if (result) {

      /**
       * =====================================================
       * GUARDAR USUARIO TEMPORAL PARA MFA
       * =====================================================
       * Se guarda SOLO el username
       */

      localStorage.setItem("lastUser", username);

      /**
       * =====================================================
       * LIMPIAR INTENTOS
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
     * LOGIN FALLIDO
     * =====================================================
     */

    userData.attempts++;

    if (userData.attempts >= 3) {

      userData.lockUntil = Date.now() + (15 * 60 * 1000);

      document.getElementById("error").innerText =
        "Demasiados intentos. Cuenta bloqueada por 15 minutos";

    } else {

      document.getElementById("error").innerText =
        "Credenciales incorrectas (" + userData.attempts + "/3)";
    }

    loginAttempts[username] = userData;

    localStorage.setItem(
      "loginAttempts",
      JSON.stringify(loginAttempts)
    );

  }

}


/**
 * =====================================================
 * RECUPERAR CONTRASEÑA
 * =====================================================
 */

function forgotPassword(){

  window.location.href = "recover-password.html";

}