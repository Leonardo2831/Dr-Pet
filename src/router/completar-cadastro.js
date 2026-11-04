const express = require('express');
const router = express.Router();
const db = require('../database/mysql').promise();

const criptografia = require('../utils/Criptografia');
const { senhaValida } = require('../utils/sessao');
const { verificarLogin } = require('./middlewares');

function telaCompletar(req, res, extra = {}) {
    const { nome, email } = req.session.usuario;
    res.render('auth-simples', {
        titulo: 'Complete seu cadastro',
        descricao: `Olá, ${nome}! Sua conta (${email}) foi criada com o Google. Para finalizar, informe seu telefone e crie uma senha. Assim você também poderá entrar com e-mail e senha.`,
        acao: '/completar-cadastro',
        campos: [
            {
                name: 'telefone', label: 'Telefone', type: 'tel', autocomplete: 'tel', dataInput: 'formatPhone',
                placeholder: '(XX) XXXXX-XXXX', minlength: 14, maxlength: 15,
                pattern: '^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$',
                title: 'Digite um telefone válido com DDD. Ex: (11) 99999-9999',
                value: extra.telefone || ''
            },
            { name: 'password', label: 'Senha', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 60 },
            { name: 'confirmPassword', label: 'Confirmar senha', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 60 }
        ],
        botao: 'Concluir',
        voltarHref: '/logout',
        voltarTexto: 'Sair',
        erro: extra.erro
    });
}

router.get('/completar-cadastro', verificarLogin, (req, res) => {
    // Cadastro já completo: nada a fazer aqui
    if (!req.session.usuario.perfilIncompleto) return res.redirect('/');
    telaCompletar(req, res);
});

router.post('/completar-cadastro', verificarLogin, async (req, res) => {
    const telefone = String(req.body.telefone || '').replace(/\D/g, '');
    const { password, confirmPassword } = req.body;

    const falhar = (erro) => {
        res.status(400);
        telaCompletar(req, res, { erro, telefone: req.body.telefone });
    };

    if (telefone.length < 10 || telefone.length > 11) return falhar('Informe um telefone válido com DDD.');
    if (!senhaValida(password)) return falhar('A senha deve ter de 8 a 60 caracteres.');
    if (password !== confirmPassword) return falhar('As senhas não coincidem.');

    try {
        await db.query(
            'UPDATE usuario SET telefone = ?, senha = ? WHERE id = ?',
            [telefone, criptografia.generateHash(password), req.session.usuario.id]
        );

        req.session.usuario.telefone = telefone;
        req.session.usuario.perfilIncompleto = false;
        req.session.save(() => res.redirect('/'));
    } catch (err) {
        console.error('Erro ao completar cadastro:', err);
        res.status(500).send('Erro ao salvar seus dados. Tente novamente.');
    }
});

module.exports = router;
