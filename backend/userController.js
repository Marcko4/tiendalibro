const bcrypt = require("bcryptjs");
const pool = require("./db");

// Registrar alquiler
exports.registrarAlquiler = async (req, res) => {
  try {
    const { username, titulo, cantidad } = req.body;
    if (!username || !titulo || !cantidad) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    await pool.query(
      'INSERT INTO alquileres (username, titulo, cantidad) VALUES ($1, $2, $3)',
      [username, titulo, cantidad]
    );
    res.json({ success: true, message: 'Alquiler registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar alquiler' });
  }
};

// Obtener todos los alquileres (solo para empleados)
exports.getAlquileres = async (req, res) => {
  try {
    // Permitir por header x-rol o query rol
    const rol = req.headers['x-rol'] || req.query.rol;
    if (rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const result = await pool.query('SELECT username, titulo, cantidad, fecha_alquiler FROM alquileres ORDER BY fecha_alquiler DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alquileres' });
  }
};

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
    res.json({ success: true, username: user.rows[0].username, rol: user.rows[0].rol });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};
