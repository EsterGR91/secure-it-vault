// ===============================
// VARIABLES (SIN CAMBIOS)
// ===============================
let vaults = [];
let folders = [];
let filtered = [];
let searchTimeout;

let subfolders = {};
let expanded = {};


// ===============================
//  GUARDADO LOCAL
// ===============================
function saveLocal(){
  localStorage.setItem("subfolders", JSON.stringify(subfolders));
}

function loadLocal(){
  const data = localStorage.getItem("subfolders");
  if(data){
    subfolders = JSON.parse(data);
  }
}


// ===============================
function goBack(){ window.location.href="dashboard.html"; }
function exitApp(){ window.close(); }


// ===============================
async function loadVaults(){

  vaults = await window.api.getVaults();

  const select = document.getElementById("vaultSelect");
  select.innerHTML = "";

  vaults.forEach(v=>{
    select.innerHTML += `<option value="${v.id}">${v.name}</option>`;
  });

  loadFolders();
}


// ===============================
async function loadFolders(){

  const vaultId = document.getElementById("vaultSelect").value;

  let data = await window.api.getFoldersByVault(vaultId);

  if(!data || data.length === 0){
    data = vaults.map(v=>({
      id:v.id,
      name:v.name,
      isVault:true
    }));
  }

  folders = data;
  filtered = folders;

  render();
}


// ===============================
function render(){

  const tree = document.getElementById("tree");
  tree.innerHTML = "";

  filtered.forEach(vault=>{

    const node = document.createElement("div");
    node.className = "node";

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.innerText = "▶";

    const icon = document.createElement("span");
    icon.className = "icon icon-vault";

    const text = document.createElement("span");
    text.innerText = vault.name;

    const menu = document.createElement("span");
    menu.className = "menu";
    menu.innerText = "⋮";

    const children = document.createElement("div");
    children.className = "children";

    if(expanded[vault.id]){
      children.classList.add("show");
      arrow.classList.add("open");
    }

    arrow.onclick = (e)=>{
      e.stopPropagation();
      const isOpen = children.classList.toggle("show");
      expanded[vault.id] = isOpen;
      arrow.classList.toggle("open");
    };

    node.ondblclick = ()=>{
      createSubfolder(vault.id);
    };

    menu.onclick = (e)=>{
      e.stopPropagation();
      createSubfolder(vault.id);
    };

    node.appendChild(arrow);
    node.appendChild(icon);
    node.appendChild(text);
    node.appendChild(menu);

    tree.appendChild(node);
    tree.appendChild(children);

    const subs = subfolders[vault.id] || [];

    subs.forEach(sf=>{

      const sub = document.createElement("div");
      sub.className = "node";

      const subIcon = document.createElement("span");
      subIcon.className = "icon icon-folder";

      const subLabel = document.createElement("span");
      subLabel.innerText = sf.name;

      const subMenu = document.createElement("span");
      subMenu.className = "menu";
      subMenu.innerText = "⋮";

      subMenu.onclick = (e)=>{
        e.stopPropagation();
        toggleEdit(vault.id, sf.id);
      };

      sub.appendChild(subIcon);
      sub.appendChild(subLabel);
      sub.appendChild(subMenu);

      children.appendChild(sub);

      if(sf.editing){

        const editor = document.createElement("div");
        editor.className = "editor";

        editor.innerHTML = `
          <input id="name_${sf.id}" value="${sf.name}">
          <textarea id="notes_${sf.id}" class="notes-area">${sf.notes || ""}</textarea>

          <button class="btn-mini btn-save"
            onclick="saveEdit(${vault.id},${sf.id})">
            Guardar
          </button>

          <button class="btn-mini btn-delete"
            onclick="deleteSub(${vault.id},${sf.id})">
            Eliminar
          </button>
        `;

        children.appendChild(editor);
      }

    });

  });
}


// ===============================
function createSubfolder(vaultId){

  if(!subfolders[vaultId]) subfolders[vaultId] = [];

  subfolders[vaultId].push({
    id:Date.now(),
    name:"Nueva carpeta",
    notes:"",
    editing:true
  });

  expanded[vaultId] = true;

  saveLocal(); 

  render();
}


// ===============================
function toggleEdit(vaultId, subId){

  const sf = subfolders[vaultId].find(s=>s.id===subId);
  sf.editing = !sf.editing;

  render();
}


// ===============================
function saveEdit(vaultId, subId){

  const sf = subfolders[vaultId].find(s=>s.id===subId);

  sf.name = document.getElementById(`name_${subId}`).value;
  sf.notes = document.getElementById(`notes_${subId}`).value;
  sf.editing = false;

  saveLocal(); 
  render();
}


// ===============================
function deleteSub(vaultId, subId){

  subfolders[vaultId] =
    subfolders[vaultId].filter(s=>s.id!==subId);

  saveLocal(); 

  render();
}


// ===============================
function filterFolders(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(()=>{

    const text = document.getElementById("search").value.toLowerCase();

    filtered = !text
      ? folders
      : folders.filter(f=>f.name.toLowerCase().includes(text));

    render();

  },120);
}


// ===============================
function clearSearch(){
  document.getElementById("search").value="";
  filtered=folders;
  render();
}


// ===============================
//  IMPORTANTE: CARGA LOCAL PRIMERO
// ===============================
loadLocal();
loadVaults();