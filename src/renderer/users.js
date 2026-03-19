
// @ts-nocheck

/* =========================================================
   VARIABLES GLOBALES
========================================================= */
let allUsers = [];
let currentUser = null;


/* =========================================================
   CARGAR USUARIOS
========================================================= */
async function loadUsers(){
  try {

    console.log("Cargando usuarios...");

    const table = document.getElementById("table");
    table.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

    // Obtener usuarios desde backend
    allUsers = await window.api.getUsersFull();

    console.log("Usuarios cargados:", allUsers);

    // Renderizar
    renderUsers(allUsers);

  } catch (error){
    console.error("Error loading users:", error);
  }
}


/* =========================================================
   RENDERIZAR USUARIOS (FIX BOTONES )
========================================================= */
function renderUsers(users){

  const table = document.getElementById("table");
  table.innerHTML = "";

  users.forEach(u => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
    `;

    const actions = document.createElement("td");
    actions.className = "actions";

    // EDITAR ✔
    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", function () {
      console.log("EDIT CLICK:", u.id);
      openEdit(u.id);
    });

    //  ELIMINAR (FIX REAL)
    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "Eliminar";

    btnDelete.addEventListener("click", function (e) {
      e.stopPropagation(); //  evita conflictos
      console.log("DELETE CLICK:", u.id);
      deleteUser(u.id);
    });

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    row.appendChild(actions);
    table.appendChild(row);

  });
}

/* =========================================================
   FILTRO DE BÚSQUEDA (ANTI-LAG )
========================================================= */
let searchTimeout;

function filterUsers(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase().trim();

    const filtered = allUsers.filter(u =>
      u.username.toLowerCase().includes(text) ||
      u.email.toLowerCase().includes(text) ||
      u.role.toLowerCase().includes(text)
    );

    renderUsers(filtered);

  }, 300);
}


/* =========================================================
   VALIDACIÓN DE CONTRASEÑA
========================================================= */
function validatePassword(password){
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{14,32}$/;
  return regex.test(password);
}


/* =========================================================
   LIMPIAR FORMULARIO + BUSCADOR 
========================================================= */
function clearForm(){

  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";

  // 🔍 limpiar búsqueda
  document.getElementById("search").value = "";

  //  recargar lista completa
  renderUsers(allUsers);
}


/* =========================================================
   CREAR USUARIO
========================================================= */
async function createUser(){

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if(!username || !email || !password || !confirm){
    alert("All fields are required");
    return;
  }

  if(password !== confirm){
    alert("Passwords do not match");
    return;
  }

  if(!validatePassword(password)){
    alert("La contraseña debe cumplir los requisitos de seguridad.");
    return;
  }

  try {

    await window.api.createUser({
      username,
      email,
      password,
      role:"user"
    });

    await loadUsers();
    clearForm();

  } catch (error){
    console.error(error);
    alert("Error creating user");
  }
}


/* =========================================================
   ABRIR MODAL EDITAR
========================================================= */
function openEdit(id){

  const user = allUsers.find(u => u.id === id);
  if(!user) return;

  currentUser = user;

  document.getElementById("editUsername").value = user.username;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;

  document.getElementById("editPassword").value = "";
  document.getElementById("editConfirm").value = "";

  document.getElementById("editBox").style.display = "flex";
}


/* =========================================================
   GUARDAR CAMBIOS
========================================================= */
async function saveEdit(){

  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const role = document.getElementById("editRole").value;

  const pass = document.getElementById("editPassword").value;
  const confirm = document.getElementById("editConfirm").value;

  try {

    await window.api.updateUser(currentUser.id, {
      username,
      email,
      role
    });

    if(pass){

      if(pass !== confirm){
        alert("Passwords do not match");
        return;
      }

      if(!validatePassword(pass)){
        alert("La contraseña debe cumplir los requisitos de seguridad.");
        return;
      }

      await window.api.updateUserPassword(currentUser.id, pass);
    }

    document.getElementById("editBox").style.display = "none";
    await loadUsers();

  } catch (error){
    console.error(error);
    alert("Error updating user");
  }
}


/* =========================================================
   CANCELAR EDICIÓN
========================================================= */
function cancelEdit(){
  document.getElementById("editBox").style.display = "none";
  document.getElementById("editPassword").value = "";
  document.getElementById("editConfirm").value = "";
}


/* =========================================================
   ELIMINAR USUARIO (CON DEBUG )
========================================================= */
async function deleteUser(id){

  try {

    console.log("Enviando al backend...");

    const result = await window.api.deleteUser(id);

    console.log("Respuesta backend:", result);

    await loadUsers();

  } catch (error){
    console.error("Error deleting user:", error);
    alert("Error deleting user");
  }
}


/* =========================================================
   INIT
========================================================= */
loadUsers();