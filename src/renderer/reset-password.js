/**
=====================================================
RESET PASSWORD
Esta función permite al usuario cambiar su contraseña
después de verificar el código MFA enviado por correo.
=====================================================
*/

async function resetPassword(){

  // Obtengo valores de los inputs

  const password =
  document.getElementById("password").value;

  const confirm =
  document.getElementById("confirm").value;

  const errorBox =
  document.getElementById("error");

  // Limpio mensajes anteriores

  errorBox.innerText = "";


  /**
  =====================================================
  VALIDACIÓN DE CAMPOS
  =====================================================
  */

  if(!password || !confirm){

    errorBox.innerText =
    "Complete both fields";

    return;

  }


  /**
  =====================================================
  VALIDACIÓN DE COINCIDENCIA
  =====================================================
  */

  if(password !== confirm){

    errorBox.innerText =
    "Passwords do not match";

    return;

  }


  /**
  =====================================================
  ENVÍA LA NUEVA CONTRASEÑA AL BACKEND
  =====================================================
  */

  try{

    await window.api.resetPassword(password);

    errorBox.classList.add("success");

    errorBox.innerText =
    "Password updated successfully";


    /**
    =====================================================
    REDIRECCIÓN AL LOGIN
    =====================================================
    */

    setTimeout(()=>{

      window.location.href = "login.html";

    },1500);

  }

  catch(error){

    errorBox.innerText =
    "Error updating password";

  }

}