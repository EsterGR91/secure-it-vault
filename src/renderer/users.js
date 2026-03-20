// @ts-nocheck

/* ===============================
   VARIABLES GLOBALES
=============================== */
let allUsers = [];
let currentUser = null;


/* ===============================
   CARGAR USUARIOS (CON FILTRO)
=============================== */
async function loadUsers(){

  try {

    const showInactive = document.getElementById("showInactive")?.checked;

    let users = await window.api.getUsersFull();

    // filtrar activos si no está marcado
    if(!showInactive){
      users = users.filter(u => u.is_active === 1);
    }

    allUsers = users;

    renderUsers(users);

  } catch (error){
    console.error("Error loading users:", error);
  }
}

// Función que se ejecuta cuando se quiere activar o desactivar un usuario
// Recibe el id del usuario y el nuevo estado (activo / inactivo)

async function toggleUser(id, state){

  // Llama a la función expuesta en el preload (window.api)
  // que a su vez envía la solicitud al proceso principal mediante IPC
  await window.api.toggleUser(id, state);

  // Después de actualizar el estado en la base de datos,
  // vuelvo a cargar la lista para reflejar el cambio en la interfaz
  loadUsers();
}

/* ===============================
   RENDERIZAR
=============================== */
function renderUsers(users){

  const table = document.getElementById("table");

  // limpiar tabla
  table.innerHTML = "";

  users.forEach(u => {

    const row = document.createElement("tr");

    // ===============================
    // ESTADO TEXTO (NUEVO)
    // ===============================
    const estado = u.is_active === 1 ? "Activo" : "Inactivo";

    // ===============================
    // ESTILO VISUAL INACTIVOS
    // ===============================
    if(u.is_active === 0){
      row.style.opacity = "0.5";
    }

    // ===============================
    // COLUMNAS (AQUÍ ESTABA EL ERROR)
    // AGREGA <td>${estado}</td>
    // ===============================
    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${estado}</td> <!-- NUEVA COLUMNA -->
    `;

    // ===============================
    // ACCIONES
    // ===============================
    const actions = document.createElement("td");
    actions.className = "actions";

    // botón editar
    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "Editar";
    btnEdit.onclick = () => openEdit(u.id);

    // ===============================
    // BOTÓN DINÁMICO ACTIVO / INACTIVO
    // ===============================
    const btnToggle = document.createElement("button");

    if(u.is_active === 1){

      btnToggle.className = "btn-delete";
      btnToggle.textContent = "Desactivar";
      btnToggle.onclick = () => confirmAction(u, false);

    }else{

      btnToggle.className = "btn-create";
      btnToggle.textContent = "Activar";
      btnToggle.onclick = () => confirmAction(u, true);
    }

    // agregar botones
    actions.appendChild(btnEdit);
    actions.appendChild(btnToggle);

    // agregar columna acciones
    row.appendChild(actions);

    // agregar fila a la tabla
    table.appendChild(row);
  });
}

/* ===============================
   ACTIVAR / DESACTIVAR
=============================== */
async function confirmAction(user, activate){

  const action = activate ? "activar" : "desactivar";

  if(!confirm(`Seguro que deseas ${action} a ${user.username}?`)) return;

  const currentId = localStorage.getItem("userId");

  if(!activate && Number(currentId) === user.id){
    alert("No puedes desactivarte a ti mismo");
    return;
  }

  await window.api.toggleUser(user.id, activate);

  await loadUsers();
}


/* ===============================
   FILTRO
=============================== */
let searchTimeout;

function filterUsers(){

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {

    const text = document.getElementById("search").value.toLowerCase();

    const filtered = allUsers.filter(u =>
      u.username.toLowerCase().includes(text) ||
      u.email.toLowerCase().includes(text) ||
      u.role.toLowerCase().includes(text)
    );

    renderUsers(filtered);

  }, 300);
}


/* ===============================
   VALIDACIÓN PASSWORD
=============================== */
function validatePassword(password){
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{14,32}$/;
  return regex.test(password);
}


/* ===============================
   LIMPIAR
=============================== */
function clearForm(){

  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("search").value = "";

  renderUsers(allUsers);
}


/* ===============================
   CREAR
=============================== */
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
    alert("Password does not meet security requirements");
    return;
  }

  await window.api.createUser({username,email,password,role:"user"});

  await loadUsers();
  clearForm();
}


/* ===============================
   EDITAR
=============================== */
function openEdit(id){

  const user = allUsers.find(u => u.id === id);
  if(!user) return;

  currentUser = user;

  document.getElementById("editUsername").value = user.username;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;

  document.getElementById("editBox").style.display = "flex";
}


/* ===============================
   GUARDAR
=============================== */
async function saveEdit(){

  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const role = document.getElementById("editRole").value;

  const pass = document.getElementById("editPassword").value;
  const confirm = document.getElementById("editConfirm").value;

  await window.api.updateUser(currentUser.id,{username,email,role});

  if(pass){

    if(pass !== confirm){
      alert("Passwords do not match");
      return;
    }

    if(!validatePassword(pass)){
      alert("Password not valid");
      return;
    }

    await window.api.updateUserPassword(currentUser.id, pass);
  }

  document.getElementById("editBox").style.display = "none";
  await loadUsers();
}


/* ===============================
   CANCELAR
=============================== */
function cancelEdit(){
  document.getElementById("editBox").style.display = "none";
}


/* ===============================
   INIT
=============================== */
loadUsers();