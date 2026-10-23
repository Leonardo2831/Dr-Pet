const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { verificarLogin } = require('./middlewares');

router.get('/form-agendar', verificarLogin, (req, res) => {
    const userId = req.session && req.session.usuario ? req.session.usuario.id : null;

    if (!userId) {
        return res.render('form-agendar', { enderecoFormatado: '' });
    }

    return res.render('form-agendar', {});
});

module.exports = router;