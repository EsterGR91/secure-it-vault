// Arreglo global donde almaceno los vaults cargados desde la base de datos
let vaults = [];

/* ===============================
   CARGAR VAULTS DESDE BACKEND
=============================== */
async function loadVaults(){

  // Llamo al backend mediante preload (IPC)
  const data = await window.api.getVaults();

  // Guardo los datos en la variable global
  vaults = data;

  // Renderizo la lista en la tabla
  renderVaults(data);
}

/* ===============================
   RENDERIZAR EN TABLA
=============================== */
function renderVaults(list){

  const table = document.getElementById("table");

  // Limpio la tabla antes de volver a dibujarla
  table.innerHTML = "";

  // Recorro la lista recibida
  list.forEach(v => {

    table.innerHTML += `
      <tr>
        <td>${v.id}</td>
        <td>${v.name}</td>
        <td>${v.description}</td>
        <td>${v.created_at}</td>
      </tr>
    `;
  });
}

/* ===============================
   LIMPIAR FORMULARIO
=============================== */
function clearForm(){

  // Reinicio los campos después de crear un vault
  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
}

/* ===============================
   FILTRO DINÁMICO
=============================== */
function filterVaults(){

  // Obtengo el texto escrito en el buscador
  const text = document.getElementById("search").value.toLowerCase();

  // Filtro los vaults por nombre o descripción
  const filtered = vaults.filter(v =>
    v.name.toLowerCase().includes(text) ||
    (v.description || "").toLowerCase().includes(text)
  );

  // Renderizo solo los resultados filtrados
  renderVaults(filtered);
}

/* ===============================
   CREAR NUEVO VAULT
=============================== */
async function createVault(){

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();

  // Valido que el nombre no esté vacío
  if(!name){
    alert("Nombre requerido");
    return;
  }

  // Envío los datos al backend
  await window.api.createVault({name, description});

  // Recargo la lista para reflejar el nuevo registro
  loadVaults();
}

// Cargo los vaults al abrir la página
loadVaults();