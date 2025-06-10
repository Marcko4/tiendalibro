const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Cambia por tu usuario de Postgres
  host: 'localhost',
  database: 'tiendalibro', // Cambia por el nombre de tu base
  password: '123456', // Cambia por tu contraseña
  port: 5432,
});

module.exports = pool;
