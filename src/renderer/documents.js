let docs = [];
let currentVault = 1;


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
// CARGAR DOCUMENTOS
// =====================================================

async function load(){

  try{
    docs = await window.api.getDocuments(currentVault);
    render();
  }catch(error){
    console.error("Error cargando documentos:", error);
  }
}


// =====================================================
// RENDER
// =====================================================

function render(){

  const container = document.getElementById("list");
  container.innerHTML = "";

  if(!docs.length){
    container.innerHTML = "<p>No hay documentos disponibles</p>";
    return;
  }

  docs.forEach(d => {
    container.innerHTML += `
      <div class="card">
        <div class="title">${d.title}</div>
        <div class="date">${new Date(d.created_at).toLocaleString()}</div>

        <div class="actions">
          <button onclick="download(${d.id})">Ver</button>
          <button onclick="removeDoc(${d.id})">Eliminar</button>
        </div>
      </div>
    `;
  });
}


// =====================================================
// SUBIR
// =====================================================

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

    load();

  }catch(error){
    console.error("Error subiendo documento:", error);
    alert("Error al subir");
  }
}


// =====================================================
// DESCARGAR
// =====================================================

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
// ELIMINAR
// =====================================================

async function removeDoc(id){

  if(!confirm("Eliminar documento?")) return;

  await window.api.deleteDocument(id);

  load();
}


window.onload = load;