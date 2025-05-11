const bcrypt = require("bcryptjs");
const pool = require("./db");

exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ error: "Datos incompletos" });
  try {
    const userExists = await pool.query(
      "SELECT id FROM usuarios WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (userExists.rows.length > 0)
      return res.status(409).json({ error: "Usuario o email ya existe" });
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO usuarios (username, password, email) VALUES ($1, $2, $3)",
      [username, hash, email]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Datos incompletos" });
  try {
    const user = await pool.query("SELECT * FROM usuarios WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid)
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    res.json({ success: true, username: user.rows[0].username });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};
