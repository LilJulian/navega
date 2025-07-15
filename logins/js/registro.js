document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.querySelector('[name="username"]').value.trim();
  const correo = document.querySelector('[name="correo"]').value.trim();
  const telefono = document.querySelector('[name="telefono"]').value.trim();
  const direccion = document.querySelector('[name="direccion"]').value.trim();
  const contrasena = document.querySelector('[name="password"]').value;

  // Validar campos vacíos
  if (!nombre || !correo || !telefono || !direccion || !contrasena) {
    alert("Por favor complete todos los campos.");
    return;
  }

  const id_rol = 1; // Forzar siempre cliente

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
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });

    if (response.ok) {
      try {
        const result = await response.json();
        alert("Usuario registrado exitosamente: " + result.mensaje);
      } catch (e) {
        alert("Usuario registrado exitosamente.");
      }
      window.location.href = "index.html";
    } else {
      alert("Error al registrar el usuario. Intenta más tarde.");
    }

  } catch (error) {
    console.error("Error al enviar:", error);
    alert("Error de conexión con el servidor.");
  }
});
