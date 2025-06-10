// Obtener el parámetro de la URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Cambiar: obtener libros desde el backend
fetch("http://localhost:3000/api/libros")
  .then((resp) => resp.json())
  .then((libros) => {
    function renderDetalle() {
      const imgName = getQueryParam("libro");
      const libro = libros.find((l) => l.imagen === imgName);
      if (!libro) {
        document.getElementById("detalle-container").innerHTML =
          "<p>Libro no encontrado.</p>";
        return;
      }
      let precios = "";
      const tipoArr = Array.isArray(libro.tipo)
        ? libro.tipo
        : typeof libro.tipo === "string"
        ? libro.tipo.split(",").map((t) => t.trim())
        : [];
      let ventaFueraStock = tipoArr.includes("venta") && libro.stock_venta == 0;
      let alquilerFueraStock = tipoArr.includes("alquiler") && libro.stock_alquiler == 0;
      if (tipoArr.includes("venta")) {
        if (libro.stock_venta == 0) {
          precios += `<div><label><input type='radio' name='tipoTrans' value='venta' disabled> Venta: <b>₲ ${Number(
            libro.precio_venta
          ).toLocaleString("es-PY")}</b> <span style="color:red;font-weight:bold;">fuera de stock</span></label></div>`;
        } else {
          precios += `<div><label><input type='radio' name='tipoTrans' value='venta' checked> Venta: <b>₲ ${Number(
            libro.precio_venta
          ).toLocaleString("es-PY")}</b> (${libro.stock_venta} en stock)</label></div>`;
        }
      }
      if (tipoArr.includes("alquiler")) {
        if (libro.stock_alquiler == 0) {
          precios += `<div><label><input type='radio' name='tipoTrans' value='alquiler' disabled> Alquiler: <b>₲ ${Number(
            libro.precio_alquiler
          ).toLocaleString("es-PY")}</b> <span style="color:red;font-weight:bold;">fuera de stock</span></label></div>`;
        } else {
          precios += `<div><label><input type='radio' name='tipoTrans' value='alquiler' ${
            tipoArr.length === 1 || ventaFueraStock ? "checked" : ""
          }> Alquiler: <b>₲ ${Number(
            libro.precio_alquiler
          ).toLocaleString("es-PY")}</b> (${libro.stock_alquiler} disponibles)</label></div>`;
        }
      }
      // Determinar si todos los tipos están fuera de stock
      let fueraStock = (ventaFueraStock && (!tipoArr.includes("alquiler") || alquilerFueraStock)) ||
                       (alquilerFueraStock && (!tipoArr.includes("venta") || ventaFueraStock));
      document.getElementById("detalle-container").innerHTML = `
        <img class="detalle-img" src="../../images/${libro.imagen}" alt="${libro.titulo}">
        <div class="detalle-info">
          <h2>${libro.titulo}</h2>
          <p><b>Autor:</b> ${libro.autor}</p>
          <p><b>Tipo:</b> ${tipoArr.join(", ")}</p>
          <p>${libro.descripcion}</p>
          <div class="precios">${precios}</div>
          ${
            !fueraStock
              ? `<div style='margin:10px 0;'>
                  <label><b>Cantidad:</b> <input id="cantidadLibro" type="number" min="1" value="1" style="width:60px;padding:6px 10px;font-size:1.1em;border:1px solid #b2bec3;border-radius:8px;box-shadow:0 1px 4px #dfe6e9;transition:box-shadow 0.2s;" onfocus="this.style.boxShadow='0 2px 8px #74b9ff'" onblur="this.style.boxShadow='0 1px 4px #dfe6e9'"></label>
                </div>`
              : `<div style="margin:10px 0;"><span style="color:red;font-weight:bold;">fuera de stock</span></div>`
          }
          <div style="display:flex;gap:18px;margin-top:18px;">
            <button id="agregarCarrito" ${fueraStock ? 'disabled style="background:#b2bec3;cursor:not-allowed;"' : ''}>Agregar al carrito</button>
            <button id="volver-inicio" style="background:#2d3a4a;color:#fff;padding:10px 24px;border:none;border-radius:8px;font-size:1.1em;font-weight:600;cursor:pointer;transition:background 0.2s;">Volver al inicio</button>
          </div>
        </div>
      `;
      document.getElementById("agregarCarrito").onclick = function () {
        if (fueraStock) return;
        if (!localStorage.getItem("username")) {
          alert("Por favor, regístrese o inicie sesión para continuar");
          return;
        }
        let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
        let tipoTrans = document.querySelector(
          "input[name=tipoTrans]:checked"
        ).value;
        let precio =
          tipoTrans === "venta" ? libro.precio_venta : libro.precio_alquiler;
        let cantidad =
          parseInt(document.getElementById("cantidadLibro").value) || 1;
        carrito.push({
          id: libro.id,
          imagen: libro.imagen,
          titulo: libro.titulo,
          autor: libro.autor,
          tipo: tipoTrans,
          precio: precio,
          cantidad: cantidad,
        });
        localStorage.setItem("carrito", JSON.stringify(carrito));
        alert("¡Libro agregado al carrito!");
      };
    }
    renderDetalle();

    // Escuchar evento personalizado para recargar el detalle tras confirmar compra/alquiler
    window.addEventListener("stock-actualizado", () => {
      fetch("http://localhost:3000/api/libros")
        .then((resp) => resp.json())
        .then((nuevosLibros) => {
          libros.splice(0, libros.length, ...nuevosLibros);
          renderDetalle();
        });
    });

    document.getElementById("volver-inicio").onclick = function () {
      window.location.href = "index.html";
    };
  });
