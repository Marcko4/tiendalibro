const express = require('express');
const router = express.Router();
const userController = require('./userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/alquiler', userController.registrarAlquiler);

module.exports = router;
