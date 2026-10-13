const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Página do produto
router.get('/produto', (req, res) => {
    res.render('produto');
});

// Listar todos os produtos
const getProdutosHandler = (req, res) => {
    db.query('SELECT id, nome, categoria, preco, short_description, long_description, main_alt_image FROM produto', (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).json({ error: 'Erro ao carregar produtos' });
        }

        const produtos = results.map(p => ({
            id: p.id,
            name: p.nome,
            category: p.categoria || 'geral',
            price: Number(p.preco),
            shortDescription: p.short_description,
            longDescription: p.long_description,
            imageMain: {
                image: `/produtos/${p.id}/main-image`,
                alt: p.main_alt_image || p.nome
            }
        }));

        res.json(produtos);
    });
};
router.get('/produtos', getProdutosHandler);
router.get('/api/produtos', getProdutosHandler);

// Buscar produto específico por ID
const getProdutoByIdHandler = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM produto WHERE id = ?', [id], (err, productResults) => {
        if (err || productResults.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const p = productResults[0];

        db.query('SELECT id, alt, ordem FROM produto_image WHERE fk_produto = ? ORDER BY ordem ASC', [id], (err, slideResults) => {
            const slides = (slideResults || []).map(s => ({
                id: s.id,
                alt: s.alt,
                image: `/produtos/slide-image/${s.id}`
            }));

            // Se não houver slides adicionais, usamos a imagem principal como primeiro slide
            if (slides.length === 0) {
                slides.push({
                    id: p.id,
                    alt: p.main_alt_image,
                    image: `/produtos/${p.id}/main-image`
                });
            }

            res.json({
                id: p.id,
                name: p.nome,
                category: p.categoria || 'geral',
                price: Number(p.preco),
                shortDescription: p.short_description,
                longDescription: p.long_description,
                imageMain: {
                    image: `/produtos/${p.id}/main-image`,
                    alt: p.main_alt_image || p.nome
                },
                imagesSlide: slides
            });
        });
    });
};
router.get('/produtos/:id', getProdutoByIdHandler);
router.get('/api/produtos/:id', getProdutoByIdHandler);

// Servir imagem principal como BLOB
const getMainImageHandler = (req, res) => {
    const { id } = req.params;
    db.query('SELECT main_image FROM produto WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].main_image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].main_image);
    });
};
router.get('/produtos/:id/main-image', getMainImageHandler);
router.get('/api/produtos/:id/main-image', getMainImageHandler);

// Servir imagem de slide do produto como BLOB
const getSlideImageHandler = (req, res) => {
    const { id } = req.params;
    db.query('SELECT image FROM produto_image WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].image);
    });
};
router.get('/produtos/slide-image/:id', getSlideImageHandler);
router.get('/api/produtos/slide-image/:id', getSlideImageHandler);

// Criar produto com imagens BLOB
const uploadFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'slideImages', maxCount: 10 }
]);

const postProdutoHandler = (req, res) => {
    const nome = req.body.name || req.body.nome;
    const categoria = req.body.category || req.body.categoria || 'geral';
    const preco = parseFloat(req.body.price || req.body.preco) || 0;
    const shortDesc = req.body.shortDescription || '';
    const longDesc = req.body.longDescription || '';

    const mainFile = req.files && req.files['mainImage'] ? req.files['mainImage'][0] : null;
    if (!mainFile) {
        return res.status(400).json({ error: 'A imagem principal é obrigatória' });
    }

    const mainBlob = mainFile.buffer;
    const mainAlt = req.body.mainAltImage || mainFile.originalname || nome;

    db.query(
        'INSERT INTO produto (nome, categoria, preco, short_description, long_description, main_image, main_alt_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome, categoria, preco, shortDesc, longDesc, mainBlob, mainAlt],
        (err, result) => {
            if (err) {
                console.error('Erro ao inserir produto no MySQL:', err);
                return res.status(500).json({ error: 'Erro ao salvar produto' });
            }

            const produtoId = result.insertId;

            // Salvar imagens de slides na tabela produto_image
            const slideFiles = req.files && req.files['slideImages'] ? req.files['slideImages'] : [];
            if (slideFiles.length > 0) {
                slideFiles.forEach((file, index) => {
                    db.query(
                        'INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES (?, ?, ?, ?)',
                        [produtoId, file.buffer, file.originalname, index + 1],
                        (errImg) => {
                            if (errImg) console.error('Erro ao salvar slide do produto:', errImg);
                        }
                    );
                });
            }

            res.status(201).json({
                id: produtoId,
                name: nome,
                category: categoria,
                price: preco,
                shortDescription: shortDesc,
                longDescription: longDesc,
                imageMain: {
                    image: `/produtos/${produtoId}/main-image`,
                    alt: mainAlt
                }
            });
        }
    );
};
router.post('/produtos', uploadFields, postProdutoHandler);
router.post('/api/produtos', uploadFields, postProdutoHandler);

// Atualizar produto
const putProdutoHandler = (req, res) => {
    const { id } = req.params;
    const nome = req.body.name || req.body.nome;
    const categoria = req.body.category || req.body.categoria || 'geral';
    const preco = parseFloat(req.body.price || req.body.preco) || 0;
    const shortDesc = req.body.shortDescription || '';
    const longDesc = req.body.longDescription || '';

    const mainFile = req.files && req.files['mainImage'] ? req.files['mainImage'][0] : null;

    if (mainFile) {
        const mainBlob = mainFile.buffer;
        const mainAlt = req.body.mainAltImage || mainFile.originalname || nome;
        db.query(
            'UPDATE produto SET nome = ?, categoria = ?, preco = ?, short_description = ?, long_description = ?, main_image = ?, main_alt_image = ? WHERE id = ?',
            [nome, categoria, preco, shortDesc, longDesc, mainBlob, mainAlt, id],
            (err) => {
                if (err) return res.status(500).json({ error: 'Erro ao atualizar produto' });
                handleSlideUploads(id, req.files ? req.files['slideImages'] : null, res);
            }
        );
    } else {
        db.query(
            'UPDATE produto SET nome = ?, categoria = ?, preco = ?, short_description = ?, long_description = ? WHERE id = ?',
            [nome, categoria, preco, shortDesc, longDesc, id],
            (err) => {
                if (err) return res.status(500).json({ error: 'Erro ao atualizar produto' });
                handleSlideUploads(id, req.files ? req.files['slideImages'] : null, res);
            }
        );
    }
};

function handleSlideUploads(produtoId, slideFiles, res) {
    if (slideFiles && slideFiles.length > 0) {
        slideFiles.forEach((file, index) => {
            db.query(
                'INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES (?, ?, ?, ?)',
                [produtoId, file.buffer, file.originalname, index + 1],
                (errImg) => {
                    if (errImg) console.error('Erro ao adicionar slide do produto:', errImg);
                }
            );
        });
    }
    res.json({ success: true, id: produtoId });
}

router.put('/produtos/:id', uploadFields, putProdutoHandler);
router.put('/api/produtos/:id', uploadFields, putProdutoHandler);

// Excluir produto
const deleteProdutoHandler = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produto WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao excluir produto:', err);
            return res.status(500).json({ error: 'Erro ao deletar produto' });
        }
        res.json({ success: true });
    });
};
router.delete('/produtos/:id', deleteProdutoHandler);
router.delete('/api/produtos/:id', deleteProdutoHandler);

module.exports = router;
