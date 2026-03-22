// ===============================
// Variable global donde almaceno los logs cargados
// ===============================
let logs = [];


// ===============================
// Navega de regreso al dashboard
// ===============================
function goBack(){
  window.location.href = "dashboard.html";
}


// ===============================
// Cierra la aplicación
// ===============================
function exitApp(){
  window.close();
}


// ===============================
// CARGAR LOGS DESDE BACKEND
// ===============================
async function loadLogs(){

  try{

    // Solicito los registros de auditoría mediante IPC
    logs = await window.api.getAuditLogs();

    // DEBUG: verificar que el campo correcto es "user"
    console.log("Logs cargados:", logs);

    // Renderizo la lista completa
    render(logs);

  }catch(error){

    // Si ocurre un error, lo muestro en consola
    console.error("Error audit:", error);
  }
}


// ===============================
// RENDERIZAR TABLA
// ===============================
function render(list){

  const table = document.getElementById("table");

  // Uso DocumentFragment para evitar múltiples renders (optimización)
  const fragment = document.createDocumentFragment();

  list.forEach(l => {

    const row = document.createElement("tr");

    // IMPORTANTE:
    // Antes usaba l.username → incorrecto
    // Ahora uso l.user → viene desde el SQL (COALESCE)
    row.innerHTML = `
      <td>${l.user || "Sistema"}</td>
      <td>${l.action}</td>
      <td>${l.target}</td>
      <td>${l.ip_address}</td>
      <td>${formatDate(l.created_at)}</td>
    `;

    fragment.appendChild(row);
  });

  // Limpio la tabla antes de insertar
  table.innerHTML = "";

  // Inserto todo de una vez (más rápido)
  table.appendChild(fragment);
}


// ===============================
// FORMATEAR FECHA
// ===============================
function formatDate(date){

  // Formato local Costa Rica
  return new Date(date).toLocaleString("es-CR");
}


// ===============================
// BUSCADOR OPTIMIZADO (SIN LAG)
// ===============================
let searchTimeout;

function filterLogs(){

  // Cancelo ejecución anterior si el usuario sigue escribiendo
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase();

    // Si está vacío → mostrar todo
    if(!text){
      render(logs);
      return;
    }

    // IMPORTANTE:
    // Antes filtrabas por username → incorrecto
    // Ahora uso user → correcto
    const filtered = logs.filter(l =>
      (l.user || "").toLowerCase().includes(text) ||
      l.action.toLowerCase().includes(text) ||
      l.target.toLowerCase().includes(text)
    );

    render(filtered);

  }, 120); // bajé a 120ms para respuesta más fluida sin lag
}


// ===============================
// LIMPIAR BUSCADOR
// ===============================
function clearSearch(){

  document.getElementById("search").value = "";

  // Renderizo todo nuevamente
  render(logs);
}


// ===============================
// INICIO
// ===============================
window.onload = loadLogs;