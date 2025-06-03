// Lógica para agregar y eliminar libros desde la vista de administración

document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();

  document.getElementById("agregar-libro-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const resp = await fetch("http://localhost:3000/api/libros", {
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
});

async function cargarLibros() {
  const resp = await fetch("http://localhost:3000/api/libros");
  const libros = await resp.json();
  const tbody = document.querySelector("#tabla-libros tbody");
  tbody.innerHTML = libros.map(libro => `
    <tr>
      <td>${libro.id}</td>
      <td><img src="../../images/${libro.imagen}" alt="${libro.titulo}" style="width:50px;"></td>
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${Array.isArray(libro.tipo) ? libro.tipo.join(', ') : libro.tipo}</td>
      <td>${libro.precio_venta ?? ''}</td>
      <td>${libro.precio_alquiler ?? ''}</td>
      <td>${libro.stock_venta ?? ''}</td>
      <td>${libro.stock_alquiler ?? ''}</td>
      <td><button onclick="eliminarLibro(${libro.id})">Eliminar</button></td>
    </tr>
  `).join("");
}

window.eliminarLibro = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar este libro?")) return;
  const resp = await fetch(`http://localhost:3000/api/libros/${id}`, { method: "DELETE" });
  if (resp.ok) {
    cargarLibros();
  } else {
    alert("Error al eliminar libro");
  }
}
