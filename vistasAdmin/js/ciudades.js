const form = document.querySelector("#formCiudad");
const tablaCuerpo = document.querySelector("#tablaCiudades");

const URL = "http://localhost:8080/pruebaApi/api/ciudades";
let ciudadEditandoId = null;

// Crear o editar ciudad
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = form.querySelector('[name="nombre_ciudad"]').value.trim();
  const pais = form.querySelector('[name="pais"]').value.trim();
  const codigoPostal = form.querySelector('[name="codigo_postal"]').value.trim();

  if (!nombre || !pais) {
    alert("El nombre de ciudad y país son obligatorios.");
    return;
  }

  const ciudad = {
    nombre_ciudad: nombre,
    pais: pais,
    codigo_postal: codigoPostal
  };

  try {
    let response;

    if (ciudadEditandoId === null) {
      // Crear
      response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciudad)
      });

      if (response.status === 201) {
        alert("Ciudad creada correctamente");
      }
    } else {
      // Editar
      response = await fetch(`${URL}/${ciudadEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ciudad)
      });

      if (response.ok) {
        alert("Ciudad actualizada correctamente");
        ciudadEditandoId = null;
        form.querySelector("button[type='submit']").textContent = "Registrar ciudad";
      }
    }

    form.reset();
    cargarCiudades();

  } catch (error) {
    console.error("Error al guardar ciudad:", error);
    alert("Ocurrió un error.");
  }
});

// Cargar ciudades
async function cargarCiudades() {
try {
  const response = await fetch(URL);
  const ciudades = await response.json();

  tablaCuerpo.innerHTML = ""; // limpiar tabla

  ciudades.forEach((ciudad) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${ciudad.id_ciudad}</td>
      <td>${ciudad.nombre_ciudad}</td>
      <td>${ciudad.pais}</td>
      <td>${ciudad.codigo_postal || "N/A"}</td>
      <td class="tabla-acciones">
        <button class="btn-editar" onclick="editarCiudad(${ciudad.id_ciudad}, '${ciudad.nombre_ciudad}', '${ciudad.pais}', '${ciudad.codigo_postal || ""}')">Editar</button>
        <button class="btn-eliminar" onclick="eliminarCiudad(${ciudad.id_ciudad})">Eliminar</button>
      </td>
    `;
    tablaCuerpo.appendChild(fila);
  });
} catch (error) {
  console.error("Error al cargar ciudades:", error);
}

}

// Editar
window.editarCiudad = function (id, nombre, pais, codigoPostal) {
  form.querySelector('[name="nombre_ciudad"]').value = nombre;
  form.querySelector('[name="pais"]').value = pais;
  form.querySelector('[name="codigo_postal"]').value = codigoPostal;

  ciudadEditandoId = id;
  form.querySelector("button[type='submit']").textContent = "Actualizar ciudad";
};

// Eliminar
window.eliminarCiudad = async function (id) {
  const confirmacion = confirm("¿Estás seguro de eliminar esta ciudad?");
  if (!confirmacion) return;

  try {
    const response = await fetch(`${URL}/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Ciudad eliminada correctamente.");
      cargarCiudades();
    } else {
      alert("Error al eliminar la ciudad.");
    }
  } catch (error) {
    console.error("Error al eliminar ciudad:", error);
  }
};

// Cargar ciudades al iniciar
document.addEventListener("DOMContentLoaded", cargarCiudades);
