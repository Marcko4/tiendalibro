const pdf = require('html-pdf');
const path = require('path');
const { imageToBase64 } = require('./utils');
const pool = require('./db');
const fs = require('fs');
const crypto = require('crypto');

exports.generateInvoice = async (req, res) => {
  try {
    const { items, total, metodoPago, username } = req.body;
    
    // Generar nombre único para el archivo
    const date = new Date().toISOString().split('T')[0];
    const uniqueNumber = crypto.randomInt(1000, 9999);
    const fileName = `F-${date}-${uniqueNumber}.pdf`;

    // Convertir logo a base64
    const logoBase64 = imageToBase64('images/LogoBookHub (1).png');
    
    // Crear HTML para la factura
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            background-color: #2c3e50;
            color: white;
            border-radius: 8px 8px 0 0;
          }
          .header img {
            height: 100px;
            margin-bottom: 20px;
            object-fit: contain;
          }
          .invoice-info {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .invoice-info p {
            margin: 8px 0;
            color: #2c3e50;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .items-table th {
            background-color: #2c3e50;
            color: white;
            text-align: left;
            padding: 12px;
            font-weight: bold;
          }
          .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total {
            margin-top: 20px;
            padding: 15px;
            background-color: #2c3e50;
            color: white;
            border-radius: 8px;
            text-align: right;
          }
          .total p {
            margin: 0;
            font-size: 1.2em;
          }
          .payment-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: right;
          }
          .payment-info p {
            margin: 0;
            font-size: 1.1em;
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="BookHub Logo" style="max-height: 60px;">` : ''}
            <h1 style="margin: 0;">BookHub</h1>
            <h3 style="margin: 0; color: #ecf0f1;">Av. Falsa 123, Asunción, Paraguay</h3>
          </div>

          <div class="invoice-info">
            <p><b>Número:</b> ${fileName.replace('.pdf', '')}</p>
            <p><b>Fecha:</b> ${new Date().toLocaleDateString('es-PY')}</p>
            ${items.some(item => item.tipo === 'alquiler') ? 
              `<p><b>Devolver hasta:</b> ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('es-PY')}</p>` : ''}
            <p><b>Cliente:</b> ${username}</p>
            <p style='font-size:1.1em;'><b>Método de pago:</b> ${metodoPago}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Libro</th>
                <th>Cant.</th>
                <th>Tipo</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.titulo}</td>
                  <td>${item.cantidad}</td>
                  <td>${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}</td>
                  <td>₲ ${item.precio ? item.precio.toLocaleString('es-PY') : ''}</td>
                  <td>₲ ${(item.precio * (item.cantidad || 1)).toLocaleString('es-PY')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total: ₲ ${total.toLocaleString('es-PY')}</p>
          </div>

          
        </div>
      </body>
      </html>
    `;
    const filePath = path.join(__dirname, '..', 'facturas', fileName);

    // Generar PDF
    pdf.create(html, {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm'
    }).toBuffer((err, buffer) => {
      if (err) {
        console.error('Error al generar PDF:', err);
        return res.status(500).json({ error: 'Error al generar PDF' });
      }

      // Guardar PDF en disco
      fs.writeFile(filePath, buffer, async (writeErr) => {
        if (writeErr) {
          console.error('Error al guardar PDF:', writeErr);
          return res.status(500).json({ error: 'Error al guardar PDF' });
        }

        try {
          // Actualizar la base de datos con la ruta del PDF usando los IDs de los alquileres
          const alquileres = items.filter(item => item.tipo === 'alquiler');
          if (alquileres.length > 0) {
            // Obtener los IDs de los alquileres recién creados desde el request
            const alquilerIds = req.body.alquilerIds;
            if (!alquilerIds || !Array.isArray(alquilerIds)) {
              console.error('No se recibieron IDs de alquileres');
              throw new Error('IDs de alquileres no proporcionados');
            }

            // Actualizar cada alquiler con la ruta del PDF
            for (const id of alquilerIds) {
              await pool.query(
                'UPDATE alquileres SET factura_path = $1 WHERE id = $2',
                [filePath, id]
              );
            }
          }

          // Enviar el PDF como respuesta
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
          res.send(buffer);
        } catch (err) {
          console.error('Error:', err);
          return res.status(500).json({ error: 'Error al procesar la factura' });
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
