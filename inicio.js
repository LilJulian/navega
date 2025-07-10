document.querySelector(".formulario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const correo = document.querySelector('input[name="username"]').value;
  const contrasena = document.querySelector('input[name="password"]').value;

  const datos = { correo, contrasena };

  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!response.ok) throw new Error("Credenciales incorrectas");

    const usuario = await response.json();
    console.log("Login correcto:", usuario);

    // Guardar y redirigir
    localStorage.setItem("usuario", JSON.stringify(usuario));
    if (usuario.id_rol === 1) {
      window.location.href = "../vistaCliente.html";
    } else if (usuario.id_rol === 2) {
      window.location.href = "../vistaAdmin.html";
      
    }else if (usuario.id_usuario === 1) {
      window.location.href = "../vistaSuperAdmin.html";
    }
    else {
      Swal.fire({
        icon: "warning",
        title: "Rol desconocido",
        text: "El rol del usuario no es válido."
      });
    }

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text: err.message
    });
  }
});
