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

O PostgreSQL do Supabase guarda os pacientes e mantém as alterações após reiniciar o servidor. `pacientes.json` continua no repositório como referência dos dois registros fictícios incluídos na criação inicial da tabela. Use apenas dados fictícios.

## Conectar ao Supabase

Na pasta `backend`, copie `.env.example` para `.env` e preencha a URL de conexão do PostgreSQL e `DB_SSL=true`. O arquivo `.env` é ignorado pelo Git e não deve ser enviado ao repositório. No Render, configure `DATABASE_URL` e `DB_SSL=true` nas variáveis de ambiente do serviço.

Na primeira execução, crie a tabela e carregue os dados iniciais com:

```bash
cd backend
npm run db:setup
npm start
```

Durante o desenvolvimento, `npm run dev` carrega o `.env` automaticamente. O script de configuração pode ser executado novamente sem duplicar os pacientes iniciais.

## Publicar depois no Render

Crie um **Web Service** conectado a este repositório. Deixe **Root Directory** vazio e configure:

- **Build Command:** `npm install --prefix backend`
- **Start Command:** `npm --prefix backend start`

O servidor usa a variável `PORT` fornecida pelo Render. A interface e a API são servidas no mesmo endereço; por isso não é necessário trocar uma URL no JavaScript. Depois do deploy, abra a URL do serviço e teste cadastro, edição e remoção.
