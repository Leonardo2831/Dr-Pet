const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

router.get('/loja', (req, res) => {
    db.query(
        'SELECT id, nome, categoria, preco, short_description, main_alt_image FROM produto ORDER BY id DESC',
        (err, rows) => {
            if (err) console.error('Erro ao buscar produtos da loja:', err);

            const products = (rows || []).map(p => ({
                id: p.id,
                name: p.nome,
                category: p.categoria,
                price: Number(p.preco),
                shortDescription: p.short_description,
                imageAlt: p.main_alt_image || p.nome
            }));

            res.render('loja', { tituloDaPagina: 'Dr. Pet | Pet shop', products });
        }
    );
});

module.exports = router;
