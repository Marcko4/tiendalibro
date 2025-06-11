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
  const loader = document.getElementById("loader-carrito");
  loader.style.display = "flex";
  const metodo =
    document.querySelector("input[name=metodoPago]:checked")?.value ||
    "Efectivo";
  localStorage.setItem("metodoPago", metodo);
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  try {
    // Descontar stock en la tabla libros según tipo y cantidad
    for (const item of carrito) {
      let tipoOperacion = "venta";
      if (
        item.tipo === "alquiler" ||
        item.tipo === "Alquiler" ||
        (Array.isArray(item.tipo) && item.tipo.includes("alquiler"))
      ) {
        tipoOperacion = "alquiler";
      }
      // Llama a la función global para descontar stock (debes tenerla en libros.js)
      if (window.descontarStockLibro) {
        await window.descontarStockLibro(item.id, tipoOperacion, item.cantidad || 1);
      }
    }
    // Generar PDF (que manejará los alquileres)
    await generatePDF(carrito, metodo);
    // Limpiar carrito
    localStorage.removeItem("carrito");
    renderCarrito();
    // Notificar a otras vistas (detalle, admin, informe) que el stock fue actualizado
    localStorage.setItem("stock-actualizado", Date.now());
    window.dispatchEvent(new Event("stock-actualizado"));
  } finally {
    loader.style.display = "none";
  }
};
document.addEventListener("DOMContentLoaded", renderCarrito);

// Se asegura que el stock se descuente en la base de datos al confirmar la compra o alquiler
async function descontarStockLibro(id, tipo, cantidad) {
  try {
    // Siempre enviar la cantidad a descontar y NO el stock final
    const body = { [`stock_${tipo}`]: cantidad };
    const resp = await fetch(`/api/libros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.error(`Error al actualizar el stock del libro con ID ${id}`);
    }
  } catch (error) {
    console.error(`Error de red al intentar actualizar el stock: ${error}`);
  }
}

// Actualiza la lógica para llamar a la función descontarStockLibro
window.descontarStockLibro = descontarStockLibro;
document.getElementById("volver-inicio").onclick = function () {
  window.location.href = "index.html";
};
