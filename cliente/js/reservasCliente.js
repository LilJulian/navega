// Cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {

  // Paso 1: Verificar si el usuario está autenticado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    // Si no hay usuario guardado, redirige al login
    window.location.href = "login.html";
    return;
  }

  // Paso 2: Evitar que el usuario regrese a la página anterior con el botón "Atrás"
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => window.history.pushState(null, "", window.location.href);

  // Paso 3: Cerrar sesión al hacer clic en el botón correspondiente
  document.getElementById("cerrarSesion").addEventListener("click", () => {
    localStorage.removeItem("usuario"); // Elimina los datos del usuario guardados
    window.location.href = "../../logins/html/index.html"; // Redirige al login
  });

  // Paso 4: Obtener las reservas del usuario autenticado desde la API
  fetch(`http://localhost:8080/pruebaApi/api/reservas/usuario/${usuario.id_usuario}`)
    .then(res => res.json())
    .then(reservas => {
      const contenedor = document.getElementById("contenedor-reservas");
      const mensaje = document.getElementById("mensaje-vacio");

      // Mostrar mensaje si no hay reservas
      if (!reservas || reservas.length === 0) {
        mensaje.style.display = "block";
        return;
      }

      // Recorre cada reserva y la muestra en pantalla
      reservas.forEach((reserva, index) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Quita la hora actual para comparar fechas

        const fechaIda = reserva.fecha_ida ? new Date(reserva.fecha_ida) : null;
        if (fechaIda) fechaIda.setHours(0, 0, 0, 0); // Quita la hora a la fecha de ida

        const fechaVuelta = reserva.fecha_vuelta
          ? new Date(reserva.fecha_vuelta).toLocaleDateString()
          : "No aplica";

        const precioTotal = reserva.precio_total
          ? Number(reserva.precio_total).toLocaleString("es-CO")
          : "0";

        // Verifica si la reserva está vencida (fecha ida menor a hoy y estado pendiente)
        const vencida = fechaIda && fechaIda < hoy && reserva.estado === "PENDIENTE";

        // Determina el estado a mostrar
        const estadoVisual = vencida ? "CANCELADA AUTOMÁTICAMENTE" : reserva.estado;

        // Botones disponibles para cada reserva
        const botones = [];
        botones.push(`<button class="btn-ver-boletos">Ver Boletos</button>`);

        if (!vencida && reserva.estado === "PENDIENTE") {
          botones.push(`<button class="btn-pagar">Pagar</button>`);
          botones.push(`<button class="btn-eliminar">Eliminar</button>`);
        }

        // Crea el contenedor de la reserva
        const div = document.createElement("div");
        div.classList.add("reserva-card");

        // Contenido de la tarjeta de reserva
        div.innerHTML = `
          <h3>Reserva ${index + 1}</h3>
          <p><strong>Estado:</strong> ${estadoVisual}</p>
          <p><strong>Fecha ida:</strong> ${fechaIda ? fechaIda.toLocaleDateString() : "No disponible"}</p>
          <p><strong>Fecha vuelta:</strong> ${fechaVuelta}</p>
          <p><strong>Tipo:</strong> ${reserva.tipo_reserva || "No especificado"}</p>
          <p><strong>Personas:</strong> ${reserva.cantidad_personas}</p>
          <p><strong>Precio total:</strong> $${precioTotal}</p>
          <div class="acciones">
            ${botones.join("\n")}
          </div>
        `;

        // Acción del botón "Ver Boletos"
        div.querySelector(".btn-ver-boletos").addEventListener("click", () => {
          window.location.href = `boletosReserva.html?id_reserva=${reserva.id_reserva}`;
        });

        // Acción del botón "Pagar"
        const btnPagar = div.querySelector(".btn-pagar");
        if (btnPagar) {
          btnPagar.addEventListener("click", () => {
            fetch(`http://localhost:8080/pruebaApi/api/reservas/${reserva.id_reserva}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...reserva, estado: "CONFIRMADA" })
            })
              .then(res => {
                if (!res.ok) throw new Error("Error al confirmar");
                return res.text();
              })
              .then(() => {
                Swal.fire("Reserva confirmada", "La reserva fue pagada correctamente.", "success")
                  .then(() => location.reload());
              })
              .catch(err => {
                console.error("Error al pagar:", err);
                Swal.fire("Error", "No se pudo confirmar la reserva.", "error");
              });
          });
        }

        // Acción del botón "Eliminar" (cancelar reserva)
        const btnEliminar = div.querySelector(".btn-eliminar");
        if (btnEliminar) {
          btnEliminar.addEventListener("click", () => {
            Swal.fire({
              title: "¿Cancelar esta reserva?",
              text: "Esta acción no se puede deshacer.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Sí, cancelar",
              cancelButtonText: "No"
            }).then(result => {
              if (result.isConfirmed) {
                fetch(`http://localhost:8080/pruebaApi/api/reservas/${reserva.id_reserva}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...reserva, estado: "CANCELADA" })
                })
                  .then(res => {
                    if (!res.ok) throw new Error("Error al cancelar");
                    return res.text();
                  })
                  .then(() => {
                    Swal.fire("Cancelada", "La reserva ha sido cancelada.", "success")
                      .then(() => location.reload());
                  })
                  .catch(err => {
                    console.error("Error al cancelar:", err);
                    Swal.fire("Error", "No se pudo cancelar la reserva.", "error");
                  });
              }
            });
          });
        }

        // Agrega la tarjeta al contenedor principal
        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      // Si ocurre un error al obtener las reservas
      console.error("Error al obtener las reservas:", err);
      const mensaje = document.getElementById("mensaje-vacio");
      mensaje.textContent = "No se pudo cargar la información.";
      mensaje.style.display = "block";
    });
});
