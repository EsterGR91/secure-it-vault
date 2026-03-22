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
// CARGAR DATOS COMPLETOS (SIN LAG)
// ===============================
async function loadCredentials(){

  try{

    const data = await window.api.getCredentials(currentVault);
    credentials = data || [];

    render(credentials);

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

  }catch(error){
    console.error("Error cargando credenciales:", error);
  }
}


// ===============================
// RENDER OPTIMIZADO (NO TOCAR)
// ===============================
function render(list){

  const container = document.getElementById("list");

  // optimización: evitar render innecesario si está vacío
  if(!container) return;

  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(c => {

    const div = document.createElement("div");
    div.className = "card";

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
// INICIAR EDICIÓN
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

  document.getElementById("title").focus();

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

  document.getElementById("title").focus();
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
// MODAL
// ===============================
function view(id){

  const data = credentials.find(c => c.id === id);

  if(!data){
    showToast("No se pudo obtener la credencial");
    return;
  }

  const overlay = document.createElement("div");

  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";

  const modal = document.createElement("div");

  modal.style.background = "#1e293b";
  modal.style.padding = "25px";
  modal.style.borderRadius = "12px";
  modal.style.width = "350px";

  modal.innerHTML = `
    <h3>${data.title}</h3>
    <p><b>Usuario:</b> ${data.username}</p>
    <p><b>Password:</b> ${data.password}</p>
    <p><b>URL:</b> ${data.url}</p>
    <br>
    <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}


// ===============================
// COPIAR PASSWORD
// ===============================
async function copyPassword(id){

  try{

    const cred = credentials.find(c => c.id === id);

    if(!cred){
      showToast("No se encontró la credencial");
      return;
    }

    if(!cred.password){
      showToast("No hay contraseña disponible");
      return;
    }

    await window.api.copyToClipboard(cred.password);

    showToast("Contraseña copiada correctamente");

  }catch(error){

    console.error("Error copiando:", error);
    showToast("Error al copiar");

  }
}


// ===============================
// TOAST
// ===============================
function showToast(msg){

  const toast = document.createElement("div");

  toast.innerText = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#22c55e";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "10px";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}


// ===============================
// GENERADOR
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
// BUSCADOR SIN LAG REAL
// ===============================
function filterCredentials(){

  const text = document.getElementById("search").value.toLowerCase();

  // si no hay texto → render normal
  if(!text){
    render(credentials);
    return;
  }

  // filtro directo sin delay
  const filtered = credentials.filter(c => {

    const user = (c.username || "").toLowerCase();
    const title = (c.title || "").toLowerCase();

    return user.includes(text) || title.includes(text);
  });

  render(filtered);
}


// ===============================
// INIT
// ===============================
window.onload = loadCredentials;