// Muestra el usuario logueado y gestiona el logout
window.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const rol = localStorage.getItem("rol");
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const carritoLink = document.getElementById("carrito-link");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const alquileresLink = document.getElementById("alquileres-link");
  const alquileresVista = document.getElementById("alquileres-vista");
  const librosAdminLink = document.getElementById("libros-admin-link");

  if (username) {
    userInfo.textContent = `Bienvenido, ${username}`; 
    userInfo.style.display = "inline";
    logoutBtn.style.display = "inline";
    if (carritoLink) carritoLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (alquileresLink && rol === "empleado") alquileresLink.style.display = "inline";
    else if (alquileresLink) alquileresLink.style.display = "none";
    if (librosAdminLink && rol === "empleado") librosAdminLink.style.display = "inline";
    else if (librosAdminLink) librosAdminLink.style.display = "none";
  } else {
    userInfo.style.display = "none";
    logoutBtn.style.display = "none";
    if (carritoLink) carritoLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "";
    if (registerLink) registerLink.style.display = "";
    if (alquileresLink) alquileresLink.style.display = "none";
  }

  if (alquileresLink) {
    alquileresLink.onclick = function (e) {
      e.preventDefault();
      window.location.href = "alquileres.html";
    };
  }

  if (librosAdminLink) {
    librosAdminLink.onclick = function (e) {
      e.preventDefault();
      window.location.href = "libros.html";
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = function () {
      localStorage.removeItem("username");
      localStorage.removeItem("carrito");
      window.location.href = "index.html";
    };
  }
});
