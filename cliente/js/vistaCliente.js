document.addEventListener("DOMContentLoaded", function () {

  // Validar si el usuario ha iniciado sesión
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    window.location.href = "/logins/index.html";
    return;
  }

  // Prevenir que el usuario vuelva atrás después de cerrar sesión
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function () {
    window.history.pushState(null, "", window.location.href);
  };

  // Obtener y mostrar solo los viajes con fecha de salida futura
  fetch("http://localhost:8080/pruebaApi/api/viajes")
    .then(response => response.json())
    .then(data => {
      const contenedor = document.getElementById("contenedor-viajes");
      const mensaje = document.getElementById("mensaje-vacio");

      // Obtener la fecha actual (sin hora)
      const hoy = new Date();

      // Filtrar solo viajes con fecha_salida futura
      const viajesFuturos = data.filter(viaje => {
        const fechaSalida = new Date(viaje.fecha_salida);
        return fechaSalida > hoy;
      });

      if (viajesFuturos.length === 0) {
        mensaje.style.display = "block";
        return;
      }

      viajesFuturos.forEach(viaje => {
        const card = document.createElement("div");
        card.classList.add("viaje-card");

        card.innerHTML = `
          <h3>${viaje.nombre_transporte}</h3>
          <p>Origen: ${viaje.nombre_ciudad_origen}</p>
          <p>Destino: ${viaje.nombre_ciudad_destino}</p>
          <p>Salida: ${new Date(viaje.fecha_salida).toLocaleString()}</p>
          <button class="btn-viajar">Viajar</button>
        `;

        const botonViajar = card.querySelector(".btn-viajar");
        botonViajar.addEventListener("click", function () {
          const queryParams = new URLSearchParams({
            id: viaje.id_viaje
          }).toString();
          window.location.href = `vistaReserva.html?${queryParams}`;
        });

        contenedor.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Error al obtener los viajes:", error);
      const mensaje = document.getElementById("mensaje-vacio");
      mensaje.textContent = "Hubo un error al cargar los viajes.";
      mensaje.style.display = "block";
    });

  // Cerrar sesión
  document.getElementById("cerrarSesion").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "../../logins/html/index.html";
  });

  // Mostrar nombre del usuario
  const spanNombre = document.getElementById("usuario-nombre");
  if (spanNombre && usuario) {
    spanNombre.textContent = `Bienvenido, ${usuario.nombre || usuario.correo || 'Usuario'}`;
  }

});

