// Escuchamos cuando se envíe el formulario de login
document.querySelector(".formulario").addEventListener("submit", async function (e) {
  e.preventDefault(); // Evita que el formulario recargue la página automáticamente

  // Obtenemos los valores ingresados en los campos
  const correo = document.querySelector('input[name="username"]').value.trim();
  const contrasena = document.querySelector('input[name="password"]').value;

  // Validar que los campos no estén vacíos
  if (!correo || !contrasena) {
    Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: "Por favor ingresa el correo y la contraseña."
    });
    return;
  }

  // Creamos el objeto con los datos a enviar al backend
  const datos = { correo, contrasena };

  try {
    // Enviamos los datos por POST al endpoint de login
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    // Si la respuesta no es correcta, lanzamos un error para mostrarlo en el catch
    if (!response.ok) throw new Error("Credenciales incorrectas");

    // Convertimos la respuesta a objeto JSON (es el usuario que inició sesión)
    const usuario = await response.json();
    console.log("Login correcto:", usuario);

    // Guardamos al usuario en localStorage para tener su sesión activa
    localStorage.setItem("usuario", JSON.stringify(usuario));

    // Redirigimos según el rol del usuario
    if (usuario.id_usuario === 1) {
      // Superadministrador
      window.location.href = "../../superAdmin/html/vistaSuperAdmin.html";
    } else if (usuario.id_rol === 1) {
      // Cliente
      window.location.href = "../../cliente/html/vistaCliente.html";
    } else if (usuario.id_rol === 2) {
      // Administrador
      window.location.href = "../../vistasAdmin/html/vistaAdmin.html";
    } else {
      // Si el rol no es conocido, mostramos alerta
      Swal.fire({
        icon: "warning",
        title: "Rol desconocido",
        text: "El rol del usuario no es válido."
      });
    }

  } catch (err) {
    // Si ocurre un error (como credenciales incorrectas o fallo del servidor), mostramos alerta
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text: err.message
    });
  }
});
