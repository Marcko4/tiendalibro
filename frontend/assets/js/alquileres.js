function eliminarAlquiler(id) {
  fetch(`/api/alquiler/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => {
    if (!res.ok) throw new Error('Error al eliminar el alquiler');
    return res.json();
  })
  .then(data => {
    alert(data.message);
    // Aquí puedes volver a cargar la lista de alquileres si es necesario
  })
  .catch(err => {
    alert(err.message);
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const rol = localStorage.getItem("rol");
  if (rol !== "empleado") return;
  const cont = document.getElementById("alquileres-vista");
  if (!cont) return;
  fetch("/api/alquileres", {
    headers: { "Content-Type": "application/json", "x-rol": rol }
  })
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        cont.innerHTML = '<p>Error al cargar alquileres</p>';
        return;
      }
      let html = `<table style='width:100%;border-collapse:collapse;margin-top:1em;'>
        <thead><tr><th>Usuario</th><th>Título</th><th>Cantidad</th><th>Fecha alquiler</th></tr></thead>
        <tbody>`;
      for (const a of data) {
        html += `<tr><td>${a.username}</td><td>${a.titulo}</td><td>${a.cantidad}</td><td>${a.fecha_alquiler ? new Date(a.fecha_alquiler).toLocaleString() : ''}</td></tr>`;
      }
      html += `<td><button onclick=\"eliminarAlquiler('${a.id}')\">Eliminar</button></td>`;
      cont.innerHTML = html;
    })
    .catch(() => {
      cont.innerHTML = '<p>Error al cargar alquileres</p>';
    });
});