const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../../database/mysql');

const storageSlides = multer.memoryStorage();
const uploadSlide = multer({ storage: storageSlides });

router.get('/administrador/slide-home', (req, res) => {
    const query = 'SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC';
    db.query(query, (err, slides) => {
        if (err) {
            console.error('Erro ao buscar slides:', err);
            return res.status(500).json({ message: 'Erro ao buscar slides.' });
        }
        return res.status(200).json(slides);
    });
});

router.get('/administrador/slide-home/imagem/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT image FROM slide_home WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].image);
    });
});

router.post('/administrador/slide-home', uploadSlide.any(), (req, res) => {
    const file = req.files && req.files[0];

    if (!file) {
        return res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
    }
    const imageBuffer = file.buffer;
    const altText = req.body.alt || 'Slide Dr. Pet';
    const ordem = req.body.ordem ? parseInt(req.body.ordem) : 1;

    const query = 'INSERT INTO slide_home (image, alt, ordem) VALUES (?, ?, ?)';
    db.query(query, [imageBuffer, altText, ordem], (err, result) => {
        if (err) {
            console.error('Erro ao guardar slide BLOB na BD:', err);
            return res.status(500).json({ message: 'Erro ao registar na base de dados.' });
        }

        return res.status(201).json({ 
            message: 'Slide adicionado com sucesso!', 
            id: result.insertId 
        });
    });
});

router.post('/administrador/slide-home/ordem/:id', (req, res) => {
    const { id } = req.params;
    const { ordem } = req.body;

    if (ordem === undefined) {
        return res.status(400).json({ message: 'O campo ordem é obrigatório.' });
    }

    const query = 'UPDATE slide_home SET ordem = ? WHERE id = ?';
    db.query(query, [ordem, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar ordem do slide:', err);
            return res.status(500).json({ message: 'Erro no servidor ao atualizar ordem.' });
        }
        return res.status(200).json({ message: 'Ordem atualizada com sucesso!' });
    });
});

router.post('/administrador/slide-home/delete/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM slide_home WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao excluir do banco:', err);
            return res.status(500).json({ message: 'Erro ao excluir do banco.' });
        }
        return res.status(200).json({ message: 'Slide removido com sucesso!' });
    });
});

module.exports = router;