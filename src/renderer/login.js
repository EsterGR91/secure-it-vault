async function login() {
  // Obtiene los valores ingresados por el usuario
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');

  // Limpia mensajes de error anteriores
  errorDiv.textContent = '';

  try {
    // Llama a la API para validar el login
    const result = await window.api.login(username, password);
    console.log('Login OK:', result); // Login exitoso
  } catch (err) {
    // Muestra el mensaje de error si el login falla
    errorDiv.textContent = err.message;
  }
}
