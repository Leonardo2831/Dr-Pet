const express = require('express');
const router = express.Router();

const db = require('../database/mysql');

router.get('/', (req, res) => {
    db.query('SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC', (err, slides) => {
        if (err) {
            console.error('Erro ao buscar slides para a home:', err);
            return res.render('home', { slides: [] });
        }
        res.render('home', { slides: slides });
    });
});

module.exports = router;