// =====================================================
// VARIABLES GLOBALES
// =====================================================

let docs = [];
let currentVault = 1;


// =====================================================
// NAVEGACIÓN
// =====================================================

/**
 * Regresa al dashboard principal
 */
function goBack(){
  window.location.href = "dashboard.html";
}

/**
 * Cierra la aplicación
 */
function exitApp(){
  window.close();
}


// =====================================================
// CARGAR DOCUMENTOS
// =====================================================

/**
 * Obtiene los documentos desde el backend
 * y los renderiza en pantalla
 */
async function load(){

  try{
    docs = await window.api.getDocuments(currentVault);
    render();
  }catch(error){
    console.error("Error cargando documentos:", error);
  }
}


// =====================================================
// RENDER (OPTIMIZADO SIN LAG)
// =====================================================

/**
 * Renderiza la lista de documentos.
 * Se optimiza utilizando una sola inserción al DOM
 * para mejorar el rendimiento.
 */
function render(data = docs){

  const container = document.getElementById("list");

  let html = "";

  if(!data.length){
    container.innerHTML = "<p>No hay documentos disponibles</p>";
    return;
  }

  data.forEach(d => {

    html += `
      <div class="card">

        <div class="title">${d.title}</div>

        <div class="date">
          ${new Date(d.created_at).toLocaleString()}
        </div>

        <div class="actions">
          <button onclick="download(${d.id})">Ver</button>
          <button onclick="downloadFile(${d.id}, '${d.title}')">Descargar</button>
          <button onclick="removeDoc(${d.id})">Eliminar</button>
        </div>

      </div>
    `;
  });

  // Inserción única al DOM
  container.innerHTML = html;
}


// =====================================================
// FILTRO EN TIEMPO REAL
// =====================================================

/**
 * Filtra los documentos según el texto ingresado
 */
function filterDocs(){

  const text = document
    .getElementById("search")
    .value
    .toLowerCase();

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(text)
  );

  render(filtered);
}


// =====================================================
// LIMPIAR TODO
// =====================================================

/**
 * Limpia todos los campos del formulario:
 * búsqueda, título y archivo seleccionado
 */
function clearSearch(){

  // limpiar búsqueda
  document.getElementById("search").value = "";

  // limpiar título
  document.getElementById("title").value = "";

  // limpiar archivo
  document.getElementById("file").value = "";

  // recargar lista completa
  render(docs);
}


// =====================================================
// SUBIR DOCUMENTO
// =====================================================

/**
 * Envía el documento al backend para ser almacenado
 */
async function upload(){

  try{

    const file = document.getElementById("file").files[0];
    const title = document.getElementById("title").value;

    if(!file){
      alert("Seleccione un archivo");
      return;
    }

    if(!title){
      alert("Ingrese un nombre");
      return;
    }

    const buffer = await file.arrayBuffer();

    await window.api.createDocument({
      vaultId: currentVault,
      title,
      file: Array.from(new Uint8Array(buffer))
    });

    // recargar lista
    load();

  }catch(error){
    console.error("Error subiendo documento:", error);
    alert("Error al subir");
  }
}


// =====================================================
// VER DOCUMENTO
// =====================================================

/**
 * Abre el documento en una nueva ventana del navegador
 */
async function download(id){

  try{

    const data = await window.api.getDocument(id);

    const byteArray = new Uint8Array(data);

    const blob = new Blob([byteArray]);

    const url = URL.createObjectURL(blob);

    window.open(url);

  }catch(error){
    console.error("Error abriendo documento:", error);
    alert("Error al abrir");
  }
}


// =====================================================
// DESCARGAR DOCUMENTO
// =====================================================

/**
 * Descarga el documento directamente al equipo del usuario
 */
async function downloadFile(id, title){

  try{

    const data = await window.api.getDocument(id);

    const byteArray = new Uint8Array(data);

    const blob = new Blob([byteArray]);

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = title || "documento";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  }catch(error){
    console.error("Error descargando documento:", error);
    alert("Error al descargar");
  }
}


// =====================================================
// ELIMINAR DOCUMENTO
// =====================================================

/**
 * Elimina un documento de la base de datos
 */
async function removeDoc(id){

  if(!confirm("Eliminar documento?")) return;

  await window.api.deleteDocument(id);

  load();
}


// =====================================================
// INICIO
// =====================================================

window.onload = load;