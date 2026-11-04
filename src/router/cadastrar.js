const express = require('express');
const router = express.Router();
const db = require('../database/mysql').promise();

const criptografia = require('../utils/Criptografia');
const { enviarCodigo, AVISO_DEV } = require('../utils/enviarCodigo');
const { senhaValida, emailValido } = require('../utils/sessao');

router.get('/cadastrar', (req, res) => {
    res.render('cadastrar');
});

router.post('/cadastrarAction', async (req, res) => {
    const userName = String(req.body.userName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').replace(/\D/g, '');
    const { password, confirmPassword } = req.body;

    const falhar = (status, erro) => res.status(status).render('cadastrar', { erro });

    if (userName.length < 3 || userName.length > 150) return falhar(400, 'Informe um nome com pelo menos 3 caracteres.');
    if (!emailValido(email)) return falhar(400, 'Informe um e-mail válido.');
    if (phone.length < 10 || phone.length > 11) return falhar(400, 'Informe um telefone válido com DDD.');
    if (!senhaValida(password)) return falhar(400, 'A senha deve ter de 8 a 60 caracteres.');
    if (password !== confirmPassword) return falhar(400, 'As senhas não coincidem.');

    try {
        const [existentes] = await db.query('SELECT id FROM usuario WHERE email = ?', [email]);
        if (existentes.length > 0) {
            return falhar(409, 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.');
        }

        const [resultado] = await db.query(
            'INSERT INTO usuario (nome, email, telefone, senha, email_verificado) VALUES (?, ?, ?, ?, FALSE)',
            [userName, email, phone, criptografia.generateHash(password)]
        );

        const envio = await enviarCodigo({ id: resultado.insertId, nome: userName, email }, 'verificar_email');

        req.session.verificacaoPendente = { usuarioId: resultado.insertId, email };
        if (envio.dev) req.session.verificacaoInfo = AVISO_DEV;
        req.session.save(() => res.redirect('/verificar-email'));
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(500).send('Erro ao cadastrar usuário.');
    }
});

module.exports = router;
