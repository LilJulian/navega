const tabla = document.getElementById("tablaTransporte");
const form = document.getElementById("formTransporte");
const inputTipo = document.getElementById("tipo");
const btnGuardar = document.getElementById("btnGuardar");

let idEditando = null;

document.addEventListener("DOMContentLoaded", cargarTransportes);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    tipo: inputTipo.value,
    estado: 1
  };

  try {
    let url = "http://localhost:8080/pruebaApi/api/transporte";
    let method = "POST";

    if (idEditando !== null) {
      url += `/${idEditando}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (response.ok) {
      alert(idEditando ? "Transporte actualizado" : "Transporte creado");
      form.reset();
      idEditando = null;
      btnGuardar.textContent = "Registrar";
      cargarTransportes();
    } else {
      alert("Error al guardar");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
});

async function cargarTransportes() {
  try {
    
    const res = await fetch("http://localhost:8080/pruebaApi/api/transporte");
    const data = await res.json();
    console.log("Transportes recibidos:", data);

    tabla.innerHTML = "";
    data.forEach((t) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${t.id_transporte}</td>
        <td>${t.tipo}</td>
        <td>
          <button onclick="editar(${t.id_transporte})">Editar</button>
          <button onclick="eliminar(${t.id_transporte})">Eliminar</button>
        </td>
      `;

      tabla.appendChild(fila);
    });
  } catch (err) {
    console.error("Error al cargar transportes:", err);
  }
}

async function editar(id) {
  try {
    const res = await fetch(`http://localhost:8080/pruebaApi/api/transporte/${id}`);
    if (!res.ok) throw new Error("No se encontró el transporte");

    const t = await res.json();
    inputTipo.value = t.tipo;
    idEditando = t.id_transporte;
    btnGuardar.textContent = "Actualizar";

  } catch (error) {
    console.error("Error al editar:", error);
  }
}

async function eliminar(id) {
  const confirmar = confirm("¿Eliminar este transporte?");
  if (!confirmar) return;

  try {
    const res = await fetch(`http://localhost:8080/pruebaApi/api/transporte/estado/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado: 0 }) // Solo se cambia el estado
    });

    if (res.ok) {
      alert("Transporte eliminado correctamente");
      cargarTransportes(); // Recarga la tabla
    } else {
      alert("No se pudo eliminar");
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
}

async function cargarInactivos() {
  try {
    const res = await fetch("http://localhost:8080/pruebaApi/api/transporte/inactivos");
    const data = await res.json();

    tabla.innerHTML = "";
    data.forEach((t) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${t.id_transporte}</td>
        <td>${t.tipo}</td>
        <td>
          <button onclick="restaurar(${t.id_transporte})">Restaurar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  } catch (err) {
    console.error("Error al cargar inactivos:", err);
  }
}

async function restaurar(id) {
  const confirmar = confirm("¿Restaurar este transporte?");
  if (!confirmar) return;

  try {
    const res = await fetch(`http://localhost:8080/pruebaApi/api/transporte/estado/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: 1 })
    });

    if (res.ok) {
      alert("Transporte restaurado correctamente");
      cargarInactivos(); // Vuelve a mostrar los inactivos actualizados
    } else {
      alert("No se pudo restaurar");
    }
  } catch (error) {
    console.error("Error al restaurar:", error);
  }
}


