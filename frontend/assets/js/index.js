// Carga dinámica de libros y tarjetas desde libros.json
let libros = [];
let current = 0;
let paginaActual = 1;
const librosPorPagina = 6;
let filtroBusqueda = '';

function renderCarousel() {
  if (!libros.length) return;
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = "";
  // Flechas
  const left = document.createElement("button");
  left.className = "carousel-arrow left";
  left.innerHTML = "&#8592;";
  left.onclick = (e) => {
    e.stopPropagation();
    current = (current - 1 + libros.length) % libros.length;
    renderCarousel();
  };
  const right = document.createElement("button");
  right.className = "carousel-arrow right";
  right.innerHTML = "&#8594;";
  right.onclick = (e) => {
    e.stopPropagation();
    current = (current + 1) % libros.length;
    renderCarousel();
  };
  carousel.appendChild(left);
  // Item
  const libro = libros[current];
  const item = document.createElement("div");
  item.className = "carousel-item";
  item.innerHTML = `<img src="../../images/${libro.imagen}" alt="${
    libro.titulo
  }"><div><h3>${libro.titulo}</h3><p>${
    libro.autor
  }</p><p style='font-weight:600;color:#6a89cc;margin-top:1em;'>${precioLibro(
    libro
  )}</p></div>`;
  item.onclick = () =>
    (window.location.href = `detalle.html?libro=${encodeURIComponent(
      libro.imagen
    )}`);
  carousel.appendChild(item);
  carousel.appendChild(right);
}

function precioLibro(libro) {
  // Muestra precio principal (venta o alquiler) en ₲
  if (libro.tipo.includes("venta"))
    return "₲ " + libro.precio_venta.toLocaleString("es-PY");
  if (libro.tipo.includes("alquiler"))
    return "₲ " + libro.precio_alquiler.toLocaleString("es-PY");
  return "";
}

function nextCarousel() {
  if (!libros.length) return;
  current = (current + 1) % libros.length;
  renderCarousel();
}

// Función para eliminar acentos
function eliminarAcentos(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function renderDestacados() {
  const destacados = document.getElementById("libros-destacados");
  // Filtrar libros por búsqueda ignorando acentos
  let librosFiltrados = libros;
  if (filtroBusqueda.trim() !== '') {
    const busq = eliminarAcentos(filtroBusqueda.trim().toLowerCase());
    librosFiltrados = libros.filter(l =>
      eliminarAcentos(l.titulo.toLowerCase()).includes(busq) ||
      eliminarAcentos(l.autor.toLowerCase()).includes(busq)
    );
  }
  const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina) || 1;
  if (paginaActual > totalPaginas) paginaActual = 1;
  const inicio = (paginaActual - 1) * librosPorPagina;
  const fin = inicio + librosPorPagina;
  const librosPagina = librosFiltrados.slice(inicio, fin);
  destacados.innerHTML = `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px;">${librosPagina
    .map(
      (libro) => `
    <div class="libro-tarjeta destacado-grande" onclick="window.location.href='detalle.html?libro=${encodeURIComponent(
      libro.imagen
    )}'">
      <img src="../../images/${libro.imagen}" alt="${
        libro.titulo
      }" class="libro-img-grande">
      <h4 style='margin:0.7em 0 0.3em 0;font-size:1.18em;'>${libro.titulo}</h4>
      <small style="font-size:1.08em;">${libro.autor}</small>
    </div>
  `
    )
    .join("")}</div>`;
  // Controles de paginación SIEMPRE debajo
  destacados.innerHTML += `<div style="width:100%;text-align:center;margin-top:1em;clear:both;">
    <button id="prev-pag" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>
    <span style="margin:0 1em;">Página ${paginaActual} de ${totalPaginas}</span>
    <button id="next-pag" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente</button>
  </div>`;
  document.getElementById("prev-pag").onclick = () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderDestacados();
    }
  };
  document.getElementById("next-pag").onclick = () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderDestacados();
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/libros")
    .then((resp) => resp.json())
    .then((data) => {
      libros = data;
      renderCarousel();
      setInterval(nextCarousel, 3000);
      renderDestacados();
    });
  // Evento para la barra de búsqueda
  const inputBusqueda = document.getElementById('busqueda-libros');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function() {
      filtroBusqueda = this.value;
      paginaActual = 1;
      renderDestacados();
    });
  }
});
