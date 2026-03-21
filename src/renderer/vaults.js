// ===============================
// VARIABLE GLOBAL
// ===============================
let vaults = [];

// Guarda cuál vault estoy editando actualmente
let editingId = null;


// ===============================
// CARGAR VAULTS
// ===============================
async function loadVaults(){

  try {

    const data = await window.api.getVaults();

    console.log("Vaults recibidos:", data);

    // me aseguro que nunca sea null
    vaults = data || [];

    renderVaults(vaults);

  } catch (error){

    console.error("Error cargando vaults:", error);

  }
}


// ===============================
// RENDER TARJETAS
// ===============================
function renderVaults(list){

  const container = document.getElementById("vaultContainer");

  if(!container) return;

  // limpio todo antes de volver a dibujar
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(v => {

    const isEditing = editingId === v.id;

    const card = document.createElement("div");
    card.className = "vault-card";

    card.innerHTML = `
      <div class="menu" onclick="toggleMenu(${v.id})">⋮</div>

      <div id="menu-${v.id}" class="menu-options">
        <button onclick="activateEdit(${v.id})">Editar</button>
        <button onclick="deleteVault(${v.id})">Eliminar</button>
      </div>

      ${
        isEditing
          ? `<input id="name-${v.id}" value="${v.name}" class="vault-input-title">`
          : `<div class="vault-title">${v.name}</div>`
      }

      <textarea 
        id="note-${v.id}" 
        class="vault-note"
        ${isEditing ? "" : "readonly"}
        oninput="event.stopPropagation()"
      >${v.description || ""}</textarea>

      <div style="margin-top:10px;">
        ${
          isEditing
            ? `
              <button class="btn btn-create" onclick="saveVault(${v.id})">
                Guardar cambios
              </button>

              <button class="btn btn-clear" onclick="cancelEdit(${v.id})">
                Cancelar
              </button>
            `
            : ""
        }
      </div>

      <div class="vault-date">${formatDate(v.created_at)}</div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}


// ===============================
// ACTIVAR EDICIÓN
// ===============================
function activateEdit(id){

  // marco cuál estoy editando
  editingId = id;

  renderVaults(vaults);

  // foco automático en textarea
  setTimeout(() => {
    const textarea = document.getElementById(`note-${id}`);
    if(textarea) textarea.focus();
  }, 50);
}


// ===============================
// CANCELAR EDICIÓN
// ===============================
function cancelEdit(id){

  // simplemente salgo del modo edición
  editingId = null;

  renderVaults(vaults);
}


// ===============================
// GUARDAR SIN LAG (CLAVE)
// ===============================
async function saveVault(id){

  try {

    const textarea = document.getElementById(`note-${id}`);
    const nameInput = document.getElementById(`name-${id}`);

    if(!textarea || !nameInput) return;

    const description = textarea.value.trim();
    const name = nameInput.value.trim();

    if(!name){
      alert("El nombre no puede quedar vacío");
      return;
    }

    // guardo en backend
    await window.api.updateVault(id,{
      name,
      description
    });

    // actualizo en memoria SIN recargar todo
    const vault = vaults.find(v => v.id === id);

    if(vault){
      vault.name = name;
      vault.description = description;
    }

    // salgo del modo edición
    editingId = null;

    renderVaults(vaults);

  } catch (error){

    console.error("Error guardando:", error);
    alert("Error guardando");

  }
}


// ===============================
// CREAR
// ===============================
async function createVault(){

  try {

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();

    if(!name){
      alert("Nombre requerido");
      return;
    }

    await window.api.createVault({name, description});

    await loadVaults();

    clearForm();

  } catch (error){

    console.error("Error creando:", error);
    alert("Error creando");

  }
}


// ===============================
// ELIMINAR
// ===============================
async function deleteVault(id){

  try {

    if(!confirm("¿Eliminar vault?")) return;

    await window.api.deleteVault(id);

    await loadVaults();

  } catch (error){

    console.error("Error eliminando:", error);
    alert("Error eliminando");

  }
}


// ===============================
// BUSCAR SIN LAG
// ===============================
let searchTimeout;

function filterVaults(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase();

    const filtered = vaults.filter(v =>
      v.name.toLowerCase().includes(text) ||
      (v.description || "").toLowerCase().includes(text)
    );

    renderVaults(filtered);

  }, 250);
}


// ===============================
function clearForm(){

  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
}


// ===============================
function toggleMenu(id){

  const menu = document.getElementById(`menu-${id}`);

  if(!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}


// ===============================
function formatDate(date){

  if(!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}


// ===============================
window.onload = loadVaults;