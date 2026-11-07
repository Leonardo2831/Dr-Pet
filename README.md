# Dr. Pet

Site de petshop (Node.js + Express + EJS + MySQL + Tailwind).

## Primeira execução em outro computador

### 1. Instale as dependências

Na pasta do projeto, execute:

```bash
npm install
```

### 2. Prepare o banco de dados

1. Inicie o MySQL.
2. Crie o banco:

```sql
CREATE DATABASE petshop;
```

3. Importe e execute o arquivo `database.sql` no banco `petshop`. Isso pode ser feito pelo MySQL Workbench ou pelo terminal:

```bash
mysql -u root -p petshop < database.sql
```

4. Depois de importar o esquema inicial, execute a migração:

```bash
npm run migrate
```

O `npm run migrate` atualiza a estrutura e pode ser executado novamente sem problema, mas ele não substitui a importação inicial do `database.sql` em um banco vazio.

### 3. Inicie o projeto

Para iniciar normalmente em http://localhost:3000:

```bash
npm start
```

Durante o desenvolvimento, também é possível usar `npm run node` para reiniciar o servidor automaticamente quando arquivos do backend forem alterados.

- Mudanças no `.env` exigem parar e iniciar o servidor novamente.
- Views (`.ejs`), CSS e JavaScript do navegador não precisam de reinício.
- `npm run tailwind` recompila o CSS ao editar as classes.

## Acesso de administrador

O `database.sql` cria uma conta administrativa para acessar o painel:

- E-mail: `adm@hotmail.com`
- Senha: `adm123456`

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão MySQL |
| `SESSION_SECRET` | Segredo da sessão (string aleatória longa) |
| `HOST_EMAIL`, `PORT_EMAIL`, `EMAIL_USER`, `EMAIL_PASS` | SMTP para códigos e avisos (Gmail: use senha de app, porta 587) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Login/cadastro com Google |
| `PORT` | Porta do servidor (padrão 3000) |
| `APP_URL` | Endereço público do site, usado nos links enviados por e-mail (ex.: recuperação de senha) |

**Sem SMTP configurado**, fora de produção, o código de verificação de e-mail e o link de recuperação de senha são impressos no console do servidor (`[DEV] ...`).

## Login com Google

1. Google Cloud Console > APIs e serviços > Credenciais > Criar credenciais > ID do cliente OAuth > *Aplicativo da Web*.
2. Em *URIs de redirecionamento autorizados* adicione `http://localhost:3000/auth/google/callback`.
3. Copie o ID e o segredo do cliente para o `.env`.
4. Na tela de consentimento OAuth (modo teste), adicione seu e-mail em *Usuários de teste*.
