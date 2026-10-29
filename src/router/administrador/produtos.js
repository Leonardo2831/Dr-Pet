const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../../database/mysql');
const extractImageBuffer = require('../../utils/extractImageBuffer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

const uploadCampos = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'slide_images', maxCount: 10 }
]);

router.get('/administrador/produtos', (req, res) => {
    const query = 'SELECT id, nome, categoria, preco, short_description, long_description FROM produto ORDER BY id ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar produtos." });
        return res.status(200).json(results);
    });
});

router.get('/administrador/produtos/imagem/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT main_image FROM produto WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].main_image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].main_image);
    });
});

router.get('/administrador/produtos/slide-imagem/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT image FROM produto_image WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].image);
    });
});

router.get('/administrador/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, nome, categoria, preco, short_description, long_description FROM produto WHERE id = ?', [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }
        const prod = rows[0];
        db.query('SELECT id, alt, ordem FROM produto_image WHERE fk_produto = ? ORDER BY ordem ASC', [id], (errImg, imgRows) => {
            const imagesSlide = (imgRows || []).map(r => ({
                id: r.id,
                alt: r.alt,
                ordem: r.ordem,
                url: `/administrador/produtos/slide-imagem/${r.id}`,
                image: `/administrador/produtos/slide-imagem/${r.id}`
            }));
            return res.status(200).json({
                id: prod.id,
                name: prod.nome,
                category: prod.categoria,
                price: prod.preco,
                shortDescription: prod.short_description,
                longDescription: prod.long_description,
                mainImage: `/administrador/produtos/imagem/${prod.id}`,
                image: `/administrador/produtos/imagem/${prod.id}`,
                imagesSlide: imagesSlide
            });
        });
    });
});

router.post('/administrador/produtos/insert', uploadCampos, (req, res) => {
    const nome = (req.body.nome || req.body.name || req.body.produto || '').trim();
    const categoria = (req.body.categoria || req.body.category || '').trim();
    const preco = parseFloat(req.body.preco || req.body.price || 0) || 0.00;
    const short_description = (req.body.short_description || req.body.shortDescription || '').trim();
    const long_description = (req.body.long_description || req.body.longDescription || '').trim();

    let mainBuffer = null;
    if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
        mainBuffer = req.files['main_image'][0].buffer;
    } else {
        mainBuffer = extractImageBuffer(req.body.imageMain || req.body.main_image);
    }

    if (!nome || !categoria || !mainBuffer) {
        return res.status(400).json({ erro: "Nome, categoria e imagem principal são obrigatórios." });
    }

    const query = 'INSERT INTO produto (nome, categoria, preco, short_description, long_description, main_image, main_alt_image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [nome, categoria, preco, short_description, long_description, mainBuffer, nome], (err, results) => {
        if (err) {
            console.error("Erro ao cadastrar produto no MySQL:", err);
            return res.status(500).json({ erro: "Erro ao cadastrar produto." });
        }

        const newProductId = results.insertId;
        const slideFiles = (req.files && req.files['slide_images']) || [];
        let slidesMeta = [];
        if (req.body.slides_meta) {
            try {
                slidesMeta = typeof req.body.slides_meta === 'string' ? JSON.parse(req.body.slides_meta) : req.body.slides_meta;
            } catch (e) {
                slidesMeta = [];
            }
        }

        let slideInserts = [];
        if (slideFiles.length > 0) {
            slideInserts = slideFiles.map((f, idx) => {
                const meta = slidesMeta[idx] || {};
                const alt = meta.alt || `${nome} - Slide ${idx + 1}`;
                const ordem = meta.ordem || (idx + 1);
                return [newProductId, f.buffer, alt, ordem];
            });
        }

        if (slideInserts.length > 0) {
            db.query('INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES ?', [slideInserts], (errSlide) => {
                if (errSlide) {
                    console.error("Erro ao inserir imagens de slide:", errSlide);
                }
                return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: newProductId });
            });
            return;
        }

        return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: newProductId });
    });
});

