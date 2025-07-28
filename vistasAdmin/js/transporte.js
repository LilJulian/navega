// URL base de la API
const API_URL = "http://localhost:8080/pruebaApi/api/transportes";

// Cargar todos los transportes al iniciar la página
document.addEventListener("DOMContentLoaded", cargarTransportes);

// Obtener todos los transportes y mostrarlos
function cargarTransportes() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => mostrarEnTabla(data))
    .catch(error => {
      console.error("Error al obtener transportes:", error);
      Swal.fire("Error", "No se pudieron cargar los transportes.", "error");
    });
}

// Filtrar por estado
function filtrarPorEstado(estado) {
  fetch(`${API_URL}/estado/${estado}`)
    .then(response => response.json())
    .then(data => mostrarEnTabla(data))
    .catch(error => {
      console.error("Error al filtrar por estado:", error);
      Swal.fire("Error", "No se pudo filtrar por estado.", "error");
    });
}

// Mostrar los transportes en la tabla
function mostrarEnTabla(transportes) {
  const tabla = document.getElementById("tablaTransportes");
  tabla.innerHTML = "";

  transportes.forEach(t => {
    const fila = document.createElement("tr");
    const tipoTexto = obtenerTextoTipoTransporte(t.id_tipoTransporte);

    fila.innerHTML = `
      <td>${t.id_transporte}</td>
      <td>${t.nombre}</td>
      <td>${t.matricula}</td>
      <td>${t.asientos_totales}</td>
      <td>${t.descripcion}</td>
      <td>${t.estado === 1 ? 'Activo' : 'Inactivo'}</td>
      <td>${tipoTexto}</td>
      <td>
        <button onclick="editarTransporte(${t.id_transporte})">Editar</button>
        <button onclick="eliminarTransporte(${t.id_transporte})">Eliminar</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

// Devuelve el texto legible para el tipo de transporte
function obtenerTextoTipoTransporte(id) {
  switch (id) {
    case 1: return "Terrestre";
    case 2: return "Acuático";
    case 3: return "Aéreo";
    default: return "Desconocido";
  }
}

// Captura el evento submit del formulario
document.getElementById("formTransporte").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("id_transporte").value;
  const nombre = document.getElementById("nombre").value.trim();
  const matricula = document.getElementById("matricula").value.trim();
  const asientos = parseInt(document.getElementById("asientos_totales").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const estado = parseInt(document.getElementById("estado").value);
  const tipo = parseInt(document.getElementById("tipo").value);

  // Validaciones
  if (!nombre || !matricula || !descripcion) {
    Swal.fire("Campos requeridos", "Completa todos los campos obligatorios.", "warning");
    return;
  }

  if (isNaN(asientos) || asientos <= 0) {
    Swal.fire("Dato inválido", "Los asientos deben ser un número mayor que cero.", "warning");
    return;
  }

  if (![0, 1].includes(estado)) {
    Swal.fire("Dato inválido", "El estado debe ser 0 (Inactivo) o 1 (Activo).", "warning");
    return;
  }

  if (![1, 2, 3].includes(tipo)) {
    Swal.fire("Dato inválido", "Selecciona un tipo de transporte válido.", "warning");
    return;
  }

  const transporte = {
    nombre,
    matricula,
    asientos_totales: asientos,
    descripcion,
    estado,
    id_tipoTransporte: tipo
  };

  // Actualizar si hay ID
  if (id) {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...transporte, id_transporte: parseInt(id) })
    })
    .then(res => {
      if (res.ok) {
        Swal.fire("Actualizado", "Transporte actualizado correctamente.", "success");
        cargarTransportes();
        limpiarFormulario();
      } else {
        Swal.fire("Error", "No se pudo actualizar el transporte.", "error");
      }
    });
  } else {
    // Crear nuevo
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transporte)
    })
    .then(res => {
      if (res.status === 201) {
        Swal.fire("Registrado", "Transporte creado correctamente.", "success");
        cargarTransportes();
        limpiarFormulario();
      } else {
        Swal.fire("Error", "No se pudo crear el transporte.", "error");
      }
    });
  }
});

// Eliminar transporte con confirmación
function eliminarTransporte(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará el transporte de forma permanente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(res => {
          if (res.ok) {
            Swal.fire("Eliminado", "Transporte eliminado correctamente.", "success");
            cargarTransportes();
          } else {
            Swal.fire("Error", "No se pudo eliminar el transporte.", "error");
          }
        });
    }
  });
}

// Cargar los datos en el formulario para editar
function editarTransporte(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(t => {
      document.getElementById("id_transporte").value = t.id_transporte;
      document.getElementById("nombre").value = t.nombre;
      document.getElementById("matricula").value = t.matricula;
      document.getElementById("asientos_totales").value = t.asientos_totales;
      document.getElementById("descripcion").value = t.descripcion;
      document.getElementById("estado").value = t.estado;
      document.getElementById("tipo").value = t.id_tipoTransporte.toString();
    });
}

// Limpia el formulario
function limpiarFormulario() {
  document.getElementById("formTransporte").reset();
  document.getElementById("id_transporte").value = "";
}
