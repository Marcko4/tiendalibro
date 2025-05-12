// Carrito real usando localStorage
function renderCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  const lista = document.getElementById("carrito-lista");
  if (carrito.length === 0) {
    lista.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }
  let total = 0;
  lista.innerHTML = carrito
    .map((item, idx) => {
      let subtotal = (item.precio || 0) * (item.cantidad || 1);
      total += subtotal;
      return `
      <div style='margin-bottom:1em;display:flex;align-items:center;animation:fadein 0.5s;'>
        <img src="../../images/${item.imagen}" alt="${
        item.titulo
      }" style="height:40px;vertical-align:middle;border-radius:4px;margin-right:8px;">
        <b>${item.titulo}</b> <small>(${
        Array.isArray(item.tipo) ? item.tipo.join(", ") : item.tipo
      })</small>
        <input type='number' min='1' value='${
          item.cantidad || 1
        }' onchange='actualizarCantidad(${idx}, this.value)' style='width:60px;margin:0 12px;padding:6px 10px;font-size:1.1em;border:1px solid #b2bec3;border-radius:8px;box-shadow:0 1px 4px #dfe6e9;transition:box-shadow 0.2s;' onfocus="this.style.boxShadow='0 2px 8px #74b9ff'" onblur="this.style.boxShadow='0 1px 4px #dfe6e9'">
        <span style='min-width:80px;display:inline-block;'>₲ ${(
          item.precio || 0
        ).toLocaleString("es-PY")}</span>
        <span style='min-width:100px;display:inline-block;font-weight:600;'>Subtotal: ₲ ${subtotal.toLocaleString(
          "es-PY"
        )}</span>
        <button onclick="eliminarDelCarrito(${idx})" style='margin-left:10px;color:#fff;background:#e74c3c;border:none;padding:2px 8px;border-radius:3px;cursor:pointer;'>Eliminar</button>
      </div>
    `;
    })
    .join("");
  lista.innerHTML += `<div style='text-align:right;font-size:1.2em;font-weight:bold;margin-top:1em;'>Total: ₲ ${total.toLocaleString(
    "es-PY"
  )}</div>`;
}

window.actualizarCantidad = function (idx, nuevaCantidad) {
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  nuevaCantidad = Math.max(1, parseInt(nuevaCantidad) || 1);
  carrito[idx].cantidad = nuevaCantidad;
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
};

window.eliminarDelCarrito = function (idx) {
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  carrito.splice(idx, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
};
document.getElementById("confirmar").onclick = async function () {
  const metodo =
    document.querySelector("input[name=metodoPago]:checked")?.value ||
    "Efectivo";
  localStorage.setItem("metodoPago", metodo);

  // Guardar alquileres en la base de datos
  const username = localStorage.getItem("username");
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  const alquileres = carrito.filter(item => item.tipo === "alquiler");
  for (const item of alquileres) {
    try {
      await fetch("http://localhost:3000/api/alquiler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          titulo: item.titulo,
          cantidad: item.cantidad || 1
        })
      });
    } catch (err) {
      // Puedes mostrar un mensaje de error si quieres
      console.error("Error al registrar alquiler", err);
    }
  }
  window.open("factura.html", "_blank");
};
document.addEventListener("DOMContentLoaded", renderCarrito);
