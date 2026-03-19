/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let allUsers = [];      // Guarda todos los usuarios cargados desde la BD
let currentUser = null; // Usuario actualmente seleccionado para edición


/* =========================================================
   CARGAR USUARIOS DESDE BACKEND
   ========================================================= */

async function loadUsers(){
  try{

    // Llamada al backend (Electron preload)
    allUsers = await window.api.getUsersFull();

    // Renderizar en tabla
    renderUsers(allUsers);

  }catch(error){

    console.error("Error loading users:", error);

  }
}


/* =========================================================
   RENDERIZAR USUARIOS EN LA TABLA
   ========================================================= */

function renderUsers(users){

  const table = document.getElementById("table");

  // Limpiar tabla antes de renderizar
  table.innerHTML = "";

  users.forEach(u => {

    table.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td class="actions">

          <!-- BOTÓN EDITAR -->
          <button class="btn-edit" onclick='openEdit(${JSON.stringify(u)})'>
            Editar
          </button>

          <!-- BOTÓN ELIMINAR -->
          <button class="btn-delete" onclick="deleteUser(${u.id})">
            Eliminar
          </button>

        </td>
      </tr>
    `;
  });

}


/* =========================================================
   BUSCAR USUARIOS (FILTRO EN TIEMPO REAL)
   ========================================================= */

function filterUsers(){

  // Texto ingresado en el buscador
  const text = document.getElementById("search").value.toLowerCase().trim();

  // Filtrar usuarios por username, email o rol
  const filtered = allUsers.filter(u =>
    u.username.toLowerCase().includes(text) ||
    u.email.toLowerCase().includes(text) ||
    u.role.toLowerCase().includes(text)
  );

  // Volver a renderizar con el resultado filtrado
  renderUsers(filtered);
}


/* =========================================================
   VALIDACIÓN DE CONTRASEÑA SEGURA
   ========================================================= */

function validatePassword(password){

  /*
    Requisitos:
    - 14 a 32 caracteres
    - 1 mayúscula
    - 1 minúscula
    - 1 número
    - 1 caracter especial
  */

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{14,32}$/;

  return regex.test(password);
}


/* =========================================================
   CREAR NUEVO USUARIO
   ========================================================= */

async function createUser(){

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  // Validación básica
  if(!username || !email || !password || !confirm){
    alert("All fields are required");
    return;
  }

  // Confirmación de contraseña
  if(password !== confirm){
    alert("Passwords do not match");
    return;
  }

  // Validación de seguridad
  if(!validatePassword(password)){
    alert("La contraseña debe tener entre 14 y 32 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
    return;
  }

  try{

    // Enviar al backend
    await window.api.createUser({
      username,
      email,
      password,
      role:"user"
    });

    // Recargar lista
    loadUsers();

  }catch(error){

    console.error(error);
    alert("Error creating user");

  }
}


/* =========================================================
   ABRIR MODAL DE EDICIÓN
   ========================================================= */

function openEdit(user){

  // Guardar usuario seleccionado
  currentUser = user;

  // Cargar datos en el formulario
  document.getElementById("editUsername").value = user.username;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;

  // Limpiar contraseñas
  document.getElementById("editPassword").value = "";
  document.getElementById("editConfirm").value = "";

  // Mostrar modal
  document.getElementById("editBox").style.display = "flex";
}


/* =========================================================
   GUARDAR CAMBIOS DE USUARIO
   ========================================================= */

async function saveEdit(){

  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const role = document.getElementById("editRole").value;

  const pass = document.getElementById("editPassword").value;
  const confirm = document.getElementById("editConfirm").value;

  try{

    /* ===== ACTUALIZAR DATOS GENERALES ===== */

    await window.api.updateUser({
      id: currentUser.id,
      username,
      email,
      role
    });

    /* ===== ACTUALIZAR CONTRASEÑA (SI SE INGRESA) ===== */

    if(pass){

      if(pass !== confirm){
        alert("Passwords do not match");
        return;
      }

      if(!validatePassword(pass)){
        alert("La contraseña debe tener entre 14 y 32 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
        return;
      }

      await window.api.updateUserPassword(currentUser.id, pass);
    }

    // Cerrar modal
    document.getElementById("editBox").style.display = "none";

    // Recargar usuarios
    loadUsers();

  }catch(error){

    console.error(error);
    alert("Error updating user");

  }
}


/* =========================================================
   CANCELAR EDICIÓN
   ========================================================= */

function cancelEdit(){

  document.getElementById("editBox").style.display = "none";

}


/* =========================================================
   ELIMINAR USUARIO (CON PROTECCIÓN MASTER)
   ========================================================= */

async function deleteUser(id){

  const user = allUsers.find(u => u.id === id);

  // Protección: no eliminar usuario master
  if(user.username === "adminew"){
    alert("No se permite eliminar el usuario master");
    return;
  }

  // Confirmación
  if(!confirm("¿Eliminar usuario?")) return;

  try{

    await window.api.deleteUser(id);

    loadUsers();

  }catch(error){

    console.error(error);
    alert("Error deleting user");

  }
}


/* =========================================================
   INICIALIZACIÓN AUTOMÁTICA
   ========================================================= */

// Cargar usuarios al abrir la pantalla
loadUsers();