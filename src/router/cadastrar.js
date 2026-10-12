const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

router.get('/cadastrar', (req, res) => {
    res.render('cadastrar');
});

router.post('/cadastrarAction', (req, res) => {
    const { userName, email, phone, password } = req.body;

    db.query(
        'INSERT INTO usuario (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
        [userName, email, phone, password],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Erro ao cadastrar usuário.");
            }
            res.redirect('/login');
        }
    );
});

module.exports = router;