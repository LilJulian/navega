let ciudades = [];
let modoEdicion = false;
let idViajeEditar = null;

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del DOM
    const form = document.getElementById("formViaje");
    const selectCiudadOrigen = document.getElementById("id_ciudad_origen");
    const selectCiudadDestino = document.getElementById("id_ciudad_destino");
    const selectTransporte = document.getElementById("id_transporte");
    const tablaViajes = document.querySelector("#tablaViajes tbody");

    let tipoTransporteActual = null;

    // Carga inicial de datos
    cargarCiudades();
    cargarTransportes();
    cargarViajes();

    // Actualiza tipo de transporte cuando cambia el select
    selectTransporte.addEventListener("change", () => {
        const selected = selectTransporte.options[selectTransporte.selectedIndex];
        tipoTransporteActual = selected?.dataset.tipo || null;
    });

    // Validación cuando se selecciona ciudad
    selectCiudadOrigen.addEventListener("change", function () {
        actualizarTipoTransporte();
        validarCiudad(this);
        validarIgualdadYPais();
    });

    selectCiudadDestino.addEventListener("change", function () {
        actualizarTipoTransporte();
        validarCiudad(this);
        validarIgualdadYPais();
    });

    // Extrae el tipo de transporte seleccionado
    function actualizarTipoTransporte() {
        const selected = selectTransporte.options[selectTransporte.selectedIndex];
        tipoTransporteActual = selected?.dataset.tipo || null;
    }

    // Verifica que origen y destino no sean iguales y que respeten la lógica del transporte
    function validarIgualdadYPais() {
        const idOrigen = parseInt(selectCiudadOrigen.value);
        const idDestino = parseInt(selectCiudadDestino.value);

        if (!idOrigen || !idDestino) return;

        if (idOrigen === idDestino) {
            Swal.fire("Inválido", "La ciudad de origen y destino no pueden ser la misma.", "warning");
            selectCiudadDestino.value = "";
            return;
        }

        const ciudadOrigen = ciudades.find(c => c.id_ciudad === idOrigen);
        const ciudadDestino = ciudades.find(c => c.id_ciudad === idDestino);

        if (tipoTransporteActual === "1" && ciudadOrigen && ciudadDestino && ciudadOrigen.pais !== ciudadDestino.pais) {
            Swal.fire("Inválido", "No se puede viajar en bus entre países diferentes.", "warning");
            selectCiudadDestino.value = "";
        }
    }

    // Envío del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const idOrigen = parseInt(selectCiudadOrigen.value);
        const idDestino = parseInt(selectCiudadDestino.value);

        if (!idOrigen || !idDestino) {
            Swal.fire("Error", "Debe seleccionar ciudad de origen y destino", "warning");
            return;
        }

        if (idOrigen === idDestino) {
            Swal.fire("Inválido", "La ciudad de origen y destino no pueden ser la misma.", "warning");
            return;
        }

        const ciudadOrigen = ciudades.find(c => c.id_ciudad === idOrigen);
        const ciudadDestino = ciudades.find(c => c.id_ciudad === idDestino);

        if (tipoTransporteActual === "1" && ciudadOrigen && ciudadDestino && ciudadOrigen.pais !== ciudadDestino.pais) {
            Swal.fire("Inválido", "No se puede viajar en bus entre países diferentes.", "warning");
            return;
        }

        // Construcción del objeto viaje
        const data = {
            id_transporte: parseInt(selectTransporte.value),
            id_ciudad_origen: idOrigen,
            id_ciudad_destino: idDestino,
            fecha_salida: document.getElementById("fecha_salida").value,
            fecha_llegada: document.getElementById("fecha_llegada").value,
            precio_base: parseFloat(document.getElementById("precio_base").value)
        };

        // Modo edición o creación
        if (modoEdicion && idViajeEditar !== null) {
            fetch(`http://localhost:8080/pruebaApi/api/viajes/${idViajeEditar}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    Swal.fire("Actualizado", "Viaje actualizado exitosamente", "success");
                    form.reset();
                    cargarViajes();
                    modoEdicion = false;
                    idViajeEditar = null;
                } else {
                    Swal.fire("Error", "No se pudo actualizar el viaje", "error");
                }
            });
        } else {
            fetch("http://localhost:8080/pruebaApi/api/viajes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.status === 201) {
                    Swal.fire("Éxito", "Viaje creado con éxito", "success");
                    form.reset();
                    cargarViajes();
                } else {
                    Swal.fire("Error", "No se pudo crear el viaje", "error");
                }
            });
        }
    });

    // Carga de ciudades desde la API
    function cargarCiudades() {
        fetch("http://localhost:8080/pruebaApi/api/ciudades")
            .then(res => res.json())
            .then(data => {
                ciudades = data;
                selectCiudadOrigen.innerHTML = "<option value=''>Seleccione una ciudad</option>";
                selectCiudadDestino.innerHTML = "<option value=''>Seleccione una ciudad</option>";

                data.forEach(ciudad => {
                    const option = document.createElement("option");
                    option.value = ciudad.id_ciudad;
                    option.textContent = ciudad.nombre_ciudad;
                    option.dataset.pais = ciudad.pais;
                    option.dataset.tienePuerto = ciudad.tienePuerto ? 1 : 0;
                    option.dataset.tieneAeropuerto = ciudad.tieneAeropuerto ? 1 : 0;
                    option.dataset.tieneTerminal = ciudad.tieneTerminal ? 1 : 0;

                    const option2 = option.cloneNode(true);
                    selectCiudadOrigen.appendChild(option);
                    selectCiudadDestino.appendChild(option2);
                });
            });
    }

    // Carga de transportes activos
    function cargarTransportes() {
        fetch("http://localhost:8080/pruebaApi/api/transportes")
            .then(res => res.json())
            .then(data => {
                selectTransporte.innerHTML = "<option value=''>Seleccione un transporte</option>";
                data.filter(t => t.estado === 1).forEach(t => {
                    const option = document.createElement("option");
                    option.value = t.id_transporte;
                    option.textContent = t.nombre;
                    option.dataset.tipo = t.id_tipoTransporte;
                    selectTransporte.appendChild(option);
                });
            });
    }

    // Carga de viajes y despliegue en tabla
    function cargarViajes() {
        fetch("http://localhost:8080/pruebaApi/api/viajes")
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                tablaViajes.innerHTML = "";
                data.forEach(v => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${v.id_viaje}</td>
                        <td>${v.nombre_transporte}</td>
                        <td>${v.nombre_ciudad_origen}</td>
                        <td>${v.nombre_ciudad_destino}</td>
                        <td>${formatearFecha(v.fecha_salida)}</td>
                        <td>${formatearFecha(v.fecha_llegada)}</td>
                        <td>${v.precio_base}</td>
                        <td>${v.asientos_disponibles}</td>
                        <td>
                            <button onclick="editarViaje(${v.id_viaje})">✏️</button>
                            <button onclick="eliminarViaje(${v.id_viaje})">🗑️</button>
                        </td>
                    `;
                    tablaViajes.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error al cargar viajes:", error);
                Swal.fire("Error", "No se pudieron cargar los viajes", "error");
            });
    }

    function formatearFecha(timestamp) {
        const fecha = new Date(timestamp);
        return fecha.toLocaleString("es-CO");
    }

    // Validación de infraestructura de ciudad según el tipo de transporte
    function validarCiudad(select) {
        const option = select.options[select.selectedIndex];
        if (!tipoTransporteActual || !option.value) return;

        const tienePuerto = Number(option.dataset.tienePuerto) === 1;
        const tieneAeropuerto = Number(option.dataset.tieneAeropuerto) === 1;
        const tieneTerminal = Number(option.dataset.tieneTerminal) === 1;

        if (tipoTransporteActual === "1" && !tieneTerminal) {
            Swal.fire("Inválido", "Esta ciudad no tiene terminal terrestre.", "warning");
            select.value = "";
        }

        if (tipoTransporteActual === "2" && !tienePuerto) {
            Swal.fire("Inválido", "Esta ciudad no tiene puerto.", "warning");
            select.value = "";
        }

        if (tipoTransporteActual === "3" && !tieneAeropuerto) {
            Swal.fire("Inválido", "Esta ciudad no tiene aeropuerto.", "warning");
            select.value = "";
        }
    }

    // Función global para editar un viaje existente
    window.editarViaje = function (id) {
        fetch(`http://localhost:8080/pruebaApi/api/viajes/${id}`)
            .then(res => res.json())
            .then(data => {
                const salida = new Date(data.fecha_salida);
                const llegada = new Date(data.fecha_llegada);

                const formatoInput = fecha => {
                    const pad = n => n.toString().padStart(2, "0");
                    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
                };

                document.getElementById("fecha_salida").value = formatoInput(salida);
                document.getElementById("fecha_llegada").value = formatoInput(llegada);
                document.getElementById("precio_base").value = data.precio_base;

                selectTransporte.value = data.id_transporte;
                selectCiudadOrigen.value = data.id_ciudad_origen;
                selectCiudadDestino.value = data.id_ciudad_destino;

                actualizarTipoTransporte();

                modoEdicion = true;
                idViajeEditar = id;
                Swal.fire("Modo edición", "Editando viaje #" + id, "info");
            });
    };

    // Función global para eliminar un viaje
    window.eliminarViaje = function (id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:8080/pruebaApi/api/viajes/${id}`, {
                    method: "DELETE"
                })
                .then(res => {
                    if (res.ok) {
                        Swal.fire("Eliminado", "Viaje eliminado correctamente", "success");
                        cargarViajes();
                    } else {
                        Swal.fire("Error", "No se pudo eliminar el viaje", "error");
                    }
                });
            }
        });
    };
});
