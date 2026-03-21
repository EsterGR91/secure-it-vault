// @ts-nocheck

/* ===============================
   VARIABLES GLOBALES
=============================== */
let allUsers = [];      
let currentUser = null; 
let isLoading = false;


/* ===============================
   CARGAR USUARIOS (CON FILTRO)
=============================== */
async function loadUsers(){

  try {

    const checkbox = document.getElementById("showInactive");
    const showInactive = checkbox ? checkbox.checked : false;

    console.log("showInactive:", showInactive);

    // Mensaje visual mientras carga
    document.getElementById("table").innerHTML =
      "<tr><td colspan='6'>Cargando...</td></tr>";

    let users = await window.api.getUsersFull(showInactive);

    allUsers = users;
    renderUsers(users);

  } catch (error){
    console.error("Error loading users:", error);
  }
}


/* ===============================
   ACTIVAR / DESACTIVAR USUARIO
=============================== */
async function toggleUser(id, state){

  await window.api.toggleUser(id, state);
  loadUsers();
}


/* ===============================
   RENDERIZAR USUARIOS (OPTIMIZADO)
=============================== */
function renderUsers(users){

  const table = document.getElementById("table");

  table.innerHTML = "";

  // Fragmento para mejorar rendimiento
  const fragment = document.createDocumentFragment();

  users.forEach(u => {

    const row = document.createElement("tr");

    const estado = u.is_active === 1 ? "Activo" : "Inactivo";

    if(u.is_active === 0){
      row.style.filter = "grayscale(60%)";
    }

    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${estado}</td>
    `;

    const actions = document.createElement("td");
    actions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "Editar";

    if(u.is_active === 1){
      btnEdit.onclick = () => openEdit(u.id);
    }else{
      btnEdit.disabled = true;
      btnEdit.style.opacity = "0.4";
      btnEdit.style.cursor = "not-allowed";
    }

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

    actions.appendChild(btnEdit);
    actions.appendChild(btnToggle);

    row.appendChild(actions);
    fragment.appendChild(row);
  });

  table.appendChild(fragment);
}


/* ===============================
   ACTIVAR / DESACTIVAR (OPTIMIZADO)
=============================== */
async function confirmAction(user, activate){

  if(user.username === "adminew" && !activate){
    alert("No puedes desactivar el usuario administrador");
    return;
  }

  const action = activate ? "activar" : "desactivar";

  if(!confirm(`Seguro que deseas ${action} a ${user.username}?`)) return;

  const currentId = localStorage.getItem("userId");

  if(!activate && Number(currentId) === user.id){
    alert("No puedes desactivarte a ti mismo");
    return;
  }

  // Bloquea clicks mientras procesa
  document.body.style.pointerEvents = "none";

  try{
    await window.api.toggleUser(user.id, activate);
    await loadUsers();
  }finally{
    document.body.style.pointerEvents = "auto";
  }
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
   LIMPIAR FORMULARIO CREAR
=============================== */
function clearForm(){

  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("search").value = "";

  // Se elimina render innecesario para evitar lag
}


/* ===============================
   CREAR USUARIO
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
   EDITAR USUARIO
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
   GUARDAR EDICIÓN
=============================== */
async function saveEdit(){

  const username = document.getElementById("editUsername").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const role = document.getElementById("editRole").value;

  const pass = document.getElementById("editPassword").value;
  const confirm = document.getElementById("editConfirm").value;

  if(!username || !email){
    alert("Username y Email son obligatorios");
    return;
  }

  if(pass){

    if(pass !== confirm){
      alert("Passwords do not match");
      return;
    }

    if(!validatePassword(pass)){
      alert("Password not valid");
      return;
    }
  }

  await window.api.updateUser(currentUser.id,{username,email,role});

  if(pass){
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
   LIMPIAR FORMULARIO DE EDICIÓN
=============================== */
function clearEdit(){

  document.getElementById("editUsername").value = "";
  document.getElementById("editEmail").value = "";
  document.getElementById("editPassword").value = "";
  document.getElementById("editConfirm").value = "";

}


/* ===============================
   INIT
=============================== */
loadUsers();