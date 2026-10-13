const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.get('/administrador', (req, res) => {
    res.render('administrador');
});

// Listar todos os slides salvos no MySQL
const getSlidesHandler = (req, res) => {
    db.query('SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC', (err, results) => {
        if (err) {
            console.error('Erro ao buscar slides no MySQL:', err);
            return res.status(500).json({ error: 'Erro ao carregar slides' });
        }
        const slides = results.map(row => ({
            id: row.id,
            alt: row.alt,
            altImage: row.alt,
            order: row.ordem,
            ordem: row.ordem,
            image: `/slides-home/${row.id}/image`,
            imageUrl: `/slides-home/${row.id}/image`
        }));
        res.json(slides);
    });
};
router.get('/slides-home', getSlidesHandler);
router.get('/api/slides-home', getSlidesHandler);

// Servir a imagem em formato BLOB diretamente do banco
const getSlideImageHandler = (req, res) => {
    const { id } = req.params;
    db.query('SELECT image FROM slide_home WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].image);
    });
};
router.get('/slides-home/:id/image', getSlideImageHandler);
router.get('/api/slides-home/:id/image', getSlideImageHandler);

// Criar novo slide gravando o BLOB no MySQL
const postSlideHandler = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const imageBlob = req.file.buffer;
    const alt = req.body.alt || req.file.originalname || 'Slide';
    const ordem = parseInt(req.body.ordem || req.body.order) || 1;

    db.query(
        'INSERT INTO slide_home (image, alt, ordem) VALUES (?, ?, ?)',
        [imageBlob, alt, ordem],
        (err, result) => {
            if (err) {
                console.error('Erro ao salvar slide no MySQL:', err);
                return res.status(500).json({ error: 'Erro ao salvar slide' });
            }

            const newId = result.insertId;
            res.status(201).json({
                id: newId,
                alt,
                altImage: alt,
                order: ordem,
                ordem,
                image: `/slides-home/${newId}/image`,
                imageUrl: `/slides-home/${newId}/image`
            });
        }
    );
};
router.post('/slides-home', upload.single('image'), postSlideHandler);
router.post('/api/slides-home', upload.single('image'), postSlideHandler);

// Atualizar ordem do slide
const patchSlideHandler = (req, res) => {
    const { id } = req.params;
    const ordem = parseInt(req.body.order || req.body.ordem) || 1;

    db.query('UPDATE slide_home SET ordem = ? WHERE id = ?', [ordem, id], (err) => {
        if (err) {
            console.error('Erro ao atualizar ordem do slide:', err);
            return res.status(500).json({ error: 'Erro ao atualizar ordem' });
        }
        res.json({ success: true, id, ordem });
    });
};
router.patch('/slides-home/:id', patchSlideHandler);
router.patch('/api/slides-home/:id', patchSlideHandler);

// Excluir slide
const deleteSlideHandler = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM slide_home WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao deletar slide:', err);
            return res.status(500).json({ error: 'Erro ao deletar slide' });
        }
        res.json({ success: true });
    });
};
router.delete('/slides-home/:id', deleteSlideHandler);
router.delete('/api/slides-home/:id', deleteSlideHandler);

module.exports = router;
