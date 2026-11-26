const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./banco');

const app = express();
app.use(cors());
app.use(express.json());

const COLUNAS = 'id, nome, email, telefone, nascimento';

function dadosDoPaciente(body) {
  const { nome, email, telefone, nascimento } = body ?? {};
  if ([nome, email, nascimento].some((valor) => typeof valor !== 'string' || !valor.trim())) return null;
  if (telefone !== undefined && typeof telefone !== 'string') return null;
  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone?.trim() ?? '',
    nascimento: nascimento.trim(),
  };
}

function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

function tratarErro(res, erro) {
  console.error(erro);
  if (erro.code === '23505') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

app.get('/pacientes', async (req, res) => {
  try {
    const nome = String(req.query.nome ?? '').trim();
    const resultado = nome
      ? await pool.query(`SELECT ${COLUNAS} FROM pacientes WHERE nome ILIKE $1 ORDER BY id`, [`%${nome}%`])
      : await pool.query(`SELECT ${COLUNAS} FROM pacientes ORDER BY id`);
    res.json(resultado.rows);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.get('/pacientes/total', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT COUNT(*)::int AS total FROM pacientes');
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.get('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido.' });
  try {
    const resultado = await pool.query(`SELECT ${COLUNAS} FROM pacientes WHERE id = $1`, [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.post('/pacientes', async (req, res) => {
  const dados = dadosDoPaciente(req.body);
  if (!dados) return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios.' });
  try {
    const resultado = await pool.query(
      `INSERT INTO pacientes (nome, email, telefone, nascimento)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUNAS}`,
      [dados.nome, dados.email, dados.telefone, dados.nascimento]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.put('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido.' });
  const dados = dadosDoPaciente(req.body);
  if (!dados) return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios.' });
  try {
    const resultado = await pool.query(
      `UPDATE pacientes SET nome = $1, email = $2, telefone = $3, nascimento = $4
       WHERE id = $5 RETURNING ${COLUNAS}`,
      [dados.nome, dados.email, dados.telefone, dados.nascimento, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.delete('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!idValido(id)) return res.status(400).json({ erro: 'ID inválido.' });
  try {
    const resultado = await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ erro: 'Paciente não encontrado.' });
    res.status(204).send();
  } catch (erro) {
    tratarErro(res, erro);
  }
});

app.use(express.static(path.join(__dirname, '../frontend')));

const porta = process.env.PORT || 3000;
app.listen(porta, '0.0.0.0', () => console.log(`Servidor rodando na porta ${porta}`));
