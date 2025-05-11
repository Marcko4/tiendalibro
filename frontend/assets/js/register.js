document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        window.location.href = "login.html";
      } else {
        alert(data.error || "Error al registrar usuario");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });
