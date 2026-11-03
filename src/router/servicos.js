const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

router.get('/service-infos', (req, res) => {
    db.query('SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar serviços.' });
        return res.status(200).json(results);
    });
});

router.get('/servicos/imagem/:id', (req, res) => {
    db.query('SELECT imagem FROM service_infos WHERE id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0 || !results[0].imagem) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].imagem);
    });
});

module.exports = router;
