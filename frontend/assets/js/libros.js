// Lógica para agregar y eliminar libros desde la vista de administración

// Cambiar todas las URLs absolutas a rutas relativas para funcionar en local y en dev tunnel

document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();

  document.getElementById("agregar-libro-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const resp = await fetch("/api/libros", {
      method: "POST",
      body: formData
    });
    if (resp.ok) {
      form.reset();
      cargarLibros();
    } else {
      alert("Error al agregar libro");
    }
  });

  // --- Escucha de evento stock-actualizado para recarga en tiempo real global ---
  window.addEventListener("storage", (e) => {
    if (e.key === "stock-actualizado") {
      cargarLibros();
      // Si está visible la sección de informe, recargar informe
      const informeSection = document.getElementById('informe-stock-section');
      if (informeSection && informeSection.style.display !== 'none') {
        renderInformeStock();
      }
    }
  });
});

let librosData = [];
let paginaActual = 1;
const librosPorPagina = 5;

async function cargarLibros() {
  const resp = await fetch("/api/libros");
  librosData = await resp.json();
  renderTablaLibros();
}

function renderTablaLibros() {
  const tbody = document.querySelector("#tabla-libros tbody");
  const inicio = (paginaActual - 1) * librosPorPagina;
  const fin = inicio + librosPorPagina;
  const librosPagina = librosData.slice(inicio, fin);
  tbody.innerHTML = librosPagina.map(libro => `
    <tr>
      <td>${libro.id}</td>
      <td class="editable-td" data-campo="imagen" data-id="${libro.id}">
        <img src="../../images/${libro.imagen}" alt="${libro.titulo}" style="width:50px;">
        <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar imagen">
      </td>
      <td class="editable-td" data-campo="titulo" data-id="${libro.id}">
        <span>${libro.titulo}</span>
        <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar título">
      </td>
      <td class="editable-td" data-campo="autor" data-id="${libro.id}">
        <span>${libro.autor}</span>
        <img src="../../images/lapizEditar.png" class="icono-editar" style="display:none;position:absolute;right:8px;top:8px;width:22px;cursor:pointer;" title="Editar autor">
      </td>
      <td>${Array.isArray(libro.tipo) ? libro.tipo.join(', ') : libro.tipo}</td>
      <td>${libro.precio_venta ?? ''}</td>
      <td>${libro.precio_alquiler ?? ''}</td>
      <td>${libro.stock_venta ?? ''}</td>
      <td>${libro.stock_alquiler ?? ''}</td>
    </tr>
  `).join("");
  renderPaginacionLibros();

  // Lógica para mostrar el ícono de editar y activar edición
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
        if (campo === "imagen") {
          // Abrir input file para cambiar imagen
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async function() {
            const formData = new FormData();
            formData.append("imagen", input.files[0]);
            // Solo actualiza imagen
            const resp = await fetch(`/api/libros/${id}/imagen`, {
              method: "PUT",
              body: formData
            });
            if (resp.ok) cargarLibros();
            else alert("Error al actualizar imagen");
          };
          input.click();
        } else {
          // Editar texto (titulo o autor)
          const span = td.querySelector("span");
          const valorActual = span.textContent;
          const input = document.createElement("input");
          input.type = "text";
          input.value = valorActual;
          input.style.width = "90%";
          input.onblur = async function() {
            if (input.value !== valorActual && input.value.trim() !== "") {
              const body = {};
              body[campo] = input.value.trim();
              const resp = await fetch(`/api/libros/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              });
              if (resp.ok) cargarLibros();
              else alert("Error al actualizar " + campo);
            } else {
              span.style.display = "";
              input.remove();
            }
          };
          input.onkeydown = function(e) {
            if (e.key === "Enter") {
              input.blur();
              e.preventDefault(); // Evitar que el Enter envíe el formulario
            }
          };
          span.style.display = "none";
          td.appendChild(input);
          input.focus();
        }
      });
    });
  }, 100);
}

function renderPaginacionLibros() {
  const paginacion = document.getElementById("paginacion-libros");
  const totalPaginas = Math.ceil(librosData.length / librosPorPagina);
  paginacion.innerHTML = '';
  if (totalPaginas <= 1) return;
  const btnAnt = document.createElement("button");
  btnAnt.textContent = "Anterior";
  btnAnt.disabled = paginaActual === 1;
  btnAnt.onclick = () => { paginaActual--; renderTablaLibros(); };
  paginacion.appendChild(btnAnt);
  const info = document.createElement("span");
  info.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  paginacion.appendChild(info);
  const btnSig = document.createElement("button");
  btnSig.textContent = "Siguiente";
  btnSig.disabled = paginaActual === totalPaginas;
  btnSig.onclick = () => { paginaActual++; renderTablaLibros(); };
  paginacion.appendChild(btnSig);
}

window.editarLibro = function(id) {
  // Buscar el libro actual
  fetch(`/api/libros`)
    .then(resp => resp.json())
    .then(libros => {
      const libro = libros.find(l => l.id === id);
      if (!libro) return alert("Libro no encontrado");
      // Llenar el formulario con los datos del libro
      const form = document.getElementById("agregar-libro-form");
      form.titulo.value = libro.titulo;
      form.autor.value = libro.autor;
      form.precio_venta.value = libro.precio_venta;
      form.precio_alquiler.value = libro.precio_alquiler;
      form.stock_venta.value = libro.stock_venta;
      form.stock_alquiler.value = libro.stock_alquiler;
      form.descripcion.value = libro.descripcion;
      // Guardar el id editando
      form.setAttribute("data-edit-id", id);
      // Cambiar texto del botón
      form.querySelector("button[type='submit']").textContent = "Guardar cambios";
    });
};

// Modificar el submit para editar si corresponde
const form = document.getElementById("agregar-libro-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = form.getAttribute("data-edit-id");
  const formData = new FormData(form);
  if (editId) {
    // Editar libro existente
    // Convertir FormData a objeto
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    const resp = await fetch(`/api/libros/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (resp.ok) {
      form.reset();
      form.removeAttribute("data-edit-id");
      form.querySelector("button[type='submit']").textContent = "Agregar";
      cargarLibros();
    } else {
      alert("Error al editar libro");
    }
  } else {
    // Agregar libro nuevo
    const resp = await fetch("/api/libros", {
      method: "POST",
      body: formData
    });
    if (resp.ok) {
      form.reset();
      cargarLibros();
    } else {
      alert("Error al agregar libro");
    }
  }
});

window.eliminarLibro = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar este libro?")) return;
  const resp = await fetch(`/api/libros/${id}`, { method: "DELETE" });
  if (resp.ok) {
    cargarLibros();
  } else {
    alert("Error al eliminar libro");
  }
}

async function renderInformeStock() {
  const cont = document.getElementById("tabla-informe-stock");
  cont.innerHTML = '<div style="text-align:center;padding:1.5em;">Cargando...</div>';
  const resp = await fetch("/api/libros");
  const libros = await resp.json();
  let html = `<table style='width:100%;border-collapse:separate;border-spacing:0;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(106,137,204,0.10);overflow:hidden;'>
    <thead>
      <tr style='background:#6a89cc;color:#fff;'>
        <th>ID</th>
        <th>Título</th>
        <th>Precio Venta</th>
        <th>Precio Alquiler</th>
        <th>Stock Venta</th>
        <th>Stock Alquiler</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>`;
  for (const libro of libros) {
    html += `<tr data-id="${libro.id}">
      <td>${libro.id}</td>
      <td>${libro.titulo}</td>
      <td><input type='number' value='${libro.precio_venta ?? ''}' style='width:90px;padding:0.2em 0.5em;border:1.5px solid #6a89cc;border-radius:6px;'></td>
      <td><input type='number' value='${libro.precio_alquiler ?? ''}' style='width:90px;padding:0.2em 0.5em;border:1.5px solid #6a89cc;border-radius:6px;'></td>
      <td><input type='number' value='${libro.stock_venta ?? ''}' style='width:70px;padding:0.2em 0.5em;border:1.5px solid #6a89cc;border-radius:6px;'></td>
      <td><input type='number' value='${libro.stock_alquiler ?? ''}' style='width:70px;padding:0.2em 0.5em;border:1.5px solid #6a89cc;border-radius:6px;'></td>
      <td><button class='btn-guardar-stock' style='background:#2980b9;color:#fff;border:none;padding:0.4em 1.2em;border-radius:8px;font-size:1em;font-weight:600;cursor:pointer;'>Guardar</button></td>
    </tr>`;
  }
  html += '</tbody></table>';
  cont.innerHTML = html;
  document.querySelectorAll('.btn-guardar-stock').forEach(btn => {
    btn.onclick = async function() {
      const tr = btn.closest('tr');
      const id = tr.getAttribute('data-id');
      const precio_venta = tr.children[2].querySelector('input').value;
      const precio_alquiler = tr.children[3].querySelector('input').value;
      const stock_venta = tr.children[4].querySelector('input').value;
      const stock_alquiler = tr.children[5].querySelector('input').value;
      const body = { precio_venta, precio_alquiler, stock_venta, stock_alquiler };
      const resp = await fetch(`/api/libros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        btn.textContent = 'Guardado';
        btn.style.background = '#27ae60';
        setTimeout(() => { btn.textContent = 'Guardar'; btn.style.background = '#2980b9'; }, 1200);
      } else {
        btn.textContent = 'Error';
        btn.style.background = '#e74c3c';
        setTimeout(() => { btn.textContent = 'Guardar'; btn.style.background = '#2980b9'; }, 1200);
      }
    };
  });
}

// Descontar stock cuando se compra o alquila un libro desde el carrito
window.descontarStockLibro = async function(id, tipo, cantidad) {
  // tipo: "venta" o "alquiler"
  // cantidad: cantidad a descontar
  const resp = await fetch(`/api/libros/${id}`);
  if (!resp.ok) return;
  const libro = await resp.json();
  let nuevoStock;
  if (tipo === "venta") {
    nuevoStock = Math.max(0, (Number(libro.stock_venta) || 0) - cantidad);
    await fetch(`/api/libros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_venta: nuevoStock })
    });
  } else if (tipo === "alquiler") {
    nuevoStock = Math.max(0, (Number(libro.stock_alquiler) || 0) - cantidad);
    await fetch(`/api/libros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_alquiler: nuevoStock })
    });
  }
  // Opcional: recargar la tabla si quieres ver el cambio reflejado
  cargarLibros();
  // Notificar a otras pestañas
  localStorage.setItem("stock-actualizado", Date.now());
};

// Mostrar la vista correcta al cambiar de sección
const adminLink = document.getElementById('libros-admin-link');
const burbuja = document.getElementById('burbuja-admin-libros');
if (adminLink && burbuja) {
  adminLink.onclick = function(e) {
    e.preventDefault();
    burbuja.style.display = burbuja.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', function(e) {
    if (!adminLink.contains(e.target)) burbuja.style.display = 'none';
  });
}
const btnVistaAdmin = document.getElementById('btn-vista-admin');
const btnVistaInforme = document.getElementById('btn-vista-informe');
if (btnVistaAdmin) {
  btnVistaAdmin.onclick = function() {
    document.getElementById('libros-admin-section').style.display = '';
    document.getElementById('informe-stock-section').style.display = 'none';
    if (burbuja) burbuja.style.display = 'none';
  };
}
if (btnVistaInforme) {
  btnVistaInforme.onclick = function() {
    document.getElementById('libros-admin-section').style.display = 'none';
    document.getElementById('informe-stock-section').style.display = '';
    renderInformeStock();
    if (burbuja) burbuja.style.display = 'none';
  };
}
