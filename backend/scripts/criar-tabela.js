const fs = require('fs');
const path = require('path');
const pool = require('../banco');

async function criarTabela() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tabela "pacientes" pronta.');
  } finally {
    await pool.end();
  }
}

criarTabela().catch((erro) => {
  console.error('Falha ao criar a tabela:', erro.message);
  process.exitCode = 1;
});
