const express = require('express');
const router = express.Router();
const db = require('../database/mysql'); 

const criptografia = require('../utils/Criptografia');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/loginAction', (req, res) => {
    const { email, password } = req.body;

    db.query(
        'SELECT * FROM usuario WHERE email = ?',
        [email],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Erro interno ao tentar fazer login.");
            }

            if (results.length > 0) {
                const usuarioLogado = results[0];
                const senhaValida = criptografia.checkHash(password, usuarioLogado.senha);

                if (!senhaValida) {
                    return res.status(401).send("Email ou senha incorretos.");
                }

                req.session.usuario = {
                    id: usuarioLogado.id,
                    nome: usuarioLogado.nome,
                    email: usuarioLogado.email,
                    telefone: usuarioLogado.telefone
                };

                req.session.save((err) => {
                    if (err) console.log("Erro ao salvar sessão:", err);
                    console.log("Sessão salva! Redirecionando...", req.session.usuario);
                    res.redirect('/');
                });

            } else {
                res.status(401).send("Email ou senha incorretos.");
            }
        }
    );
});

router.get('/logout', (req, res) => {
    // remove a session
    req.session.destroy((err) => {
        if (err) console.log("Erro ao encerrar sessão:", err);
        res.redirect('/');
    });
});

module.exports = router;
