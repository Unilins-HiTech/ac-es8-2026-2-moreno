const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// O JSON fornece só os dados iniciais; as alterações ficam em memória.
const pacientes = require('../pacientes.json').map((paciente) => ({ ...paciente }));
let proximoId = Math.max(0, ...pacientes.map((paciente) => paciente.id)) + 1;

function dadosDoPaciente(body) {
  const { nome, email, telefone, nascimento } = body ?? {};
  if ([nome, email, nascimento].some((valor) => typeof valor !== 'string' || !valor.trim())) {
    return null;
  }
  if (telefone !== undefined && typeof telefone !== 'string') return null;
  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone?.trim() ?? '',
    nascimento: nascimento.trim(),
  };
}

function emailJaExiste(email, idIgnorado) {
  return pacientes.some((paciente) => paciente.email === email && paciente.id !== idIgnorado);
}

// READ: lista todos ou filtra pelo nome informado na URL.
app.get('/pacientes', (req, res) => {
  const nome = String(req.query.nome ?? '').toLocaleLowerCase('pt-BR');
  const resultado = pacientes.filter((paciente) => paciente.nome.toLocaleLowerCase('pt-BR').includes(nome));
  res.json(resultado);
});

app.get('/pacientes/total', (req, res) => {
  res.json({ total: pacientes.length });
});

app.get('/pacientes/:id', (req, res) => {
  const paciente = pacientes.find((item) => item.id === Number(req.params.id));
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado.' });
  res.json(paciente);
});

// CREATE: o servidor gera o ID do novo paciente.
app.post('/pacientes', (req, res) => {
  const dados = dadosDoPaciente(req.body);
  if (!dados) return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios.' });
  if (emailJaExiste(dados.email)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });

  const paciente = { id: proximoId++, ...dados };
  pacientes.push(paciente);
  res.status(201).json(paciente);
});

// UPDATE: substitui os dados do paciente encontrado pelo ID.
app.put('/pacientes/:id', (req, res) => {
  const paciente = pacientes.find((item) => item.id === Number(req.params.id));
  if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado.' });

  const dados = dadosDoPaciente(req.body);
  if (!dados) return res.status(400).json({ erro: 'Nome, e-mail e nascimento são obrigatórios.' });
  if (emailJaExiste(dados.email, paciente.id)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });

  Object.assign(paciente, dados);
  res.json(paciente);
});

// DELETE: 204 indica sucesso sem conteúdo na resposta.
app.delete('/pacientes/:id', (req, res) => {
  const indice = pacientes.findIndex((item) => item.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Paciente não encontrado.' });

  pacientes.splice(indice, 1);
  res.status(204).send();
});

// A interface e a API usam o mesmo endereço, inclusive no Render.
app.use(express.static(path.join(__dirname, '../frontend')));

const porta = process.env.PORT || 3000;
app.listen(porta, '0.0.0.0', () => console.log(`Servidor rodando na porta ${porta}`));
