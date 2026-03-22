// ===============================
// VARIABLES
// ===============================
let credentials = [];
let currentVault = 1;
let editingId = null;

// ===============================
// NAVEGACIÓN
// ===============================
function goBack(){
  window.location.href = "dashboard.html";
}

function exitApp(){
  window.close();
}

// ===============================
// MOSTRAR / OCULTAR PASSWORD
// ===============================
function togglePassword(){
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

// ===============================
// CARGAR DATOS (OPTIMIZADO)
// ===============================
async function loadCredentials(){

  try{

    const data = await window.api.getCredentials(currentVault);
    credentials = data || [];

    render(credentials);

    // segunda carga completa sin bloquear UI
    setTimeout(async () => {

      const fullData = await Promise.all(
        credentials.map(c => window.api.getCredential(c.id))
      );

      credentials = credentials.map((c, i) => ({
        ...c,
        username: fullData[i]?.username || "Usuario no definido",
        password: fullData[i]?.password || null,
        url: fullData[i]?.url || ""
      }));

      render(credentials);

    }, 0);

  }catch(error){
    console.error("Error cargando credenciales:", error);
  }
}

// ===============================
// RENDER ULTRA OPTIMIZADO
// ===============================
function render(list){

  const container = document.getElementById("list");
  if(!container) return;

  const fragment = document.createDocumentFragment();

  list.forEach(c => {

    const div = document.createElement("div");
    div.className = "card fade-in";

    const username = c.username || "Usuario no definido";
    const title = c.title || "Sin sistema";

    div.innerHTML = `
      <div class="title">${username} / ${title}</div>
      <div style="font-size:12px;opacity:0.7;">
        ${formatDate(c.created_at)}
      </div>

      <div class="actions">
        <button onclick="view(${c.id})">Ver</button>
        <button onclick="copyPassword(${c.id})">Copiar</button>
        <button onclick="startEdit(${c.id})">Editar</button>
        <button onclick="deleteCredential(${c.id})">Eliminar</button>
      </div>
    `;

    fragment.appendChild(div);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

// ===============================
// FORMATO FECHA
// ===============================
function formatDate(date){
  if(!date) return "";
  return new Date(date).toLocaleString("es-CR");
}

// ===============================
// EDITAR
// ===============================
async function startEdit(id){

  editingId = id;

  const data = credentials.find(c => c.id === id);

  if(!data){
    showToast("Error cargando credencial");
    return;
  }

  document.getElementById("title").value = data.title || "";
  document.getElementById("username").value = data.username || "";
  document.getElementById("password").value = data.password || "";
  document.getElementById("url").value = data.url || "";

  showToast("Modo edición activado");
}

// ===============================
// CREAR / ACTUALIZAR
// ===============================
async function createCredential(){

  const title = document.getElementById("title").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!title || !username || !password){
    showToast("Completa los campos obligatorios");
    return;
  }

  const data = {
    vaultId: currentVault,
    folderId: 1,
    title,
    username,
    password,
    url: document.getElementById("url").value,
    notes: ""
  };

  if(editingId){
    await window.api.updateCredential(editingId, data);
    showToast("Credencial actualizada");
    editingId = null;
  }else{
    await window.api.createCredential(data);
    showToast("Credencial creada");
  }

  await loadCredentials();
  clearForm();
}

// ===============================
// LIMPIAR FORM
// ===============================
function clearForm(){

  document.getElementById("title").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("url").value = "";

  editingId = null;
}

// ===============================
// ELIMINAR
// ===============================
async function deleteCredential(id){

  if(!confirm("Eliminar credencial?")) return;

  await window.api.deleteCredential(id);
  loadCredentials();
}

// ===============================
// VER MODAL
// ===============================
function view(id){

  const data = credentials.find(c => c.id === id);

  if(!data){
    showToast("No se pudo obtener la credencial");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-box";

  modal.innerHTML = `
    <h3>${data.title}</h3>
    <p><b>Usuario:</b> ${data.username}</p>
    <p><b>Password:</b> ${data.password}</p>
    <p><b>URL:</b> ${data.url}</p>
    <button onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ===============================
// COPIAR PASSWORD (REAL)
// ===============================
async function copyPassword(id){

  const cred = credentials.find(c => c.id === id);

  if(!cred || !cred.password){
    showToast("No hay contraseña disponible");
    return;
  }

  await window.api.copyToClipboard(cred.password);
  showToast("Contraseña copiada");
}

// ===============================
// TOAST
// ===============================
function showToast(msg){

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = msg;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

// ===============================
// GENERADOR NORMAL (TUYO)
// ===============================
function generatePassword(){

  const length = Math.floor(Math.random() * (32 - 12)) + 12;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  let pass = "";

  for(let i=0;i<length;i++){
    pass += chars.charAt(Math.floor(Math.random()*chars.length));
  }

  document.getElementById("password").value = pass;
}

// ===============================
// GENERADOR VISUAL PRO (NUEVO)
// ===============================
function updateLength(){
  const val = document.getElementById("length").value;
  document.getElementById("lengthLabel").innerText = val;
}

function generatePasswordAdvanced(){

  const length = document.getElementById("length").value;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  let pass = "";

  for(let i=0;i<length;i++){
    pass += chars.charAt(Math.floor(Math.random()*chars.length));
  }

  document.getElementById("generatedPass").innerText = pass;

  // sincroniza con input
  document.getElementById("password").value = pass;
}

async function copyGenerated(){

  const pass = document.getElementById("generatedPass").innerText;

  if(!pass || pass === "contraseña aquí"){
    showToast("Primero genera una contraseña");
    return;
  }

  await window.api.copyToClipboard(pass);
  showToast("Contraseña copiada");
}

// ===============================
// BUSCADOR SIN LAG
// ===============================
let searchTimeout;

function filterCredentials(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase();

    if(!text){
      render(credentials);
      return;
    }

    const filtered = credentials.filter(c => {

      const user = (c.username || "").toLowerCase();
      const title = (c.title || "").toLowerCase();

      return user.includes(text) || title.includes(text);
    });

    render(filtered);

  }, 120);
}

// ===============================
window.onload = loadCredentials;