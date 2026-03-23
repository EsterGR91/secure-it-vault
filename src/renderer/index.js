// ================================================
// FUNCIÓN: CARGAR CREDENCIALES DESDE EL BACKEND
// ================================================

async function loadCredentials() {

  // ------------------------------------------------
  // Verificación inicial de ejecución
  // ------------------------------------------------
  // Permite confirmar en consola que el evento fue activado correctamente
  console.log("Botón presionado");


  // ------------------------------------------------
  // SOLICITUD DE DATOS AL BACKEND (Electron IPC)
  // ------------------------------------------------
  // Se obtiene la lista de credenciales asociadas al vault con ID = 1
  const list = await window.api.listCredentials(1);


  // ------------------------------------------------
  // VALIDACIÓN DE RESPUESTA
  // ------------------------------------------------
  // Se imprime la información recibida desde la base de datos
  console.log("Lista recibida:", list);


  // ------------------------------------------------
  // REFERENCIA AL ELEMENTO HTML
  // ------------------------------------------------
  // Se obtiene el contenedor donde se mostrarán las credenciales
  const ul = document.getElementById('credentialList');


  // ------------------------------------------------
  // LIMPIEZA DE CONTENIDO PREVIO
  // ------------------------------------------------
  // Se elimina cualquier contenido previo antes de renderizar nuevos datos
  ul.innerHTML = '';


  // ------------------------------------------------
  // RENDERIZADO DE CREDENCIALES
  // ------------------------------------------------
  // Se recorre la lista de credenciales y se crea un elemento <li> por cada una
  list.forEach(item => {

    // Creación del elemento de lista
    const li = document.createElement('li');

    // Asignación del título de la credencial
    li.textContent = item.title;

    // Inserción del elemento en el contenedor
    ul.appendChild(li);

  });


// =====================================================
// CONTROL VISUAL POR ROL (FORZADO)
// =====================================================

window.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("Usuario actual:", user);

  if(!user) return;

  if(user.role !== "admin"){

    console.log("Aplicando restricciones de usuario");

    //  Oculta TODO excepto credenciales
    document.querySelectorAll("[data-module]").forEach(el => {

      if(el.dataset.module !== "credentials"){
        el.style.display = "none";
      }

    });

  }

});

}