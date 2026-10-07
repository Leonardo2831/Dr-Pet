const express = require('express');
const db = require('./router/mysql');
const lojaRouter = require('./router/loja');
const homeRouter = require('./router/home');
const agendaRouter = require('./router/agenda')

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./public'));

app.use('/', homeRouter);
app.use('/', lojaRouter);
app.use('/', agendaRouter);

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