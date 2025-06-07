const express = require('express');
const router = express.Router();
const userController = require('./userController');
const pdfController = require('./pdfController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/alquiler', userController.registrarAlquiler);
router.get('/alquiler/:id', userController.getAlquiler);
router.get('/alquileres', userController.getAlquileres);
router.delete('/alquileres/:id', userController.eliminarAlquiler);
router.post('/generate-pdf', pdfController.generateInvoice);
// No es necesario agregar rutas aquí para el descuento de stock.
// El descuento de stock se realiza mediante las rutas de la API de libros (por ejemplo, /api/libros/:id con método PUT),
// que deben estar definidas en el archivo de rutas correspondiente a libros, no aquí.
module.exports = router;