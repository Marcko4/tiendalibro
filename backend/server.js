const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Crear el directorio de facturas si no existe
const facturasDir = path.join(__dirname, '..', 'facturas');
if (!fs.existsSync(facturasDir)) {
  fs.mkdirSync(facturasDir, { recursive: true });
}

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

const userRoutes = require('./userRoutes');
app.use('/api', userRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));
