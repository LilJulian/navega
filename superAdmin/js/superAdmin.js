// Validar si hay sesión activa y si el usuario es el superadmin (ID 1)
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || usuario.id_usuario !== 1) {
  window.location.href = "/logins/index.html"; // Redirigir si no es superadmin
}

// Mostrar mensaje de bienvenida cuando cargue la vista
document.addEventListener("DOMContentLoaded", () => {
  const mensaje = document.getElementById("mensajeBienvenida");
  if (mensaje) {
    mensaje.textContent = `Bienvenido, ${usuario.nombre_usuario}`;
  }
});

let idEditando = null; // Esta variable indica si estamos editando un admin o creando uno nuevo

const tablaAdmins = document.getElementById("tablaAdmins");
const form = document.getElementById("formCrearAdmin");

// Cuando se cargue la página, traemos los administradores y configuramos el formulario
document.addEventListener("DOMContentLoaded", () => {
  cargarAdministradores();

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que se recargue la página

    // Capturamos los valores del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    // Validar que ningún campo esté vacío
    if (!nombre || !correo || !contrasena || !telefono || !direccion) {
      Swal.fire("Campos incompletos", "Por favor complete todos los campos.", "warning");
      return;
    }

    // Validar formato de correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      Swal.fire("Correo inválido", "Por favor ingrese un correo válido.", "warning");
      return;
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (contrasena.length < 6) {
      Swal.fire("Contraseña débil", "La contraseña debe tener mínimo 6 caracteres.", "warning");
      return;
    }

    // Validar que el teléfono sea numérico y mínimo 7 dígitos
    const telefonoRegex = /^\d{7,}$/;
    if (!telefonoRegex.test(telefono)) {
      Swal.fire("Teléfono inválido", "El teléfono debe tener al menos 7 dígitos y solo números.", "warning");
      return;
    }

    // Crear el objeto con los datos del administrador
    const datosAdmin = {
      nombre_usuario: nombre,
      correo: correo,
      contrasena: contrasena,
      telefono_usuario: telefono,
      direccion_usuario: direccion,
      id_rol: 2 // Rol 2 = administrador
    };

    try {
      let response;

      // Si estamos editando, enviamos PUT al backend
      if (idEditando !== null) {
        response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idEditando}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...datosAdmin, id_usuario: idEditando })
        });

        if (response.ok) {
          Swal.fire("Éxito", "Administrador actualizado correctamente.", "success");
        } else {
          Swal.fire("Error", "No se pudo actualizar el administrador.", "error");
        }

      } else {
        // Si no estamos editando, se crea nuevo admin (POST)
        response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosAdmin)
        });

        if (response.status === 201) {
          Swal.fire("Administrador creado", "El administrador fue registrado exitosamente.", "success");
        } else {
          Swal.fire("Error", "No se pudo registrar el administrador.", "error");
        }
      }

      // Limpiar el formulario y recargar la tabla
      form.reset();
      idEditando = null;
      document.querySelector("#formCrearAdmin button").textContent = "Crear Administrador";
      cargarAdministradores();

    } catch (error) {
      console.error("Error en la petición:", error);
      Swal.fire("Error de conexión", "No se pudo conectar con el servidor.", "error");
    }
  });
});

// Cargar todos los administradores desde la API y mostrarlos en la tabla
async function cargarAdministradores() {
  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios");
    const usuarios = await response.json();

    // Solo mostramos administradores (rol 2)
    const admins = usuarios.filter(u => u.id_rol === 2);

    tablaAdmins.innerHTML = ""; // Limpiar tabla

    admins.forEach(admin => {
      const fila = document.createElement("tr");
      fila.classList.add("tabla-admins__fila");

      const botonEliminar = admin.id_usuario === 1
        ? '<span></span>'
        : `<button onclick="eliminarAdministrador(${admin.id_usuario})">Eliminar</button>`;

      fila.innerHTML = `
        <td class="tabla-admins__columna">${admin.id_usuario}</td>
        <td class="tabla-admins__columna">${admin.nombre_usuario}</td>
        <td class="tabla-admins__columna">${admin.correo}</td>
        <td class="tabla-admins__columna">
          <button onclick="editarAdministrador(${admin.id_usuario})">Editar</button>
          ${botonEliminar}
        </td>
      `;

      tablaAdmins.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar administradores:", error);
    Swal.fire("Error", "No se pudo cargar la lista de administradores.", "error");
  }
}

// Eliminar un administrador con confirmación
async function eliminarAdministrador(id) {
  const confirmar = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará al administrador.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      Swal.fire("Eliminado", "Administrador eliminado correctamente.", "success");
      cargarAdministradores();
    } else {
      Swal.fire("Error", "No se pudo eliminar el administrador.", "error");
    }

  } catch (error) {
    console.error("Error al eliminar:", error);
    Swal.fire("Error de conexión", "No se pudo conectar con el servidor.", "error");
  }
}

// Cargar datos al formulario cuando se quiera editar un administrador
async function editarAdministrador(id) {
  try {
    const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener el administrador");

    const admin = await response.json();

    document.getElementById("nombre").value = admin.nombre_usuario;
    document.getElementById("correo").value = admin.correo;
    document.getElementById("contrasena").value = admin.contrasena;
    document.getElementById("telefono").value = admin.telefono_usuario;
    document.getElementById("direccion").value = admin.direccion_usuario;

    idEditando = admin.id_usuario;

    document.querySelector("#formCrearAdmin button").textContent = "Actualizar Administrador";

  } catch (error) {
    console.error("Error al obtener administrador:", error);
    Swal.fire("Error", "No se pudo cargar el administrador.", "error");
  }
}

// Función para cerrar sesión desde cualquier vista
function cerrarSesion() {
  localStorage.removeItem("usuario");
  window.location.href = "../../logins/html/index.html";
}
