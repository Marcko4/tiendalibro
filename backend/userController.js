const bcrypt = require("bcryptjs");
const pool = require("./db");
const fs = require('fs');
const path = require('path');

// Registrar alquiler
exports.registrarAlquiler = async (req, res) => {
  try {
    const { username, alquileres } = req.body;
    if (!username || !alquileres || !Array.isArray(alquileres)) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    // Insertar múltiples alquileres de una vez
    const values = alquileres.map((alq, idx) => `
      ($1, $2, $3)
    `).join(',');
    
    const result = await pool.query(
      `INSERT INTO alquileres (username, titulo, cantidad) 
       VALUES ${values} RETURNING id`,
      alquileres.flatMap(alq => [username, alq.titulo, alq.cantidad || 1])
    );
    
    const alquilerIds = result.rows.map(row => row.id);
    res.json({ success: true, message: 'Alquileres registrados', alquilerIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar alquileres' });
  }
};
/* Eliminar alquiler */
exports.eliminarAlquiler = async (req, res) => {
  const { id } = req.params;
  const fs = require('fs');
  const path = require('path');
  try {
    // Buscar el path de la factura antes de eliminar
    const resultFactura = await pool.query(
      'SELECT factura_path FROM alquileres WHERE id = $1',
      [id]
    );
    let facturaPath = resultFactura.rows[0]?.factura_path;
    // Eliminar el alquiler
    const result = await pool.query(
      'DELETE FROM alquileres WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }
    // Eliminar el archivo PDF si existe
    if (facturaPath) {
      try {
        fs.unlinkSync(path.resolve(facturaPath));
      } catch (err) {
        // Si ya no existe el archivo, no es crítico
        console.warn('No se pudo eliminar el PDF:', err.message);
      }
    }
    res.json({ success: true, message: 'Alquiler y factura eliminados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar alquiler' });
  }
};


// Obtener todos los alquileres (solo para empleados)
// Obtener un alquiler específico
exports.getAlquiler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, titulo, cantidad, fecha_alquiler, factura_path FROM alquileres WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alquiler' });
  }
};

exports.getAlquileres = async (req, res) => {
  try {
    // Permitir por header x-rol o query rol
    const rol = req.headers['x-rol'] || req.query.rol;
    if (rol !== 'empleado') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const result = await pool.query('SELECT id, username, titulo, cantidad, fecha_alquiler, factura_path FROM alquileres ORDER BY fecha_alquiler DESC');
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