router.post('/administrador/produtos/update/:id', uploadCampos, (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM produto WHERE id = ?', [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        const produtoAtual = rows[0];
        const nome = req.body.nome || req.body.name || produtoAtual.nome;
        const categoria = req.body.categoria || req.body.category || produtoAtual.categoria;
        const preco = req.body.preco !== undefined && req.body.preco !== '' ? parseFloat(req.body.preco) : produtoAtual.preco;
        const short_description = req.body.short_description || req.body.shortDescription || produtoAtual.short_description;
        const long_description = req.body.long_description || req.body.longDescription || produtoAtual.long_description;

        let mainBuffer = null;
        if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
            mainBuffer = req.files['main_image'][0].buffer;
        } else {
            mainBuffer = extractImageBuffer(req.body.imageMain || req.body.main_image);
        }

        const updateFields = ['nome = ?', 'categoria = ?', 'preco = ?', 'short_description = ?', 'long_description = ?'];
        const updateValues = [nome, categoria, preco, short_description, long_description];

        if (mainBuffer) {
            updateFields.push('main_image = ?');
            updateValues.push(mainBuffer);
        }

        updateValues.push(id);

        const query = `UPDATE produto SET ${updateFields.join(', ')} WHERE id = ?`;
        db.query(query, updateValues, (errUpdate) => {
            if (errUpdate) {
                console.error("Erro ao atualizar produto:", errUpdate);
                return res.status(500).json({ erro: "Erro ao atualizar produto." });
            }

            let slidesMeta = [];
            if (req.body.slides_meta) {
                try {
                    slidesMeta = typeof req.body.slides_meta === 'string' ? JSON.parse(req.body.slides_meta) : req.body.slides_meta;
                } catch (e) {
                    slidesMeta = [];
                }
            } else if (Array.isArray(req.body.imagesSlide)) {
                slidesMeta = req.body.imagesSlide;
            }

            const slideFiles = (req.files && req.files['slide_images']) || [];

            if (slidesMeta.length > 0 || slideFiles.length > 0) {
                db.query('SELECT id FROM produto_image WHERE fk_produto = ?', [id], (errSelect, existingRows) => {
                    const existingIds = (existingRows || []).map(r => r.id);
                    const incomingIds = slidesMeta.filter(s => s.id).map(s => Number(s.id));

                    // Deleta os slides que foram removidos
                    const toDelete = existingIds.filter(oldId => !incomingIds.includes(oldId));
                    const deletePromise = toDelete.length > 0 
                        ? new Promise(resolve => db.query('DELETE FROM produto_image WHERE id IN (?)', [toDelete], resolve))
                        : Promise.resolve();

                    deletePromise.then(() => {
                        let fileIdx = 0;
                        const tasks = slidesMeta.map((s, idx) => {
                            const ordem = idx + 1;
                            const alt = s.alt || `${nome} - Slide ${ordem}`;
                            let newBuf = null;

                            if ((s.hasNewFile || s.isNew) && slideFiles[fileIdx]) {
                                newBuf = slideFiles[fileIdx].buffer;
                                fileIdx++;
                            } else if (s.image && Buffer.isBuffer(s.image)) {
                                newBuf = s.image;
                            }

                            if (s.id && existingIds.includes(Number(s.id))) {
                                if (newBuf) {
                                    return new Promise(resolve => db.query('UPDATE produto_image SET image = ?, alt = ?, ordem = ? WHERE id = ?', [newBuf, alt, ordem, s.id], resolve));
                                } else {
                                    return new Promise(resolve => db.query('UPDATE produto_image SET alt = ?, ordem = ? WHERE id = ?', [alt, ordem, s.id], resolve));
                                }
                            } else if (newBuf) {
                                return new Promise(resolve => db.query('INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES (?, ?, ?, ?)', [id, newBuf, alt, ordem], resolve));
                            }
                            return Promise.resolve();
                        });

                        Promise.all(tasks).then(() => {
                            return res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
                        }).catch(errTasks => {
                            console.error("Erro ao atualizar slides:", errTasks);
                            return res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
                        });
                    });
                });
            } else {
                return res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
            }
        });
    });
});

router.post('/administrador/produtos/delete/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM produto_image WHERE fk_produto = ?', [id], () => {
        db.query('DELETE FROM produto WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro ao excluir produto." });
            return res.status(200).json({ mensagem: "Produto excluído com sucesso!" });
        });
    });
});

module.exports = router;