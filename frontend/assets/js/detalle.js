// Obtener el parámetro de la URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

fetch("assets/libros.json")
  .then((resp) => resp.json())
  .then((libros) => {
    const imgName = getQueryParam("libro");
    const libro = libros.find((l) => l.imagen === imgName);
    if (!libro) {
      document.getElementById("detalle-container").innerHTML =
        "<p>Libro no encontrado.</p>";
      return;
    }
    let precios = "";
    if (libro.tipo.includes("venta")) {
      precios += `<div><label><input type='radio' name='tipoTrans' value='venta' checked> Venta: <b>₲ ${libro.precio_venta.toLocaleString(
        "es-PY"
      )}</b> (${libro.stock_venta} en stock)</label></div>`;
    }
    if (libro.tipo.includes("alquiler")) {
      precios += `<div><label><input type='radio' name='tipoTrans' value='alquiler' ${
        libro.tipo.length === 1 ? "checked" : ""
      }> Alquiler: <b>₲ ${libro.precio_alquiler.toLocaleString("es-PY")}</b> (${
        libro.stock_alquiler
      } disponibles)</label></div>`;
    }
    document.getElementById("detalle-container").innerHTML = `
      <img class="detalle-img" src="../../images/${libro.imagen}" alt="${
      libro.titulo
    }">
      <div class="detalle-info">
        <h2>${libro.titulo}</h2>
        <p><b>Autor:</b> ${libro.autor}</p>
        <p><b>Tipo:</b> ${libro.tipo.join(", ")}</p>
        <p>${libro.descripcion}</p>
        <div class="precios">${precios}</div>
        <div style='margin:10px 0;'>
          <label><b>Cantidad:</b> <input id="cantidadLibro" type="number" min="1" value="1" style="width:60px;padding:6px 10px;font-size:1.1em;border:1px solid #b2bec3;border-radius:8px;box-shadow:0 1px 4px #dfe6e9;transition:box-shadow 0.2s;" onfocus="this.style.boxShadow='0 2px 8px #74b9ff'" onblur="this.style.boxShadow='0 1px 4px #dfe6e9'"></label>
        </div>
        <button id="agregarCarrito">Agregar al carrito</button>
      </div>
    `;
    document.getElementById("agregarCarrito").onclick = function () {
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
  });
