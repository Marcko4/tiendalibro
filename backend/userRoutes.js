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
module.exports = router;