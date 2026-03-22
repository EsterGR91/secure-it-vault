// ===============================
// VARIABLES GLOBALES
// ===============================

// Lista completa de logs obtenidos desde backend
let logs = [];

// Lista filtrada (buscador + filtros)
let filteredLogs = [];

// Control de paginación
let currentPage = 1;
const pageSize = 10;


// ===============================
// NAVEGACIÓN
// ===============================

// Regresa al dashboard principal
function goBack(){
  window.location.href = "dashboard.html";
}

// Cierra la aplicación
function exitApp(){
  window.close();
}


// ===============================
// CARGAR LOGS DESDE BACKEND
// ===============================
async function loadLogs(){

  try{

    // Obtiene logs mediante IPC
    logs = await window.api.getAuditLogs();

    // Inicialmente se muestran todos
    filteredLogs = logs;

    // Render inicial
    render();
    renderChart();

  }catch(error){

    console.error("Error cargando auditoría:", error);
  }
}


// ===============================
// RENDER TABLA + PAGINACIÓN
// ===============================
function render(){

  const table = document.getElementById("table");
  table.innerHTML = "";

  // Calculo de registros por página
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredLogs.slice(start, start + pageSize);

  pageData.forEach(l => {

    // Badge de usuario (Sistema o usuario real)
    let userHTML = (!l.user || l.user === "Sistema")
      ? `<span class="badge-user badge-system">Sistema</span>`
      : `<span class="badge-user badge-real">${l.user}</span>`;

    // Color según tipo de acción
    let actionClass = "";
    if(l.action.includes("CREATE")) actionClass = "action-create";
    else if(l.action.includes("DELETE")) actionClass = "action-delete";
    else if(l.action.includes("UPDATE")) actionClass = "action-update";

    // Construcción de fila
    const row = `
      <tr>
        <td>${userHTML}</td>
        <td class="${actionClass}">${l.action}</td>
        <td>${l.target}</td>
        <td>${l.ip_address}</td>
        <td>${new Date(l.created_at).toLocaleString("es-CR")}</td>
      </tr>
    `;

    table.innerHTML += row;
  });

  // Renderiza paginación
  renderPagination();
}


// ===============================
// PAGINACIÓN
// ===============================
function renderPagination(){

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const container = document.getElementById("pagination");

  container.innerHTML = "";

  for(let i = 1; i <= totalPages; i++){

    container.innerHTML += `
      <button 
        class="${i === currentPage ? 'active' : ''}"
        onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
}

// Cambia de página
function changePage(page){
  currentPage = page;
  render();
}


// ===============================
// FILTROS + BUSCADOR
// ===============================
function applyFilters(){

  const text = document.getElementById("search").value.toLowerCase();
  const action = document.getElementById("filterAction").value;

  // Filtrado combinado
  filteredLogs = logs.filter(l => {

    const matchText =
      (l.user || "").toLowerCase().includes(text) ||
      l.target.toLowerCase().includes(text);

    const matchAction =
      !action || l.action.includes(action);

    return matchText && matchAction;
  });

  // Reinicio paginación
  currentPage = 1;

  render();
}


// ===============================
// LIMPIAR BUSCADOR + FILTROS
// ===============================
function clearSearch(){

  // Limpio input de búsqueda
  document.getElementById("search").value = "";

  // Limpio filtro
  document.getElementById("filterAction").value = "";

  // Restauro datos originales
  filteredLogs = logs;

  // Reinicio paginación
  currentPage = 1;

  render();
}


// ===============================
// EXPORTAR CSV (COMPATIBLE EXCEL)
// ===============================
function exportCSV(){

  // Si no hay datos
  if(!filteredLogs || filteredLogs.length === 0){
    alert("No hay datos para exportar");
    return;
  }

  let csv = "User,Action,Target,IP,Fecha\n";

  // Exporta SOLO lo filtrado (mejor UX)
  filteredLogs.forEach(l => {

    const user = l.user || "Sistema";
    const date = new Date(l.created_at).toLocaleString("es-CR");

    csv += `"${user}","${l.action}","${l.target}","${l.ip_address}","${date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "audit_logs.csv";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


// ===============================
// GRÁFICO DE ACTIVIDAD
// ===============================
function renderChart(){

  const counts = { CREATE:0, UPDATE:0, DELETE:0 };

  // Conteo por tipo de acción
  logs.forEach(l => {

    if(l.action.includes("CREATE")) counts.CREATE++;
    else if(l.action.includes("UPDATE")) counts.UPDATE++;
    else if(l.action.includes("DELETE")) counts.DELETE++;
  });

  // Render gráfico con Chart.js
  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: ["CREATE","UPDATE","DELETE"],
      datasets: [{
        label: "Eventos",
        data: [counts.CREATE, counts.UPDATE, counts.DELETE]
      }]
    }
  });
}


// ===============================
// INICIO
// ===============================
window.onload = loadLogs;