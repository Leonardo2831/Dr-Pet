require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { loadUser, exigirPerfilCompleto } = require('./router/middlewares');

// Rotas
const homeRouter = require('./router/home');
const administradorRouter = require('./router/administrador/administrador');
const agendaRouter = require('./router/agenda');
const cadastrarRouter = require('./router/cadastrar');
const formAgendarRouter = require('./router/form-agendar');
const loginRouter = require('./router/login');
const lojaRouter = require('./router/loja');
const optionUserRouter = require('./router/option-user');
const produtoRouter = require('./router/produto');
const apiProdutosRouter = require('./router/api-produtos');
const verificacaoRouter = require('./router/verificacao');
const googleAuthRouter = require('./router/google-auth');
const completarCadastroRouter = require('./router/completar-cadastro');
const avatarRouter = require('./router/avatar');
const servicosRouter = require('./router/servicos');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'chaveDrPet',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(loadUser);
app.use(exigirPerfilCompleto);

// Roteador Home
app.use('/', homeRouter);

// Rotas administrador
app.use('/', administradorRouter);

// Demais módulos
app.use('/', agendaRouter);
app.use('/', cadastrarRouter);
app.use('/', formAgendarRouter);
app.use('/', loginRouter);
app.use('/', verificacaoRouter);
app.use('/', googleAuthRouter);
app.use('/', completarCadastroRouter);
app.use('/', avatarRouter);
app.use('/', lojaRouter);
app.use('/', optionUserRouter);
app.use('/', produtoRouter);
app.use('/', apiProdutosRouter);
app.use('/', servicosRouter);
app.use((req, res) => {
    res.status(404).render('404');
});
// App loaded - updated admin agendamentos routes


app.listen(port, () => {
    console.log('Servidor rodando na porta ' + port);
});
// App loaded - updated admin agendamentos routes
