const tablaAdmins = document.getElementById("tablaAdmins");
const form = document.getElementById("formCrearAdmin");

// Cargar tabla de administradores al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarAdministradores();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;

  const datosAdmin = {
    nombre_usuario: nombre,
    correo: correo,
    contrasena: contrasena,
    telefono_usuario: telefono,
    direccion_usuario: direccion,
    id_rol: 2 // Rol de administrador
  };

  try {
    let response;
    if (idEditando !== null) {
      // Modo actualización (PUT)
      response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${idEditando}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...datosAdmin, id_usuario: idEditando })
      });

      if (response.ok) {
        alert("Administrador actualizado correctamente");
      } else {
        alert("Error al actualizar el administrador");
      }
    } else {
      // Modo creación (POST)
      response = await fetch("http://localhost:8080/pruebaApi/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosAdmin)
      });

      if (response.status === 201) {
        alert("Administrador creado exitosamente");
      } else {
        alert("Hubo un error al crear el administrador");
      }
    }

    form.reset();
    idEditando = null;
    document.querySelector("#formCrearAdmin button").textContent = "Crear Administrador";
    cargarAdministradores();
  } catch (error) {
    console.error("Error en la petición:", error);
    alert("No se pudo conectar con el servidor");
  }
});

});

async function cargarAdministradores() {
  try {
    const response = await fetch("http://localhost:8080/pruebaApi/api/usuarios");
    const usuarios = await response.json();

    // Filtrar solo los que son administradores
    const admins = usuarios.filter(u => u.id_rol === 2);

    tablaAdmins.innerHTML = "";

admins.forEach(admin => {
  const fila = document.createElement("tr");
  fila.classList.add("tabla-admins__fila");

  // Si es tu usuario, desactiva el botón eliminar
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
  }
}

async function eliminarAdministrador(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este administrador?")) {
    try {
      const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Administrador eliminado correctamente");
        cargarAdministradores(); // ✅ Recargar tabla después de eliminar
      } else {
        alert("No se pudo eliminar el administrador");
      }
    } catch (error) {
      console.error("Error al eliminar administrador:", error);
    }
  }
}
let idEditando = null; // Variable global para saber si estamos editando

async function editarAdministrador(id) {
  try {
    const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`);
    if (!response.ok) throw new Error("No se pudo obtener el administrador");

    const admin = await response.json();

    // Rellenar el formulario con los datos del admin
    document.getElementById("nombre").value = admin.nombre_usuario;
    document.getElementById("correo").value = admin.correo;
    document.getElementById("contrasena").value = admin.contrasena;
    document.getElementById("telefono").value = admin.telefono_usuario;
    document.getElementById("direccion").value = admin.direccion_usuario;

    idEditando = admin.id_usuario; // Guardamos el ID que estamos editando

    // Cambiar el texto del botón
    document.querySelector("#formCrearAdmin button").textContent = "Actualizar Administrador";
  } catch (error) {
    console.error("Error al obtener el administrador:", error);
    alert("Error al cargar los datos del administrador");
  }
}

async function eliminarAdministrador(id) {
  const confirmar = confirm("¿Estás seguro de eliminar este administrador?");
  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:8080/pruebaApi/api/usuarios/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Administrador eliminado correctamente");
      cargarAdministradores(); // Refresca la tabla
    } else {
      alert("Error al eliminar administrador");
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo conectar con el servidor");
  }
}
