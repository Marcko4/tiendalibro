const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require('./userRoutes');
app.use('/api', userRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));
