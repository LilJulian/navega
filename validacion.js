const formulario = document.querySelector('form');
const nombreUsuario = document.querySelector('[name="username"]');
const contraseña = document.querySelector('[name="password"]');
const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

const validar = (event) => {
  event.preventDefault();

  let pasa = true;
  if (nombreUsuario.value == "" || nombreUsuario.value.length < 3) {
    alert("ingrese el campo correctamente");
    pasa = false;
  }
  // if (contraseña.value == "" || !regex.test(contraseña.value)) {
  //   alert("contraseña incorrecta")
  //   pasa = false;
  // }
  if (pasa == true) {
    formulario.submit();
  }
}


formulario.addEventListener('submit', validar);