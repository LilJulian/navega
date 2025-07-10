const btnToggle = document.getElementById("btnTogglePersonas");
const dropdown = document.getElementById("dropdownPersonas");
const contador = document.getElementById("contador");
const cantidadPersonas = document.getElementById("cantidadPersonas");
const btnSumar = document.getElementById("btnSumar");
const btnRestar = document.getElementById("btnRestar");

let cantidad = 1;

// Check soloIda y vuelta (tu lógica original)
document.getElementById("soloIda").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("vuelta").checked = false;
  }
});

document.getElementById("vuelta").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("soloIda").checked = false;
  }
});

// Flatpickr
flatpickr("#fecha_ida", { dateFormat: "Y-m-d" });
flatpickr("#fecha_vuelta", { dateFormat: "Y-m-d" });

// Toggle dropdown
btnToggle.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Sumar personas
btnSumar.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  cantidad++;
  actualizarContador();
});

// Restar personas
btnRestar.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (cantidad > 1) {
    cantidad--;
    actualizarContador();
  }
});

// Actualizar el contador visual
function actualizarContador() {
  contador.textContent = cantidad;
  cantidadPersonas.textContent = cantidad;
}

// Cerrar el dropdown al hacer clic fuera (solo si NO tocaste botón ni dropdown)
document.addEventListener("click", (e) => {
  if (!btnToggle.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});
