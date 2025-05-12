// Script para Vista de Alquileres (solo para empleados)
document.addEventListener("DOMContentLoaded", function () {
  const rol = localStorage.getItem("rol");
  if (rol !== "empleado") return;
  const cont = document.getElementById("alquileres-vista");
  if (!cont) return;
  fetch("http://localhost:3000/api/alquileres", {
    headers: { "Content-Type": "application/json", "x-rol": rol }
  })
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        cont.innerHTML = '<p>Error al cargar alquileres</p>';
        return;
      }
      let html = `<table class='tabla-alquileres'>
        <thead><tr><th>Usuario</th><th>Título</th><th>Cantidad</th><th>Fecha alquiler</th></tr></thead>
        <tbody>`;
      for (const a of data) {
        html += `<tr><td>${a.username}</td><td>${a.titulo}</td><td>${a.cantidad}</td><td>${a.fecha_alquiler ? new Date(a.fecha_alquiler).toLocaleString() : ''}</td></tr>`;
      }
      html += '</tbody></table>';
      cont.innerHTML = html;
    })
    .catch(() => {
      cont.innerHTML = '<p>Error al cargar alquileres</p>';
    });
});
