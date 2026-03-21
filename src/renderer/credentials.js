// ===============================
// VARIABLES GLOBALES
// ===============================
let credentials = [];
let currentVault = 1;
let editingId = null; // para edición inline


/* ===============================
   CARGAR
=============================== */
async function loadCredentials(){

  const data = await window.api.getCredentials(currentVault);

  credentials = data || [];

  render(credentials);
}


/* ===============================
   RENDER SIN LAG + EDICIÓN
=============================== */
function render(list){

  const container = document.getElementById("list");
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(c => {

    const div = document.createElement("div");
    div.className = "card";

    // Si está en edición
    if(editingId === c.id){

      div.innerHTML = `
        <input id="edit-title-${c.id}" value="${c.title}">
        <input id="edit-user-${c.id}" value="${c.username}">
        <input id="edit-pass-${c.id}" value="${c.password}">
        <input id="edit-url-${c.id}" value="${c.url}">

        <div class="actions">
          <button onclick="saveEdit(${c.id})">Guardar</button>
          <button onclick="cancelEdit()">Cancelar</button>
        </div>
      `;

    }else{

      div.innerHTML = `
        <div class="title">${c.title}</div>
        <div>${formatDate(c.created_at)}</div>

        <div class="actions">
          <button onclick="view(${c.id})">Ver</button>
          <button onclick="copyPassword('${c.password}')">Copiar</button>
          <button onclick="togglePassword(this, '${c.password}')">👁</button>
          <button onclick="startEdit(${c.id})">Editar</button>
          <button onclick="deleteCredential(${c.id})">Eliminar</button>
        </div>
      `;
    }

    fragment.appendChild(div);

  });

  container.appendChild(fragment);
}


/* ===============================
   FORMATO FECHA
=============================== */
function formatDate(date){

  if(!date) return "";

  return new Date(date).toLocaleString("es-CR");
}


/* ===============================
   CREAR
=============================== */
async function createCredential(){

  const data = {
    vaultId: currentVault,
    folderId: 1,
    title: document.getElementById("title").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    url: document.getElementById("url").value,
    notes: ""
  };

  await window.api.createCredential(data);

  loadCredentials();
  clearForm();
}


/* ===============================
   ELIMINAR
=============================== */
async function deleteCredential(id){

  if(!confirm("Eliminar credencial?")) return;

  await window.api.deleteCredential(id);

  loadCredentials();
}


/* ===============================
   VER DETALLE
=============================== */
async function view(id){

  const data = await window.api.getCredential(id);

  alert(
`Usuario: ${data.username}
Password: ${data.password}
URL: ${data.url}`
  );
}


/* ===============================
   COPIAR PASSWORD
=============================== */
function copyPassword(password){

  navigator.clipboard.writeText(password);

  alert("Contraseña copiada");
}


/* ===============================
   MOSTRAR / OCULTAR PASSWORD
=============================== */
function togglePassword(btn, password){

  if(btn.dataset.show === "true"){
    btn.innerText = "👁";
    btn.dataset.show = "false";
  }else{
    btn.innerText = password;
    btn.dataset.show = "true";
  }
}


/* ===============================
   EDITAR INLINE
=============================== */
function startEdit(id){

  editingId = id;
  render(credentials);
}

function cancelEdit(){

  editingId = null;
  render(credentials);
}


/* ===============================
   GUARDAR EDICIÓN
=============================== */
async function saveEdit(id){

  const data = {
    title: document.getElementById(`edit-title-${id}`).value,
    username: document.getElementById(`edit-user-${id}`).value,
    password: document.getElementById(`edit-pass-${id}`).value,
    url: document.getElementById(`edit-url-${id}`).value
  };

  await window.api.updateCredential(id, data);

  editingId = null;

  loadCredentials();
}


/* ===============================
   GENERADOR PRO
=============================== */
function generatePassword(){

  const length = Math.floor(Math.random() * (32 - 12)) + 12;

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}";

  const all = upper + lower + numbers + special;

  let password = "";

  // Aseguro al menos 1 de cada tipo
  password += upper[Math.floor(Math.random()*upper.length)];
  password += lower[Math.floor(Math.random()*lower.length)];
  password += numbers[Math.floor(Math.random()*numbers.length)];
  password += special[Math.floor(Math.random()*special.length)];

  // Relleno restante
  for(let i=4;i<length;i++){
    password += all[Math.floor(Math.random()*all.length)];
  }

  // Mezclar
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  document.getElementById("password").value = password;
}


/* ===============================
   LIMPIAR FORMULARIO
=============================== */
function clearForm(){

  document.getElementById("title").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("url").value = "";
}


/* ===============================
   BUSCAR SIN LAG
=============================== */
let searchTimeout;

function filterCredentials(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document
      .getElementById("search")
      .value
      .toLowerCase();

    const filtered = credentials.filter(c =>
      c.title.toLowerCase().includes(text)
    );

    render(filtered);

  }, 200);
}


/* ===============================
   INIT
=============================== */
window.onload = loadCredentials;