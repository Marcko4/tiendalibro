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
    const result = await pool.query('SELECT * FROM libros');
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));
