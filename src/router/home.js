const express = require('express');
const router = express.Router();

const db = require('../database/mysql');

router.get('/', (req, res) => {
    db.query('SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC', (err, slides) => {
        if (err) {
            console.error('Erro ao buscar slides para a home:', err);
            slides = [];
        }
        db.query('SELECT id, nome, descricao FROM service_infos ORDER BY id ASC', (err, servicos) => {
            if (err) {
                console.error('Erro ao buscar serviços para a home:', err);
                servicos = [];
            }
            res.render('home', { slides, servicos });
        });
    });
});

module.exports = router;
