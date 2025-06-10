document.addEventListener("DOMContentLoaded", function () {
  const rol = localStorage.getItem("rol");
  if (rol !== "empleado") return;

  const cont = document.getElementById("alquileres-vista");
  const filtros = document.getElementById("filtros-alquileres");
  if (!cont || !filtros) return;

  let alquileresData = [];
  let paginaActual = 1;
  const alquileresPorPagina = 5;

  fetch("http://localhost:3000/api/alquileres", {
    headers: { "Content-Type": "application/json", "x-rol": rol }
  })
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        cont.innerHTML = '<p>Error al cargar alquileres</p>';
        return;
      }

      alquileresData = data;
      renderTabla(alquileresData);
    })
    .catch(() => {
      cont.innerHTML = '<p>Error al cargar alquileres</p>';
    });

  function renderTabla(data) {
    if (data.length === 0) {
      cont.innerHTML = '<p>No hay alquileres para mostrar.</p>';
      renderPaginacionAlquileres(0);
      return;
    }
    const inicio = (paginaActual - 1) * alquileresPorPagina;
    const fin = inicio + alquileresPorPagina;
    const pageData = data.slice(inicio, fin);
    let html = `<table style='width:100%;border-collapse:collapse;margin-top:1em;'>
      <thead>
        <tr>
          <th style="border:1px solid #ccc;padding:8px;">Usuario</th>
          <th style="border:1px solid #ccc;padding:8px;">Título</th>
          <th style="border:1px solid #ccc;padding:8px;">Cantidad</th>
          <th style="border:1px solid #ccc;padding:8px;">Fecha alquiler</th>
          <th style="border:1px solid #ccc;padding:8px;">Nro Factura</th>
          <th style="border:1px solid #ccc;padding:8px;">Acción</th>
        </tr>
      </thead>
      <tbody>`;
    for (const a of pageData) {
      html += `<tr data-id="${a.id}">
        <td style="border:1px solid #ccc;padding:8px;">${a.username}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.titulo}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.cantidad}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.fecha_alquiler ? new Date(a.fecha_alquiler).toLocaleString() : ''}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.factura_path ? a.factura_path.split(/[\/]/).pop().split('-').pop().replace('.pdf', '') : ''}</td>
        <td style="border:1px solid #ccc;padding:8px;">
          <div style="display:flex; gap:10px; justify-content:center;">
            <button class="btn-eliminar" data-id="${a.id}">Eliminar</button>
            ${a.factura_path ? `<button class="btn-ver-factura" data-id="${a.id}">Ver factura</button>` : ''}
          </div>
        </td>
      </tr>`;
    }
    html += '</tbody></table>';
    cont.innerHTML = html;
    renderPaginacionAlquileres(data.length);

    // Agregar eventos de clic para botones de eliminar y ver factura
    document.querySelectorAll(".btn-eliminar, .btn-ver-factura").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        
        if (btn.classList.contains("btn-eliminar")) {
          if (confirm("¿Estás seguro de eliminar este alquiler?")) {
            fetch(`http://localhost:3000/api/alquileres/${id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json", "x-rol": rol }
            })
            .then(res => {
              if (res.ok) {
                const row = btn.closest("tr");
                row.remove();
              } else {
                alert("Error al eliminar el alquiler");
              }
            })
            .catch(() => {
              alert("Error al eliminar el alquiler");
            });
          }
        } else if (btn.classList.contains("btn-ver-factura")) {
          try {
            // Obtener la información del alquiler
            const response = await fetch(`http://localhost:3000/api/alquiler/${id}`);
            if (!response.ok) {
              throw new Error('Error al obtener el alquiler');
            }
            const alquiler = await response.json();
            
            if (alquiler.factura_path) {
              // Extraer el nombre del archivo del path completo
              const filename = alquiler.factura_path.split(/[\\/]/).pop();
              // Abrir la factura en una nueva pestaña usando la URL del servidor
              window.open(`http://localhost:3000/api/factura/${encodeURIComponent(filename)}`, '_blank');
            } else {
              alert('No hay factura disponible para este alquiler');
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Error al ver la factura');
          }
        }
      });
    });
  }

  function renderPaginacionAlquileres(total) {
    let paginacion = document.getElementById("paginacion-alquileres");
    if (!paginacion) {
      paginacion = document.createElement("div");
      paginacion.id = "paginacion-alquileres";
      paginacion.style.margin = "18px 0 0 0";
      paginacion.style.display = "flex";
      paginacion.style.justifyContent = "center";
      paginacion.style.alignItems = "center";
      paginacion.style.gap = "18px";
      cont.parentNode.appendChild(paginacion);
    }
    const totalPaginas = Math.ceil(total / alquileresPorPagina);
    paginacion.innerHTML = '';
    if (totalPaginas <= 1) return;
    const btnAnt = document.createElement("button");
    btnAnt.textContent = "Anterior";
    btnAnt.disabled = paginaActual === 1;
    btnAnt.onclick = () => { paginaActual--; renderTabla(alquileresData); };
    paginacion.appendChild(btnAnt);
    const info = document.createElement("span");
    info.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    paginacion.appendChild(info);
    const btnSig = document.createElement("button");
    btnSig.textContent = "Siguiente";
    btnSig.disabled = paginaActual === totalPaginas;
    btnSig.onclick = () => { paginaActual++; renderTabla(alquileresData); };
    paginacion.appendChild(btnSig);
  }

  // Estilos para los inputs y botones
  const estiloInput = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '10px',
    maxWidth: '200px'
  };

  const estiloBoton = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px'
  };

  // Estilos específicos para cada tipo de botón
  const estiloBotonFiltrar = {
    ...estiloBoton,
    backgroundColor: '#4CAF50',
    color: 'white'
  };

  const estiloBotonEliminar = {
    ...estiloBoton,
    backgroundColor: '#f44336',
    color: 'white'
  };

  const estiloBotonVerFactura = {
    ...estiloBoton,
    backgroundColor: '#2196F3',
    color: 'white'
  };

  // Aplicar estilos al botón filtrar existente
  const botonFiltrar = document.getElementById('btn-filtrar');
  Object.assign(botonFiltrar.style, estiloBotonFiltrar);

  // Agregar filtro por número de factura
  const filtroFactura = document.createElement('input');
  filtroFactura.type = 'text';
  filtroFactura.id = 'filtro-factura';
  filtroFactura.placeholder = 'Nro Factura (últimos 4 dígitos)';
  Object.assign(filtroFactura.style, estiloInput);
  filtros.insertBefore(filtroFactura, botonFiltrar); // Insertar antes del botón filtrar

  // Alinear los elementos del filtro
  filtros.style.display = 'flex';
  filtros.style.flexWrap = 'wrap';
  filtros.style.justifyContent = 'center';
  filtros.style.gap = '10px';
  filtros.style.marginBottom = '20px';

  // Alinear los inputs existentes
  const inputs = filtros.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    Object.assign(input.style, estiloInput);
  });

  // Función para eliminar acentos
  function eliminarAcentos(str) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Función para filtrar automáticamente
  function filtrarAutomaticamente() {
    const usuario = eliminarAcentos(document.getElementById("filtro-usuario").value.toLowerCase());
    const titulo = eliminarAcentos(document.getElementById("filtro-titulo").value.toLowerCase());
    const nroFactura = document.getElementById("filtro-factura").value;

    const filtrados = alquileresData.filter(a => {
      const matchUsuario = eliminarAcentos(a.username.toLowerCase()).includes(usuario);
      const matchTitulo = eliminarAcentos(a.titulo.toLowerCase()).includes(titulo);
      
      // Si hay número de factura ingresado, verificar los últimos 4 dígitos
      const matchFactura = !nroFactura || 
        (a.factura_path && 
         a.factura_path.split(/[/]/).pop().split('-').pop().replace('.pdf', '').includes(nroFactura));

      return matchUsuario && matchTitulo && matchFactura;
    });

    renderTabla(filtrados);
  }

  // Agregar evento de escucha para los inputs
  const inputsFiltro = document.querySelectorAll('#filtros-alquileres input');
  inputsFiltro.forEach(input => {
    input.addEventListener('input', (e) => {
      // Si el input está vacío, mostrar todos los datos
      if (e.target.value.trim() === '') {
        renderTabla(alquileresData);
      } else {
        filtrarAutomaticamente();
      }
    });
  });

  // Mantener el botón filtrar para cuando quieran aplicar múltiples filtros
  document.getElementById("btn-filtrar").addEventListener("click", filtrarAutomaticamente);
});
