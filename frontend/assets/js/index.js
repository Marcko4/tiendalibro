// Carga dinámica de libros y tarjetas desde libros.json
let libros = [];
let current = 0;
let paginaActual = 1;
const librosPorPagina = 6;

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

function renderDestacados() {
  const destacados = document.getElementById("libros-destacados");
  const totalPaginas = Math.ceil(libros.length / librosPorPagina);
  const inicio = (paginaActual - 1) * librosPorPagina;
  const fin = inicio + librosPorPagina;
  const librosPagina = libros.slice(inicio, fin);
  destacados.innerHTML = librosPagina
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
    .join("");
  // Controles de paginación
  destacados.innerHTML += `<div style="text-align:center;margin-top:1em;">
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
});
