const express = require('express');
const router = express.Router();

const db = require('../database/mysql');
const { detectarMime } = require('../utils/imagem');

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

// Imagem dos slides da home (pública: é exibida para visitantes; a versão em /administrador/... é só do painel)
router.get('/slides/imagem/:id', (req, res) => {
    db.query('SELECT image FROM slide_home WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0 || !rows[0].image) return res.status(404).send('Imagem não encontrada');
        res.setHeader('Content-Type', detectarMime(rows[0].image));
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(rows[0].image);
    });
});

module.exports = router;
