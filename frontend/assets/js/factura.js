function renderFactura() {
  const detalle = document.getElementById("factura-detalle");
  let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
  let numero = "F-0001";
  let fecha = new Date();
  let fechaPedidoStr = fecha.toLocaleDateString("es-PY");
  let cliente = localStorage.getItem("username") || "Invitado";
  let total = carrito.reduce(
    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 1),
    0
  );
  let hayAlquiler = carrito.some((i) => i.tipo === "alquiler");
  let fechaDevolucion = new Date(fecha);
  fechaDevolucion.setMonth(fechaDevolucion.getMonth() + 1);
  let fechaDevolucionStr = fechaDevolucion.toLocaleDateString("es-PY");
  detalle.innerHTML = `
    <div style='display:flex;align-items:center;gap:10px;'>
      <img src="../images/LogoBookHub (1).png" alt="Logo BookHub" style="height:40px;vertical-align:middle;">
      <h2 style='margin-bottom:0;display:inline;'>BookHub</h2>
    </div>
    <div style='font-size:1em;margin-bottom:8px;'>Av. Falsa 123, Asunción, Paraguay</div>
    ${(() => {
      const tieneVenta = carrito.some((i) => i.tipo === "venta");
      const tieneAlquiler = carrito.some((i) => i.tipo === "alquiler");
      if (tieneVenta && tieneAlquiler)
        return `<div style='color:#2980b9;font-weight:bold;margin-bottom:8px;'>Factura por Venta y Alquiler</div>`;
      if (tieneVenta)
        return `<div style='color:#27ae60;font-weight:bold;margin-bottom:8px;'>Factura por Venta</div>`;
      if (tieneAlquiler)
        return `<div style='color:#e67e22;font-weight:bold;margin-bottom:8px;'>Factura por Alquiler</div>`;
      return "";
    })()}

    <p><b>Número:</b> ${numero}</p>
    <p><b>Fecha:</b> ${fechaPedidoStr}</p>
    ${hayAlquiler ? `<p><b>Devolver hasta:</b> ${fechaDevolucionStr}</p>` : ""}
    <p><b>Cliente:</b> ${cliente}</p>
    <p style='font-size:1.1em;'><b>Método de pago:</b> ${
      localStorage.getItem("metodoPago") || "Efectivo"
    }</p>
    <table style='width:100%;margin-top:1em;border-collapse:collapse;'>
      <tr><th style='text-align:left;'>Libro</th><th>Cant.</th><th>Tipo</th><th>Precio unitario</th><th>Subtotal</th></tr>
      ${carrito
        .map(
          (i) =>
            `<tr><td>${i.titulo}</td><td>${i.cantidad || 1}</td><td>${
              i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1)
            }</td><td>₲ ${
              i.precio ? i.precio.toLocaleString("es-PY") : ""
            }</td><td>₲ ${(i.precio * (i.cantidad || 1)).toLocaleString(
              "es-PY"
            )}</td></tr>`
        )
        .join("")}
    </table>
    <p style='margin-top:1em;'><b>Total:</b> ₲ ${total.toLocaleString(
      "es-PY"
    )}</p>
  `;
}
document.addEventListener("DOMContentLoaded", renderFactura);
