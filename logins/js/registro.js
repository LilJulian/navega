// Esperamos que el formulario se cargue y luego escuchamos su evento "submit"
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Evita que se recargue la página al enviar el formulario

  // Obtenemos los valores ingresados por el usuario y eliminamos espacios vacíos al inicio y final
  const nombre = document.querySelector('[name="username"]').value.trim();
  const correo = document.querySelector('[name="correo"]').value.trim();
  const telefono = document.querySelector('[name="telefono"]').value.trim();
  const direccion = document.querySelector('[name="direccion"]').value.trim();
  const contrasena = document.querySelector('[name="password"]').value;

  // Validamos que ningún campo esté vacío
  if (!nombre || !correo || !telefono || !direccion || !contrasena) {
    Swal.fire("Campos incompletos", "Por favor complete todos los campos.", "warning");
    return;
  }

  // Validamos que el correo tenga un formato válido
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    Swal.fire("Correo inválido", "Por favor ingrese un correo válido.", "error");
    return;
  }

  // Validamos que la contraseña tenga mínimo 6 caracteres
  if (contrasena.length < 6) {
    Swal.fire("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.", "info");
    return;
  }

  // Asignamos el rol manualmente (1 = cliente)
  const id_rol = 1;

  // Creamos el objeto con los datos del usuario
  const usuario = {
    id_usuario: 0,
    id_rol: id_rol,
    nombre_usuario: nombre,
    correo: correo,
    telefono_usuario: telefono,
    direccion_usuario: direccion,
    contrasena: contrasena
  };

  console.log("Enviando al backend:", usuario);

  try {
    // Enviamos los datos al backend
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (response.ok) {
      try {
        const result = await response.json();
        Swal.fire("Registro exitoso", result.mensaje || "Usuario registrado correctamente.", "success")
          .then(() => window.location.href = "index.html");
      } catch (e) {
        Swal.fire("Registro exitoso", "Usuario registrado correctamente.", "success")
          .then(() => window.location.href = "index.html");
      }
    } else {
      Swal.fire("Error", "Error al registrar el usuario. Intenta más tarde.", "error");
    }

  } catch (error) {
    console.error("Error al enviar:", error);
    Swal.fire("Error de conexión", "No se pudo conectar con el servidor.", "error");
  }
});
