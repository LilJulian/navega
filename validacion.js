const formulario = document.querySelector('form');
const nombreUsuario = document.querySelector('[name="username"]');
const contraseña = document.querySelector('[name="password"]');
const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

const validar = (event) => {
  // event.preventDefault();

  if (nombreUsuario.value == "" || nombreUsuario.value.length < 3) {
    alert("ingrese el campo correctamente");
  }
  
  console.log(nombreUsuario.value.length);
  if (contraseña.value == "" || !regex.test(contraseña.value)) {
    alert("contraseña incorrecta")
  }
}

formulario.addEventListener('submit', validar);