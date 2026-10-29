# Cadastro de pacientes

Projeto da Atividade 06: uma API Express com CRUD de pacientes e uma interface que usa `fetch` para listar, cadastrar, editar e remover.

## Rodar localmente

É necessário ter Node.js instalado. No terminal, a partir da raiz do projeto:

```bash
cd backend
npm install
npm start
```

Abra `http://localhost:3000`. Para reiniciar automaticamente durante o desenvolvimento, use `npm run dev` no lugar de `npm start`.

## Rotas da API

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/pacientes` | Lista os pacientes; aceita `?nome=ana` |
| GET | `/pacientes/total` | Retorna o total |
| GET | `/pacientes/:id` | Busca um paciente |
| POST | `/pacientes` | Cadastra e retorna `201` |
| PUT | `/pacientes/:id` | Atualiza um paciente |
| DELETE | `/pacientes/:id` | Remove e retorna `204` |

POST e PUT recebem JSON com `nome`, `email` e `nascimento` (`AAAA-MM-DD`). O campo `telefone` é opcional. Dados obrigatórios ausentes retornam `400`, e-mail repetido retorna `409`, e ID inexistente retorna `404`.

Os dados iniciais vêm de `pacientes.json`. As alterações ficam somente na memória do servidor e são perdidas quando ele reinicia. Use apenas dados fictícios.

## Publicar depois no Render

Crie um **Web Service** conectado a este repositório. Deixe **Root Directory** vazio e configure:

- **Build Command:** `npm install --prefix backend`
- **Start Command:** `npm --prefix backend start`

O servidor usa a variável `PORT` fornecida pelo Render. A interface e a API são servidas no mesmo endereço; por isso não é necessário trocar uma URL no JavaScript. Depois do deploy, abra a URL do serviço e teste cadastro, edição e remoção.
