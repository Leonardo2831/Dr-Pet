const express = require('express');
const db = require('./database/mysql');

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

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./public'));

app.use('/', homeRouter);
app.use('/', administradorRouter);
app.use('/', agendaRouter);
app.use('/', cadastrarRouter);
app.use('/', formAgendarRouter);
app.use('/', loginRouter);
app.use('/', lojaRouter);
app.use('/', optionUserRouter);
app.use('/', produtoRouter);

try{
    db.connect((err) => {
        if (err) {
            console.log('Erro ao conectar ao banco de dados');
            console.log(err);
        } else {
            console.log('Conectado ao banco de dados');
            app.listen(port, () => {
                console.log('Servidor rodando na porta ' + port);
            });
        }
    });
} catch(err) {
    console.log(err);
}