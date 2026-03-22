// ===============================
// VARIABLES
// ===============================
let credentials = [];
let currentVault = 1;
let editingId = null;


// ===============================
// NAVEGACIÓN
// ===============================

// voy correctamente al dashboard
function goBack(){
  window.location.href = "dashboard.html";
}

// cerrar app
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
// CARGAR DATOS (SIN LAG + CON USUARIO)
// ===============================
async function loadCredentials(){

  try{

    // traigo lista básica (rápido)
    const data = await window.api.getCredentials(currentVault);

    credentials = data || [];

    // render inmediato (evita lag visual)
    render(credentials);

    // ahora en paralelo traigo los detalles (usuario real)
    const fullData = await Promise.all(
      credentials.map(c => window.api.getCredential(c.id))
    );

    // combino datos sin tocar backend
    credentials = credentials.map((c, i) => ({
      ...c,
      username: fullData[i]?.username || "Usuario no definido"
    }));

    // render final con username correcto
    render(credentials);

  }catch(error){
    console.error("Error cargando credenciales:", error);
  }
}


// ===============================
// RENDER OPTIMIZADO
// ===============================
function render(list){

  const container = document.getElementById("list");
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
        <button onclick="copyPassword('${c.password || ""}')">Copiar</button>
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
// CREAR
// ===============================
async function createCredential(){

  const title = document.getElementById("title").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // validación obligatoria
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

  await window.api.createCredential(data);

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
// MODAL BONITO (NO CONGELA)
// ===============================
async function view(id){

  const data = await window.api.getCredential(id);

  const overlay = document.createElement("div");

  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.onclick = () => overlay.remove();

  const modal = document.createElement("div");

  modal.style.background = "#1e293b";
  modal.style.padding = "25px";
  modal.style.borderRadius = "12px";
  modal.style.width = "350px";
  modal.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";

  modal.onclick = (e) => e.stopPropagation();

  modal.innerHTML = `
    <h3>${data.title || ""}</h3>
    <p><b>Usuario:</b> ${data.username || "Sin usuario"}</p>
    <p><b>Password:</b> ${data.password || "********"}</p>
    <p><b>URL:</b> ${data.url || ""}</p>
    <br>
    <button onclick="this.closest('.overlay').remove()">Cerrar</button>
  `;

  overlay.classList.add("overlay");

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}


// ===============================
// COPIAR PASSWORD (COMPATIBLE ELECTRON)
// ===============================
function copyPassword(password){

  const input = document.createElement("input");
  input.value = password;

  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  showToast("Contraseña copiada");
}


// ===============================
// TOAST BONITO
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

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}


// ===============================
// GENERADOR DE PASSWORD
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
// BUSCADOR SIN LAG
// ===============================
let searchTimeout;

function filterCredentials(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase();

    const filtered = credentials.filter(c => {

      const user = (c.username || "").toLowerCase();
      const title = (c.title || "").toLowerCase();

      return user.includes(text) || title.includes(text);
    });

    render(filtered);

  }, 200);
}


// ===============================
// INIT
// ===============================
window.onload = loadCredentials;