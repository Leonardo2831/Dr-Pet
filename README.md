# Dr. Pet

Site de petshop (Node.js + Express + EJS + MySQL + Tailwind).

## Rodando localmente

1. Instale as dependências: `npm install`
2. Copie `copy.env` para `.env` e preencha (banco, e-mail, Google).
3. Crie o banco: `CREATE DATABASE petshop;` e importe `database.sql`.
   - Se o banco já existia de versões antigas, rode `npm run migrate` (idempotente).
4. Inicie: `npm run node` (auto-reload) ou `npm start` em http://localhost:3000
   - `npm run tailwind` recompila o CSS ao editar as classes.

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão MySQL |
| `SESSION_SECRET` | Segredo da sessão (string aleatória longa) |
| `HOST_EMAIL`, `PORT_EMAIL`, `EMAIL_USER`, `EMAIL_PASS` | SMTP para códigos e avisos (Gmail: use senha de app, porta 587) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Login/cadastro com Google |
| `PORT` | Porta do servidor (padrão 3000) |

**Sem SMTP configurado**, fora de produção, os códigos de verificação/recuperação são impressos no console do servidor (`[DEV] ... Código ...`).

## Login com Google

1. Google Cloud Console > APIs e serviços > Credenciais > Criar credenciais > ID do cliente OAuth > *Aplicativo da Web*.
2. Em *URIs de redirecionamento autorizados* adicione `http://localhost:3000/auth/google/callback`.
3. Copie o ID e o segredo do cliente para o `.env`.
4. Na tela de consentimento OAuth (modo teste), adicione seu e-mail em *Usuários de teste*.
