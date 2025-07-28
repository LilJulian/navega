// Espera a que todo el contenido del DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function () {
  // Obtiene el parámetro 'id_reserva' de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const idReserva = urlParams.get("id_reserva");

  // Si no hay un id de reserva en la URL, muestra un mensaje de error
  if (!idReserva) {
    document.getElementById("mensaje-vacio").textContent = "No se proporcionó una reserva válida.";
    document.getElementById("mensaje-vacio").style.display = "block";
    return;
  }

  // Realiza una solicitud GET para obtener los boletos asociados a la reserva
  fetch(`http://localhost:8080/pruebaApi/api/boletos/reserva/${idReserva}`)
    .then(res => res.json()) // Convierte la respuesta en formato JSON
    .then(boletos => {
      const contenedor = document.getElementById("contenedor-boletos");
      const mensaje = document.getElementById("mensaje-vacio");

      // Si no hay boletos para esta reserva, muestra un mensaje informando al usuario
      if (!boletos || boletos.length === 0) {
        mensaje.style.display = "block";
        return;
      }

      // Recorre la lista de boletos obtenida del servidor
      boletos.forEach((boleto, index) => {
        // Crea un contenedor individual para cada boleto
        const div = document.createElement("div");
        div.classList.add("boleto-card");

        // Inserta los datos del boleto en formato HTML dentro del contenedor
        div.innerHTML = `
          <h4>Boleto #${index + 1}</h4>
          <p><strong>Pasajero:</strong> ${boleto.nombre_pasajero}</p>
          <p><strong>Asiento:</strong> ${boleto.asiento}</p>
          <p><strong>ID Adicional:</strong> ${boleto.id_adicional}</p>
        `;

        // Crea un botón para descargar el boleto como PDF
        const btn = document.createElement("button");
        btn.textContent = "Descargar PDF";

        // Asocia el evento click al botón para generar el PDF del boleto
        btn.addEventListener("click", () => {
          generarPDF(boleto, index + 1);
        });

        // Agrega el botón al contenedor del boleto y luego lo agrega al contenedor principal
        div.appendChild(btn);
        contenedor.appendChild(div);
      });
    })
    .catch(error => {
      // Si ocurre un error al obtener los boletos, se muestra un mensaje en pantalla
      console.error("Error al obtener los boletos:", error);
      const mensaje = document.getElementById("mensaje-vacio");
      mensaje.textContent = "Error al cargar los boletos.";
      mensaje.style.display = "block";
    });

  // Función para generar un archivo PDF con los datos del boleto usando jsPDF
  function generarPDF(boleto, numero) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Encabezado del PDF
    doc.setFontSize(16);
    doc.text("Boleto de Viaje", 20, 20);

    // Contenido del PDF con los datos del boleto
    doc.setFontSize(12);
    doc.text(`Número: ${numero}`, 20, 40);
    doc.text(`Pasajero: ${boleto.nombre_pasajero}`, 20, 50);
    doc.text(`Asiento: ${boleto.asiento}`, 20, 60);
    doc.text(`ID Adicional: ${boleto.id_adicional}`, 20, 70);
    doc.text(`ID Reserva: ${boleto.id_reserva}`, 20, 80);
    doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 20, 100);

    // Guarda el archivo PDF con un nombre único
    doc.save(`boleto_${boleto.id_boleto || numero}.pdf`);
  }
});
