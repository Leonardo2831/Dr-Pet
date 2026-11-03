const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

// Formato único usado pela loja e pela página de produto
function formatarProduto(row) {
    return {
        id: row.id,
        name: row.nome,
        category: row.categoria,
        price: Number(row.preco),
        shortDescription: row.short_description,
        imageMain: {
            image: `/produtos/imagem/${row.id}`,
            alt: row.main_alt_image || row.nome
        }
    };
}

function detectarMime(buffer) {
    if (buffer.length > 3 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
    if (buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
    if (buffer.length > 11 && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return 'image/jpeg';
}

function enviarImagem(res, buffer) {
    res.setHeader('Content-Type', detectarMime(buffer));
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(buffer);
}

const COLUNAS = 'id, nome, categoria, preco, short_description, main_alt_image';

router.get('/api/produtos', (req, res) => {
    db.query(`SELECT ${COLUNAS} FROM produto ORDER BY id DESC`, (err, rows) => {
        if (err) {
            console.error('Erro ao listar produtos:', err);
            return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        }
        res.json(rows.map(formatarProduto));
    });
});

router.get('/api/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    db.query(`SELECT ${COLUNAS}, long_description FROM produto WHERE id = ?`, [id], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.status(500).json({ erro: 'Erro ao buscar produto.' });
        }
        if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });

        db.query('SELECT id, alt, ordem FROM produto_image WHERE fk_produto = ? ORDER BY ordem ASC', [id], (errImg, imgRows) => {
            if (errImg) console.error('Erro ao buscar imagens do produto:', errImg);

            const produto = formatarProduto(rows[0]);
            let imagesSlide = (imgRows || []).map(r => ({
                id: r.id,
                alt: r.alt,
                ordem: r.ordem,
                image: `/produtos/slide-imagem/${r.id}`
            }));

            // Produto sem imagens extras: a galeria mostra a imagem principal
            if (imagesSlide.length === 0) {
                imagesSlide = [{ id: 0, alt: produto.imageMain.alt, ordem: 1, image: produto.imageMain.image }];
            }

            res.json({ ...produto, longDescription: rows[0].long_description, imagesSlide });
        });
    });
});

router.get('/produtos/imagem/:id', (req, res) => {
    db.query('SELECT main_image FROM produto WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0 || !rows[0].main_image) return res.status(404).send('Imagem não encontrada');
        enviarImagem(res, rows[0].main_image);
    });
});

router.get('/produtos/slide-imagem/:id', (req, res) => {
    db.query('SELECT image FROM produto_image WHERE id = ?', [req.params.id], (err, rows) => {
        if (err || rows.length === 0 || !rows[0].image) return res.status(404).send('Imagem não encontrada');
        enviarImagem(res, rows[0].image);
    });
});

module.exports = router;
