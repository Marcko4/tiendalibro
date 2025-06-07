// Solo lógica para editar stock y precios, igual a la lógica de libros.js pero solo para esos campos

document.addEventListener("DOMContentLoaded", () => {
  cargarLibrosInforme();
});

let librosData = [];
let paginaActual = 1;
const librosPorPagina = 5;

async function cargarLibrosInforme() {
  const resp = await fetch("http://localhost:3000/api/libros");
  librosData = await resp.json();
  renderTablaInforme();
}

function renderTablaInforme() {
  const tbody = document.querySelector("#tabla-libros tbody");
  const inicio = (paginaActual - 1) * librosPorPagina;
  const fin = inicio + librosPorPagina;
  const librosPagina = librosData.slice(inicio, fin);

  tbody.innerHTML = librosPagina.map(libro => {
    const estadoVenta = (Number(libro.stock_venta) > 3)
      ? '<span style="color:green;font-weight:bold;">OK</span>'
      : '<span style="color:red;font-weight:bold;">Bajo</span>';
    const estadoAlquiler = (Number(libro.stock_alquiler) > 3)
      ? '<span style="color:green;font-weight:bold;">OK</span>'
      : '<span style="color:red;font-weight:bold;">Bajo</span>';
    return `
      <tr data-id="${libro.id}">
        <td>${libro.id}</td>
        <td><img src="../../images/${libro.imagen}" alt="${libro.titulo}" style="width:50px;"></td>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${Array.isArray(libro.tipo) ? libro.tipo.join(', ') : libro.tipo}</td>
        <td class="editable-td" data-campo="precio_venta" data-id="${libro.id}">
          <span>${libro.precio_venta ?? ''}</span>
          <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar precio venta">
        </td>
        <td class="editable-td" data-campo="precio_alquiler" data-id="${libro.id}">
          <span>${libro.precio_alquiler ?? ''}</span>
          <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar precio alquiler">
        </td>
        <td class="editable-td" data-campo="stock_venta" data-id="${libro.id}">
          <span>${libro.stock_venta ?? ''}</span>
          <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar stock venta">
        </td>
        <td class="editable-td" data-campo="stock_alquiler" data-id="${libro.id}">
          <span>${libro.stock_alquiler ?? ''}</span>
          <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar stock alquiler">
        </td>
        <td>${estadoVenta}</td>
        <td>${estadoAlquiler}</td>
        <td></td>
      </tr>
    `;
  }).join("");

  // Lógica para mostrar el ícono de editar y activar edición SOLO para precios y stock
  setTimeout(() => {
    document.querySelectorAll(".editable-td").forEach(td => {
      td.style.position = "relative";
      td.addEventListener("mouseenter", function() {
        this.querySelector(".icono-editar").style.display = "block";
      });
      td.addEventListener("mouseleave", function() {
        this.querySelector(".icono-editar").style.display = "none";
      });
      td.querySelector(".icono-editar").addEventListener("click", function(e) {
        e.stopPropagation();
        const campo = td.getAttribute("data-campo");
        const id = td.getAttribute("data-id");
        const span = td.querySelector("span");
        const valorActual = span.textContent;
        const input = document.createElement("input");
        input.type = "number";
        input.value = valorActual;
        input.style.width = "90%";
        input.onblur = async function() {
          if (input.value !== valorActual && input.value.trim() !== "") {
            const body = {};
            body[campo] = input.value.trim();
            const resp = await fetch(`http://localhost:3000/api/libros/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
            if (resp.ok) {
              // Solo actualiza el valor cambiado en la tabla, no recarga toda la tabla
              span.textContent = input.value.trim();
              span.style.display = "";
              input.remove();
            } else {
              alert("Error al actualizar " + campo);
              span.style.display = "";
              input.remove();
            }
          } else {
            span.style.display = "";
            input.remove();
          }
        };
        input.onkeydown = function(e) {
          if (e.key === "Enter") input.blur();
        };
        span.style.display = "none";
        td.appendChild(input);
        input.focus();
      });
    });
  }, 100);

  renderPaginacionLibros();
}

function renderPaginacionLibros() {
  const paginacion = document.getElementById("paginacion-libros");
  const totalPaginas = Math.ceil(librosData.length / librosPorPagina);
  paginacion.innerHTML = '';
  if (totalPaginas <= 1) return;
  const btnAnt = document.createElement("button");
  btnAnt.textContent = "Anterior";
  btnAnt.disabled = paginaActual === 1;
  btnAnt.onclick = () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderTablaInforme();
    }
  };
  paginacion.appendChild(btnAnt);
  const info = document.createElement("span");
  info.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  paginacion.appendChild(info);
  const btnSig = document.createElement("button");
  btnSig.textContent = "Siguiente";
  btnSig.disabled = paginaActual === totalPaginas;
  btnSig.onclick = () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderTablaInforme();
    }
  };
  paginacion.appendChild(btnSig);
}
