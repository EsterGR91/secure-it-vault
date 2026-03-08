async function login() {

  // Obtengo los valores ingresados en los campos del formulario
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Evita login con campos vacíos
  // Si el usuario no escribe username o password,
  // muestro un mensaje y detengo el proceso
  if (!username || !password) {

    document.getElementById("error").innerText =
      "Ingrese usuario y contraseña";

    return;
  }

  try {

    // Llamo a la función login expuesta desde el preload
    // Esto envía las credenciales al proceso main para validación segura
    const result = await window.api.login(username, password);

    if (result) {

      // Si la autenticación es correcta,
      // redirijo al usuario al codigo de verificacion
      window.location.href = "enter-code.html";
    }

  } catch (error) {

    // Si ocurre un error (usuario no encontrado o contraseña incorrecta),
    // muestro mensaje en pantalla
    document.getElementById("error").innerText =
      "Credenciales incorrectas";

  }

}