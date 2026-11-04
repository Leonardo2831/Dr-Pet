const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { detectarMime } = require('../utils/imagem');

// Foto de perfil do usuário (upload feito no site ou importada do Google)
router.get('/avatar/:id', (req, res) => {
    db.query('SELECT avatar FROM usuario WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0 || !rows[0].avatar || rows[0].avatar.length === 0) {
            return res.status(404).send('Avatar não encontrado');
        }
        res.setHeader('Content-Type', detectarMime(rows[0].avatar));
        // a URL recebe ?v=<versão> quando a foto muda, então pode ficar em cache
        res.setHeader('Cache-Control', 'private, max-age=86400');
        res.send(rows[0].avatar);
    });
});

module.exports = router;
