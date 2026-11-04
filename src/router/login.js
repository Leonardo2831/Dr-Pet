const express = require('express');
const router = express.Router();
const db = require('../database/mysql').promise();

const criptografia = require('../utils/Criptografia');
const { enviarCodigo, AVISO_DEV } = require('../utils/enviarCodigo');
const { iniciarSessao } = require('../utils/sessao');

const MENSAGENS_GOOGLE = {
    'google-cancelado': 'Login com Google cancelado.',
    'google-erro': 'Não foi possível entrar com o Google. Tente novamente.',
    'google-indisponivel': 'Login com Google não está configurado neste ambiente.',
    'google-email-nao-verificado': 'O e-mail da sua conta Google não está verificado.'
};

router.get('/login', (req, res) => {
    const { msg } = req.query;
    const dados = {};
    if (msg === 'senha-alterada') dados.info = 'Senha alterada com sucesso! Entre com a nova senha.';
    if (MENSAGENS_GOOGLE[msg]) dados.erro = MENSAGENS_GOOGLE[msg];
    res.render('login', dados);
});

router.post('/loginAction', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const falhar = (status, erro) => res.status(status).render('login', { erro });

    try {
        const [results] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        const usuario = results[0];

        if (!usuario) return falhar(401, 'E-mail ou senha incorretos.');

        if (!usuario.senha) {
            return falhar(401, 'Esta conta foi criada com o Google. Use "Login com Google" ou recupere a senha para criar uma.');
        }

        if (!criptografia.checkHash(password, usuario.senha)) {
            return falhar(401, 'E-mail ou senha incorretos.');
        }

        // E-mail ainda não confirmado: envia um código novo e leva para a tela de confirmação
        if (!usuario.email_verificado) {
            const envio = await enviarCodigo(usuario, 'verificar_email');
            req.session.verificacaoPendente = { usuarioId: usuario.id, email: usuario.email };
            if (!envio.ok && envio.erro === 'aguarde') {
                req.session.verificacaoInfo = 'Use o código que já enviamos para o seu e-mail.';
            } else if (envio.dev) {
                req.session.verificacaoInfo = AVISO_DEV;
            }
            return req.session.save(() => res.redirect('/verificar-email'));
        }

        iniciarSessao(req, usuario, (err) => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.status(500).send('Erro interno ao tentar fazer login.');
            }
            res.redirect('/');
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).send('Erro interno ao tentar fazer login.');
    }
});

router.get('/logout', (req, res) => {
    // remove a session
    req.session.destroy((err) => {
        if (err) console.log("Erro ao encerrar sessão:", err);
        res.redirect('/');
    });
});

module.exports = router;
