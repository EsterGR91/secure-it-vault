// =====================================================
// VARIABLES GLOBALES
// =====================================================

let vaults = [];
let folders = [];
let filtered = [];
let searchTimeout;

// Subcarpetas en memoria (no afecta BD)
let subfolders = {};
let expanded = {};  // controla qué vault está abiertov


// =====================================================
// NAVEGACIÓN
// =====================================================

function goBack(){
  window.location.href = "dashboard.html";
}

function exitApp(){
  window.close();
}


// =====================================================
// CARGAR VAULTS
// =====================================================

async function loadVaults(){

  vaults = await window.api.getVaults();

  const select = document.getElementById("vaultSelect");
  select.innerHTML = "";

  vaults.forEach(v=>{
    select.innerHTML += `<option value="${v.id}">${v.name}</option>`;
  });

  loadFolders();
}


// =====================================================
// CARGAR FOLDERS (SIN TOCAR LÓGICA ORIGINAL)
// =====================================================

async function loadFolders(){

  const vaultId = document.getElementById("vaultSelect").value;

  let data = await window.api.getFoldersByVault(vaultId);

  // Fallback → mostrar vaults como raíz
  if(!data || data.length === 0){
    data = vaults.map(v=>({
      id: v.id,
      name: v.name,
      isVault: true
    }));
  }

  folders = data;
  filtered = folders;

  render();
}


// =====================================================
// RENDER TREE (ESTILO WINDOWS)
// =====================================================

function render(){

  const tree = document.getElementById("tree");
  tree.innerHTML = "";

  filtered.forEach(vault=>{

    // ============================
    // NODO PRINCIPAL (VAULT)
    // ============================

    const node = document.createElement("div");
    node.className = "node";

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.innerText = "▶";

    const label = document.createElement("span");
    label.innerText = "🗄 " + vault.name;

    const menu = document.createElement("span");
    menu.className = "menu";
    menu.innerText = "⋮";

    // Contenedor de hijos
    const children = document.createElement("div");
children.className = "children";

//  mantener abierto el vault correcto
if(expanded[vault.id]){
  children.classList.add("show");
}

    // ============================
    // EVENTOS
    // ============================

    // Expandir / colapsar
   arrow.onclick = (e)=>{
  e.stopPropagation();

  const isOpen = children.classList.toggle("show");

  // Guardar estado
  expanded[vault.id] = isOpen;

  arrow.innerText = isOpen ? "▼" : "▶";
};

    // DOBLE CLICK → CREAR SUBCARPETA
    node.ondblclick = (e)=>{
      e.stopPropagation();
      createSubfolder(vault.id);
    };

    // MENÚ ⋮
    menu.onclick = (e)=>{
      e.stopPropagation();
      createSubfolder(vault.id);
    };

    // ============================
    // CONSTRUCCIÓN DEL NODO
    // ============================

    node.innerHTML = "";

// Flecha
   node.appendChild(arrow);

// Texto
const text = document.createElement("span");
text.innerText = "🗄 " + vault.name;
node.appendChild(text);

// Menú ⋮
   node.appendChild(menu);

    tree.appendChild(node);
    tree.appendChild(children);

    // ============================
    // SUBCARPETAS
    // ============================

    const subs = subfolders[vault.id] || [];

    subs.forEach(sf=>{

      // Nodo subcarpeta
      const sub = document.createElement("div");
      sub.className = "node sub";

      const subLabel = document.createElement("span");
      subLabel.innerText = "📁 " + sf.name;

      const subMenu = document.createElement("span");
      subMenu.className = "menu";
      subMenu.innerText = "⋮";

      subMenu.onclick = (e)=>{
        e.stopPropagation();
        toggleEdit(vault.id, sf.id);
      };

      sub.appendChild(subLabel);
      sub.appendChild(subMenu);

      children.appendChild(sub);

      // ============================
      // PANEL DE EDICIÓN INLINE
      // ============================

      if(sf.editing){

        const editor = document.createElement("div");
        editor.className = "node sub";

        editor.innerHTML = `
          <input id="name_${sf.id}" value="${sf.name}" placeholder="Nombre">
          <input id="notes_${sf.id}" value="${sf.notes || ""}" placeholder="Notas">
          <button onclick="saveEdit(${vault.id},${sf.id})">Guardar</button>
          <button onclick="deleteSub(${vault.id},${sf.id})">Eliminar</button>
        `;

        children.appendChild(editor);
      }

    });

  });
}


// =====================================================
// CREAR SUBCARPETA (CORRECTO)
// =====================================================

function createSubfolder(vaultId){

  if(!subfolders[vaultId]) subfolders[vaultId] = [];

  subfolders[vaultId].push({
    id: Date.now(),
    name: "Nueva carpeta",
    notes: "",
    editing: true
  });

  //  ABRIR AUTOMÁTICAMENTE EL VAULT
  expanded[vaultId] = true;

  render();
}

// =====================================================
// TOGGLE EDICIÓN
// =====================================================

function toggleEdit(vaultId, subId){

  const sf = subfolders[vaultId].find(s=>s.id === subId);

  sf.editing = !sf.editing;

  render();
}


// =====================================================
// GUARDAR CAMBIOS
// =====================================================

function saveEdit(vaultId, subId){

  const sf = subfolders[vaultId].find(s=>s.id === subId);

  sf.name = document.getElementById(`name_${subId}`).value;
  sf.notes = document.getElementById(`notes_${subId}`).value;
  sf.editing = false;

  render();
}


// =====================================================
// ELIMINAR SUBCARPETA
// =====================================================

function deleteSub(vaultId, subId){

  subfolders[vaultId] =
    subfolders[vaultId].filter(s=>s.id !== subId);

  render();
}


// =====================================================
// BUSCADOR SIN LAG
// =====================================================

function filterFolders(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(()=>{

    const text = document.getElementById("search").value.toLowerCase();

    filtered = !text
      ? folders
      : folders.filter(f => f.name.toLowerCase().includes(text));

    render();

  },120);
}


// =====================================================
// LIMPIAR BUSCADOR
// =====================================================

function clearSearch(){

  document.getElementById("search").value = "";
  filtered = folders;

  render();
}


// =====================================================
// INICIO
// =====================================================

loadVaults();