async function loadCredentials() {

  console.log("Botón presionado");
  // Verifica que la función realmente se está ejecutando

  const list = await window.api.listCredentials(1);
  // Llama a la API para obtener las credenciales del vault con ID 1

  console.log("Lista recibida:", list);
  // Muestra en consola los datos recibidos desde la base de datos

  const ul = document.getElementById('credentialList');
  // Obtiene la referencia a la lista del HTML

  ul.innerHTML = '';
  // Limpia la lista antes de volver a renderizar los datos

  list.forEach(item => {
    const li = document.createElement('li'); // Crea un nuevo elemento <li>
    li.textContent = item.title;             // Asigna el título de la credencial
    ul.appendChild(li);                      // Lo agrega a la lista
  });
}