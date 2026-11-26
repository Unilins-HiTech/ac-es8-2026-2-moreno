const { Pool, types } = require('pg');

// Mantém DATE como AAAA-MM-DD para não deslocar o dia por fuso horário.
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
