const pool = require('./db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();

// Crear el directorio de facturas si no existe
const facturasDir = path.join(__dirname, '..', 'facturas');
if (!fs.existsSync(facturasDir)) {
  fs.mkdirSync(facturasDir, { recursive: true });
}

// Crear el directorio de imágenes si no existe
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Middleware para servir archivos PDF
app.use('/api/facturas', express.static(path.join(__dirname, '..', 'facturas')));

// Middleware para servir archivos PDF con nombre específico
app.get('/api/factura/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'facturas', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error al servir el archivo:', err);
      res.status(404).json({ error: 'Factura no encontrada' });
    }
  });
});

app.get('/api/libros', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM libros ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los libros:', error);
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
});

// Endpoint para agregar libro con imagen
app.post('/api/libros', upload.single('imagen'), async (req, res) => {
  let { titulo, autor, tipo, precio_venta, precio_alquiler, descripcion, stock_venta, stock_alquiler } = req.body;
  const imagen = req.file ? req.file.filename : null;
  if (!imagen) {
    return res.status(400).json({ error: 'Imagen requerida' });
  }
  // Si no se especifica tipo, por defecto es ['venta', 'alquiler']
  if (!tipo || tipo.trim() === "") {
    tipo = ['venta', 'alquiler'];
  } else if (typeof tipo === "string") {
    tipo = tipo.split(",").map(t => t.trim());
  }
  try {
    const result = await pool.query(
      'INSERT INTO libros (titulo, autor, imagen, tipo, precio_venta, precio_alquiler, descripcion, stock_venta, stock_alquiler) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [titulo, autor, imagen, tipo, precio_venta, precio_alquiler, descripcion, stock_venta, stock_alquiler]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar libro:', error);
    res.status(500).json({ error: 'Error al agregar libro' });
  }
});

// Endpoint para eliminar un libro
app.delete('/api/libros/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM libros WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ error: 'Error al eliminar libro' });
  }
});

// Servir imágenes de libros
app.use('/images', express.static(imagesDir));

const userRoutes = require('./userRoutes');
app.use('/api', userRoutes);

// Nuevo endpoint para eliminar una factura
app.delete('/api/facturas/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'facturas', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error al eliminar factura:', err);
      return res.status(404).json({ error: 'Factura no encontrada o ya eliminada' });
    }
    res.status(204).send();
  });
});

// Endpoint para actualizar un libro (PUT /api/libros/:id)
app.put('/api/libros/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, autor, tipo, precio_venta, precio_alquiler, descripcion, stock_venta, stock_alquiler, modo } = req.body;
  try {
    const libroActual = await pool.query('SELECT stock_venta, stock_alquiler FROM libros WHERE id = $1', [id]);
    if (libroActual.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    const stockVentaActual = libroActual.rows[0].stock_venta;
    const stockAlquilerActual = libroActual.rows[0].stock_alquiler;

    let nuevoStockVenta = stockVentaActual;
    let nuevoStockAlquiler = stockAlquilerActual;

    // Si viene modo 'set', sobrescribir el stock con el valor recibido
    if (modo === 'set') {
      if (stock_venta !== undefined) nuevoStockVenta = Number(stock_venta);
      if (stock_alquiler !== undefined) nuevoStockAlquiler = Number(stock_alquiler);
    } else {      // Por defecto, restar la cantidad recibida (compra/alquiler)
      if (stock_venta !== undefined) nuevoStockVenta = stockVentaActual - Number(stock_venta);
      if (stock_alquiler !== undefined) nuevoStockAlquiler = stockAlquilerActual - Number(stock_alquiler);
    }

    if (nuevoStockVenta < 0 || nuevoStockAlquiler < 0) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Construir la consulta dinámicamente basada en los campos proporcionados
    const campos = [];
    const valores = [];
    let i = 1;

    if (titulo !== undefined) campos.push(`titulo = $${i++}`), valores.push(titulo);
    if (autor !== undefined) campos.push(`autor = $${i++}`), valores.push(autor);
    if (tipo !== undefined) campos.push(`tipo = $${i++}`), valores.push(tipo);
    if (precio_venta !== undefined) campos.push(`precio_venta = $${i++}`), valores.push(precio_venta);
    if (precio_alquiler !== undefined) campos.push(`precio_alquiler = $${i++}`), valores.push(precio_alquiler);
    if (descripcion !== undefined) campos.push(`descripcion = $${i++}`), valores.push(descripcion);
    if (stock_venta !== undefined) campos.push(`stock_venta = $${i++}`), valores.push(nuevoStockVenta);
    if (stock_alquiler !== undefined) campos.push(`stock_alquiler = $${i++}`), valores.push(nuevoStockAlquiler);

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    const query = `UPDATE libros SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`;
    valores.push(id);

    const result = await pool.query(query, valores);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar el stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
});

app.put('/api/libros/:id/imagen', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'Imagen requerida' });
  }
  const imagen = req.file.filename;
  try {
    const result = await pool.query(
      'UPDATE libros SET imagen = $1 WHERE id = $2 RETURNING *',
      [imagen, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({ error: 'Error al actualizar imagen' });
  }
});

  // Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// Hacer accesibles las carpetas facturas e imagenes
app.use('/facturas', express.static(path.join(__dirname, '..', 'facturas')));
app.use('/imagenes', express.static(path.join(__dirname, '..', 'images')));

// Ruta general para que cualquier URL devuelva index.html SOLO si no es API, imágenes o facturas
app.get(/^\/(?!api|images|imagenes|facturas).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});



const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor backend corriendo en puerto http://localhost:${PORT}`));
