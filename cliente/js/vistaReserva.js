// Este script se ejecuta cuando el DOM ha sido completamente cargado
// Se encarga de cargar los detalles del viaje, gestionar el formulario de reserva y registrar pasajeros adicionales

document.addEventListener("DOMContentLoaded", function () {
  // Obtener el ID del viaje desde los parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const idViaje = params.get("id");
  let viajeActual = null;

  // Obtener los datos del usuario almacenados en localStorage
  const usuarioJSON = localStorage.getItem("usuario");
  let usuario = null;

  if (usuarioJSON) {
    try {
      usuario = JSON.parse(usuarioJSON);
      document.getElementById("usuario-info").textContent = `Usuario: ${usuario.nombre || usuario.correo || 'N/A'}`;
    } catch (error) {
      console.error("Error al parsear el usuario desde localStorage:", error);
    }
  }

  // Verificar si se proporcionó un ID de viaje
  if (!idViaje) {
    mostrarError("ID de viaje no proporcionado.");
    return;
  }

  // Solicitar al backend los detalles completos del viaje
  fetch(`http://localhost:8080/pruebaApi/api/viajes/viajeCompleto/${idViaje}`)
    .then(response => response.json())
    .then(viaje => {
      viajeActual = viaje;
      mostrarDetalle(viaje);
      inicializarFormulario(viaje);
      configurarSelectTipoReserva();
    })
    .catch(error => {
      mostrarError("Error al cargar los datos del viaje.");
      console.error(error);
    });

  // Mostrar los detalles del viaje en el HTML
  function mostrarDetalle(viaje) {
    const contenedor = document.getElementById("detalle-viaje");
    contenedor.innerHTML = `
      <div class="viaje-info">
        <h2>${viaje.nombre_transporte}</h2>
        <p><strong>Origen:</strong> ${viaje.nombre_ciudad_origen}</p>
        <p><strong>Destino:</strong> ${viaje.nombre_ciudad_destino}</p>
        <p><strong>Fecha de salida:</strong> ${formatearFecha(viaje.fecha_salida)}</p>
        <p><strong>Fecha de llegada:</strong> ${formatearFecha(viaje.fecha_llegada)}</p>
        <p><strong>Precio base:</strong> $${viaje.precio_base}</p>
        <p><strong>Asientos disponibles:</strong> ${viaje.asientos_disponibles}</p>
        <p><strong>Matrícula:</strong> ${viaje.placa_transporte}</p>
        <p><strong>Descripción:</strong> ${viaje.descripcion_transporte}</p>
      </div>
    `;
  }

  // Dar formato a una fecha en estilo colombiano
  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-CO", {
      dateStyle: "long",
      timeStyle: "short"
    });
  }

  // Mostrar un mensaje de error en el contenedor de errores
  function mostrarError(mensaje) {
    const errorDiv = document.getElementById("mensaje-error");
    errorDiv.style.display = "block";
    errorDiv.textContent = mensaje;
  }

  // Inicializa el formulario de reserva
  function inicializarFormulario(viaje) {
    const form = document.getElementById("formReserva");
    const inputCantidad = document.getElementById("cantidadPersonas");

    // Generar campos adicionales para pasajeros según la cantidad seleccionada
    inputCantidad.addEventListener("change", () => {
      generarCamposPasajeros(parseInt(inputCantidad.value));
    });

    // Evento para procesar el envío del formulario
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const tipo = document.getElementById("tipoReserva").value;
      const fechaVuelta = document.getElementById("fechaVuelta").value || null;
      const cantidadPersonas = parseInt(document.getElementById("cantidadPersonas").value);

      if (!usuario || !viajeActual) {
        mostrarError("Faltan datos de usuario o viaje.");
        return;
      }

      if (tipo === "IDA_Y_VUELTA" && !fechaVuelta) {
        Swal.fire({ icon: "warning", title: "Fecha de vuelta requerida" });
        return;
      }

      const reserva = {
        id_usuario: usuario.id_usuario,
        id_viaje: viajeActual.id_viaje,
        fecha_ida: new Date(viajeActual.fecha_salida).toISOString().split("T")[0],
        fecha_vuelta: tipo === "IDA" ? null : fechaVuelta,
        tipo_reserva: tipo,
        cantidad_personas: cantidadPersonas,
        precio_total: parseFloat(viajeActual.precio_base) * cantidadPersonas,
        estado: "PENDIENTE"
      };

      try {
        // Registrar la reserva en el backend
        const res = await fetch("http://localhost:8080/pruebaApi/api/reservas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reserva)
        });

        if (!res.ok) throw new Error("Error al registrar la reserva");

        const text = await res.text();
        let reservaCreada = text ? JSON.parse(text) : null;

        if (reservaCreada && reservaCreada.id_reserva) {
          const adicionales = [];

          for (let i = 1; i <= cantidadPersonas; i++) {
            adicionales.push({
              id_reserva: reservaCreada.id_reserva,
              nombre_pasajero: form[`nombre_pasajero_${i}`].value,
              tipo_documento: form[`tipo_documento_${i}`].value,
              documento: form[`documento_${i}`].value,
              comentarios: form[`comentarios_${i}`]?.value || ""
            });
          }

          // Enviar pasajeros adicionales al backend
          const adicionalesRes = await fetch("http://localhost:8080/pruebaApi/api/adicionales/lista", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adicionales)
          });

          const adicionalesData = await adicionalesRes.json();

          if (!adicionalesRes.ok || !Array.isArray(adicionalesData)) {
            console.error(" Error adicionales:", adicionalesData);
            throw new Error("Error al registrar pasajeros adicionales");
          }

          // Crear boletos con ID adicional y reserva
          const boletos = adicionalesData.map((adicional, index) => ({
            id_reserva: adicional.id_reserva,
            id_adicional: adicional.id_adicional,
            asiento: "A" + (index + 1)
          }));

          const boletosRes = await fetch("http://localhost:8080/pruebaApi/api/boletos/lista", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(boletos)
          });

          if (!boletosRes.ok) {
            const errText = await boletosRes.text();
            console.error("Error al insertar boletos:", errText);
            throw new Error("Error al registrar boletos");
          }
        }

        Swal.fire({ icon: "success", title: "Reserva registrada" });
        form.reset();
        document.getElementById("pasajerosAdicionales").innerHTML = "";
        configurarSelectTipoReserva();

      } catch (error) {
        console.error("Error total:", error);
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      }
    });
  }

  // Muestra u oculta el campo de fecha de vuelta dependiendo del tipo de reserva seleccionado
  function configurarSelectTipoReserva() {
    const tipoSelect = document.getElementById("tipoReserva");
    const grupoFechaVuelta = document.getElementById("grupoFechaVuelta");

    tipoSelect.addEventListener("change", () => {
      grupoFechaVuelta.style.display = tipoSelect.value === "IDA" ? "none" : "block";
    });

    tipoSelect.dispatchEvent(new Event("change"));
  }

  // Genera los campos de formulario para los datos de cada pasajero
  function generarCamposPasajeros(cantidad) {
    const contenedor = document.getElementById("pasajerosAdicionales");
    contenedor.innerHTML = "";

    for (let i = 1; i <= cantidad; i++) {
      const grupo = document.createElement("div");
      grupo.className = "pasajero";

      grupo.innerHTML = `
        <h3>Pasajero ${i}</h3>
        <label>Nombre:</label>
        <input type="text" name="nombre_pasajero_${i}" required />
        <label>Tipo de documento:</label>
        <select name="tipo_documento_${i}" required>
          <option value="CC">Cédula</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="PASAPORTE">Pasaporte</option>
        </select>
        <label>Número de documento:</label>
        <input type="text" name="documento_${i}" required />
        <label>Comentarios:</label>
        <textarea name="comentarios_${i}" rows="2"></textarea>
      `;

      contenedor.appendChild(grupo);
    }
  }
});
