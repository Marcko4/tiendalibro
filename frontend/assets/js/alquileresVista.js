document.addEventListener("DOMContentLoaded", function () {
  const rol = localStorage.getItem("rol");
  if (rol !== "empleado") return;

  const cont = document.getElementById("alquileres-vista");
  const filtros = document.getElementById("filtros-alquileres");
  if (!cont || !filtros) return;

  let alquileresData = [];

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
      return;
    }

    let html = `<table style='width:100%;border-collapse:collapse;margin-top:1em;'>
      <thead>
        <tr>
          <th style="border:1px solid #ccc;padding:8px;">Usuario</th>
          <th style="border:1px solid #ccc;padding:8px;">Título</th>
          <th style="border:1px solid #ccc;padding:8px;">Cantidad</th>
          <th style="border:1px solid #ccc;padding:8px;">Fecha alquiler</th>
          <th style="border:1px solid #ccc;padding:8px;">Acción</th>
        </tr>
      </thead>
      <tbody>`;
    for (const a of data) {
      html += `<tr data-id="${a.id}">
        <td style="border:1px solid #ccc;padding:8px;">${a.username}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.titulo}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.cantidad}</td>
        <td style="border:1px solid #ccc;padding:8px;">${a.fecha_alquiler ? new Date(a.fecha_alquiler).toLocaleString() : ''}</td>
        <td style="border:1px solid #ccc;padding:8px;">
          <button class="btn-eliminar" data-id="${a.id}">Eliminar</button>
        </td>
      </tr>`;
    }
    html += '</tbody></table>';
    cont.innerHTML = html;

    // Agregar evento de clic a los botones de eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");

        // Confirmar eliminación
        if (confirm("¿Estás seguro de eliminar este alquiler?")) {
          fetch(`http://localhost:3000/api/alquileres/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "x-rol": rol }
          })
            .then(res => {
              if (res.ok) {
                // Eliminar la fila de la tabla en el frontend
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
      });
    });
  }

  // Filtro
  document.getElementById("btn-filtrar").addEventListener("click", () => {
    const usuario = document.getElementById("filtro-usuario").value.toLowerCase();
    const titulo = document.getElementById("filtro-titulo").value.toLowerCase();

    const filtrados = alquileresData.filter(a =>
      a.username.toLowerCase().includes(usuario) &&
      a.titulo.toLowerCase().includes(titulo)
    );

    renderTabla(filtrados);
  });
});
