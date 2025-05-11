document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem("carrito");
        localStorage.setItem("username", data.username);
        window.location.href = "index.html";
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });
