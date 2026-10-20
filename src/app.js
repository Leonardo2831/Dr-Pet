const express = require('express');
//baixar quanto tentar rodar V
const session = require('express-session');
const { loadUser } = require('./router/middlewares');

// rotas
const homeRouter = require('./router/home');
const administradorRouter = require('./router/administrador');
const agendaRouter = require('./router/agenda');
const cadastrarRouter = require('./router/cadastrar');
const formAgendarRouter = require('./router/form-agendar');
const loginRouter = require('./router/login');
const lojaRouter = require('./router/loja');
const optionUserRouter = require('./router/option-user');
const produtoRouter = require('./router/produto');
const servicosRouter = require('./router/servicos');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
    secret: 'chaveDrPet',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(loadUser);

app.use('/', homeRouter);
app.use('/', administradorRouter);
app.use('/', agendaRouter);
app.use('/', cadastrarRouter);
app.use('/', formAgendarRouter);
app.use('/', loginRouter);
app.use('/', lojaRouter);
app.use('/', optionUserRouter);
app.use('/', produtoRouter);
app.use('/', servicosRouter);
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log('Servidor rodando na porta ' + port);
});