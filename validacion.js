const formulario = document.querySelector('form');
const nombreUsuario = document.querySelector('[name="username"]');
const contraseña = document.querySelector('[name="password"]');
const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

const validar = (event) => {
  event.preventDefault();

  if (nombreUsuario.value == "") {
    if (nombreUsuario.previousElementSibling != null) {
      nombreUsuario.previousElementSibling.remove();
    }
    console.log(nombreUsuario.previousElementSibling);
    
    const span = document.createElement('span');
    span.textContent = "Este campo es obligatorio";
    nombreUsuario.insertAdjacentElement("beforebegin", span);
  }

  if (contraseña.value == "" || !regex(contraseña.value)) {
    // if (contraseña.previousElementSibling != null) {
    //   contraseña.previousElementSibling.remove();
    // }
    console.log(contraseña.previousSibling);
    
    const span = document.createElement("span");
    span.textContent = "Rellene este campo correctamente";
    contraseña.insertAdjacentElement("beforebegin", span);
  }
}

formulario.addEventListener('submit', validar);