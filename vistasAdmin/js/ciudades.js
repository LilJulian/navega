// Verifica si hay un usuario en sesión. Si no lo hay, redirige al login.
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  Swal.fire({
    icon: "warning",
    title: "Acceso denegado",
    text: "Debes iniciar sesión para acceder a esta página."
  }).then(() => {
    window.location.href = "../../index.html";
  });
}

// Evita que al usar el botón "atrás" se regrese a esta vista si el usuario ya cerró sesión.
window.addEventListener("pageshow", function (event) {
  if (!usuario && event.persisted) {
    window.location.href = "../../index.html";
  }
});

// Cierra la sesión eliminando el usuario del localStorage y redirige al login.


// Referencias al formulario y la tabla de ciudades
const form = document.querySelector("#formCiudad");
const tablaCuerpo = document.querySelector("#tablaCiudades");

// URL del backend para ciudades
const URL = "http://localhost:8080/pruebaApi/api/ciudades";

// Variable para saber si se está editando una ciudad
let ciudadEditandoId = null;

// Maneja el envío del formulario para crear o actualizar una ciudad
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener los valores del formulario
  const nombre = form.querySelector('[name="nombre_ciudad"]').value.trim();
  const pais = form.querySelector('[name="pais"]').value.trim();
  const codigoPostal = form.querySelector('[name="codigo_postal"]').value.trim();
  const tienePuerto = document.getElementById("puerto").checked;
  const tieneAeropuerto = document.getElementById("aeropuerto").checked;
  const tieneTerminal = document.getElementById("terminal").checked;

  // Validar que el nombre y país no estén vacíos
  if (!nombre || !pais) {
    Swal.fire("Campos obligatorios", "Por favor completa el nombre de la ciudad y el país.", "warning");
    return;
  }

  // Validar duplicado si se está creando una nueva ciudad
  if (ciudadEditandoId === null) {
    const yaExiste = await validarCiudadExistente(nombre, pais);
    if (yaExiste) {
      Swal.fire("Duplicado", "Ya existe una ciudad con ese nombre y país.", "warning");
      return;
    }
  }

  // Objeto ciudad con la información del formulario
  const ciudad = {
    nombre_ciudad: nombre,
    pais: pais,
    codigo_postal: codigoPostal,
    tienePuerto,
    tieneAeropuerto,
    tieneTerminal
  };

  try {
    let response;

    if (ciudadEditandoId === null) {
      // Crear ciudad
      response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciudad)
      });

      if (response.status === 201) {
        Swal.fire("Éxito", "Ciudad creada correctamente.", "success");
      } else {
        Swal.fire("Error", "No se pudo crear la ciudad.", "error");
      }

    } else {
      // Editar ciudad existente
      response = await fetch(`${URL}/${ciudadEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciudad)
      });

      if (response.ok) {
        Swal.fire("Actualizado", "Ciudad actualizada correctamente.", "success");
        ciudadEditandoId = null;
        form.querySelector("button[type='submit']").textContent = "Guardar Ciudad";
      } else {
        Swal.fire("Error", "No se pudo actualizar la ciudad.", "error");
      }
    }

    // Reinicia el formulario y actualiza la tabla
    form.reset();
    cargarCiudades();

  } catch (error) {
    console.error("Error al guardar ciudad:", error);
    Swal.fire("Error", "Ocurrió un problema al guardar la ciudad.", "error");
  }
});

// Verifica si ya existe una ciudad con el mismo nombre y país
async function validarCiudadExistente(nombre, pais) {
  try {
    const response = await fetch(URL);
    const ciudades = await response.json();

    return ciudades.some(c =>
      c.nombre_ciudad.toLowerCase() === nombre.toLowerCase() &&
      c.pais.toLowerCase() === pais.toLowerCase()
    );

  } catch (error) {
    console.error("Error al validar duplicado:", error);
    return false;
  }
}

// Carga todas las ciudades y las muestra en la tabla
async function cargarCiudades() {
  try {
    const response = await fetch(URL);
    const ciudades = await response.json();

    tablaCuerpo.innerHTML = "";

    ciudades.forEach((ciudad) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${ciudad.id_ciudad}</td>
        <td>${ciudad.nombre_ciudad}</td>
        <td>${ciudad.pais}</td>
        <td>${ciudad.codigo_postal || "N/A"}</td>
        <td>${ciudad.tienePuerto ? "✅" : "❌"}</td>
        <td>${ciudad.tieneAeropuerto ? "✅" : "❌"}</td>
        <td>${ciudad.tieneTerminal ? "✅" : "❌"}</td>
        <td class="tabla-acciones">
          <button class="btn-editar" onclick="editarCiudad(
            ${ciudad.id_ciudad},
            '${ciudad.nombre_ciudad}',
            '${ciudad.pais}',
            '${ciudad.codigo_postal || ""}',
            ${ciudad.tienePuerto},
            ${ciudad.tieneAeropuerto},
            ${ciudad.tieneTerminal}
          )">Editar</button>
          <button class="btn-eliminar" onclick="eliminarCiudad(${ciudad.id_ciudad})">Eliminar</button>
        </td>
      `;
      tablaCuerpo.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar ciudades:", error);
    Swal.fire("Error", "No se pudieron cargar las ciudades.", "error");
  }
}

// Llena el formulario con los datos de la ciudad que se desea editar
window.editarCiudad = function (id, nombre, pais, codigoPostal, tienePuerto, tieneAeropuerto, tieneTerminal) {
  form.querySelector('[name="nombre_ciudad"]').value = nombre;
  form.querySelector('[name="pais"]').value = pais;
  form.querySelector('[name="codigo_postal"]').value = codigoPostal;
  document.getElementById("puerto").checked = tienePuerto;
  document.getElementById("aeropuerto").checked = tieneAeropuerto;
  document.getElementById("terminal").checked = tieneTerminal;

  ciudadEditandoId = id;
  form.querySelector("button[type='submit']").textContent = "Actualizar ciudad";
};

// Elimina una ciudad luego de pedir confirmación al usuario
window.eliminarCiudad = async function (id) {
  const confirmacion = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la ciudad permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const response = await fetch(`${URL}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      Swal.fire("Eliminado", "La ciudad fue eliminada correctamente.", "success");
      cargarCiudades();
    } else {
      Swal.fire("Error", "No se pudo eliminar la ciudad.", "error");
    }

  } catch (error) {
    console.error("Error al eliminar ciudad:", error);
    Swal.fire("Error", "Ocurrió un problema al eliminar la ciudad.", "error");
  }
};

// Carga todas las ciudades al iniciar la página
document.addEventListener("DOMContentLoaded", cargarCiudades);
