// Muestra el usuario logueado y gestiona el logout
window.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const carritoLink = document.getElementById("carrito-link");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  if (username) {
    userInfo.textContent = `Bienvenido, ${username}`; 
    userInfo.style.display = "inline";
    logoutBtn.style.display = "inline";
    if (carritoLink) carritoLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
  } else {
    userInfo.style.display = "none";
    logoutBtn.style.display = "none";
    if (carritoLink) carritoLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "";
    if (registerLink) registerLink.style.display = "";
  }

  if (logoutBtn) {
    logoutBtn.onclick = function () {
      localStorage.removeItem("username");
      localStorage.removeItem("carrito");
      location.reload();
    };
  }
});
