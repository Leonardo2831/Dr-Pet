const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../database/mysql');
const { verificarAdmin } = require('./middlewares');

// Configuração simples para upload de imagens
const upload = multer({ dest: 'public/uploads/' });
const uploadCampos = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'slide_images', maxCount: 10 }
]);

function extractImageBuffer(imgData) {
    if (!imgData) return null;
    if (Buffer.isBuffer(imgData)) return imgData;
    if (typeof imgData === 'string' && imgData.startsWith('data:image/')) {
        const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
    }
    if (typeof imgData === 'object' && imgData.image) {
        return extractImageBuffer(imgData.image);
    }
    return null;
}

router.get('/administrador', (req, res) => {
    const querySlides = 'SELECT * FROM slide_home ORDER BY ordem ASC';
    const queryUsers = 'SELECT id, nome, email, telefone FROM usuario';
    const queryProdutos = 'SELECT * FROM produto';
    const queryAgendamento = 'SELECT * FROM agendamentos';
    const queryServicos = 'SELECT * FROM service_infos';

    try {
        const [slides, produtos, usuarios, agendamentos, servicos] = Promise.all([
            db.query(querySlides, (err) => err ? console.log("Erro ao buscar slides.") : slides),
            db.query(queryProdutos, (err) => err ? console.log("Erro ao buscar produtos.") : produtos),
            db.query(queryUsers, (err) => err ? console.log("Erro ao buscar usuários.") : usuarios),
            db.query(queryAgendamento, (err) => err ? console.log("Erro ao buscar agendamentos.") : agendamentos),
            db.query(queryServicos, (err) => err ? console.log("Erro ao buscar serviços.") : servicos)
        ]);
    } catch (err) {
        console.log("Erro ao fazer as requisições necessárias: " + err);
    } finally {
        res.render('administrador', {
            slides: slides || [],
            produtos: produtos || [],
            usuarios: usuarios || [],
            agendamentos: agendamentos || [],
            servicos: servicos || []
        });
    }
});

router.get('/produtos', (req, res) => {
    const query = 'SELECT id, nome, categoria, preco, short_description AS descricao_curta, long_description AS descricao_longa FROM produto ORDER BY id ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar produtos." });
        return res.status(200).json(results);
    });
});

// Buscar dados completos de 1 produto para edição (incluindo imagens do slide)
router.get('/produtos/:id', (req, res) => {
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
                url: `/produtos/slide-imagem/${r.id}`
            }));
            return res.status(200).json({
                id: prod.id,
                name: prod.nome,
                category: prod.categoria,
                price: prod.preco,
                shortDescription: prod.short_description,
                longDescription: prod.long_description,
                mainImage: `/produtos/imagem/${prod.id}`,
                imagesSlide: imagesSlide
            });
        });
    });
});

// Servir imagem principal do produto
router.get('/produtos/imagem/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT main_image FROM produto WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].main_image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].main_image);
    });
});

// Servir imagem de slide do produto
router.get('/produtos/slide-imagem/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT image FROM produto_image WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].image);
    });
});

router.post('/produtos', uploadCampos, (req, res) => {
    const nome = (req.body.nome || req.body.name || req.body.produto || '').trim();
    const categoria = (req.body.categoria || req.body.category || '').trim();
    const preco = parseFloat(req.body.preco || req.body.price || 0) || 0.00;
    const short_description = (req.body.short_description || req.body.shortDescription || '').trim();
    const long_description = (req.body.long_description || req.body.longDescription || '').trim();

    let mainBuffer = null;
    if (req.files && req.files['main_image']) {
        mainBuffer = require('fs').readFileSync(req.files['main_image'][0].path);
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
        const slides = req.body.imagesSlide || req.body.slide_images || [];

        if (Array.isArray(slides) && slides.length > 0) {
            const slideInserts = slides.map((s, idx) => {
                const sBuf = extractImageBuffer(s.image || s);
                const alt = s.alt || `${nome} - Slide ${idx + 1}`;
                const ordem = s.ordem || (idx + 1);
                return [newProductId, sBuf, alt, ordem];
            }).filter(row => row[1] !== null);

            if (slideInserts.length > 0) {
                db.query('INSERT INTO produto_image (fk_produto, image, alt, ordem) VALUES ?', [slideInserts], (errSlide) => {
                    if (errSlide) {
                        console.error("Erro ao inserir imagens de slide:", errSlide);
                    }
                    return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: newProductId });
                });
                return;
            }
        }

        return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: newProductId });
    });
});

// ==========================================
// 3. EDITAR PRODUTO (PUT /produtos/:id)
// ==========================================
router.put('/produtos/:id', uploadCampos, (req, res) => {
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
        if (req.files && req.files['main_image']) {
            mainBuffer = require('fs').readFileSync(req.files['main_image'][0].path);
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

            const slides = req.body.imagesSlide;
            if (Array.isArray(slides)) {
                db.query('SELECT id FROM produto_image WHERE fk_produto = ?', [id], (errSelect, existingRows) => {
                    const existingIds = (existingRows || []).map(r => r.id);
                    const incomingIds = slides.filter(s => s.id).map(s => Number(s.id));

                    // Deleta os slides que foram removidos
                    const toDelete = existingIds.filter(oldId => !incomingIds.includes(oldId));
                    const deletePromise = toDelete.length > 0 
                        ? new Promise(resolve => db.query('DELETE FROM produto_image WHERE id IN (?)', [toDelete], resolve))
                        : Promise.resolve();

                    deletePromise.then(() => {
                        // Atualiza a ordem dos slides existentes e insere novos
                        const tasks = slides.map((s, idx) => {
                            const ordem = idx + 1;
                            const alt = s.alt || `${nome} - Slide ${ordem}`;
                            const newBuf = extractImageBuffer(s.image || s);

                            if (s.id && existingIds.includes(Number(s.id))) {
                                if (newBuf) {
                                    return new Promise(resolve => db.query('UPDATE produto_image SET image = ?, alt = ?, ordem = ? WHERE id = ?', [newBuf, alt, ordem, s.id], resolve));
                                } else {
                                    return new Promise(resolve => db.query('UPDATE produto_image SET ordem = ? WHERE id = ?', [ordem, s.id], resolve));
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

router.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM produto_image WHERE fk_produto = ?', [id], () => {
        db.query('DELETE FROM produto WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json({ erro: "Erro ao excluir produto." });
            return res.status(200).json({ mensagem: "Produto excluído com sucesso!" });
        });
    });
});

const storageSlides = multer.memoryStorage()
const uploadSlide = multer({ storage: storageSlides })

router.get('/slides/imagem/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT image FROM slide_home WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0 || !results[0].image) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg'); //aceita imagems/pngs/jpegs
        res.send(results[0].image);
    });
});

//adicionar slide
router.post('/slides-home', uploadSlide.any(), (req, res) => {

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

//deletar slides
router.delete('/slides-home/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM slide_home WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao excluir do banco:', err);
            return res.status(500).json({ message: 'Erro ao excluir do banco.' });
        }
        return res.status(200).json({ message: 'Slide removido com sucesso!' });
    });
});

router.get('/slides-home', (req, res) => {
    const query = 'SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC';
    db.query(query, (err, slides) => {
        if (err) {
            console.error('Erro ao buscar slides:', err);
            return res.status(500).json({ message: 'Erro ao buscar slides.' });
        }
        return res.status(200).json(slides);
    });
});

router.patch('/slides-home/:id', (req, res) => {
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

// 6. RELATÓRIO DE USUÁRIOS - LISTAR E BUSCAR NO BANCO DE DADOS
const listarUsuarios = (req, res) => {
    const { busca, q } = req.query;
    const termo = (busca || q || '').trim();

    let query = 'SELECT id, nome, email, telefone, tipo_usuario, (avatar IS NOT NULL AND LENGTH(avatar) > 0) AS has_avatar FROM usuario';
    let params = [];

    if (termo) {
        query += ' WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?';
        const likeTerm = `%${termo}%`;
        params.push(likeTerm, likeTerm, likeTerm);
    }

    query += ' ORDER BY id ASC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuários no banco de dados:', err);
            return res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
        }
        return res.status(200).json(results);
    });
};

router.get('/administrador/usuarios', listarUsuarios);
router.get('/usuarios', listarUsuarios);

// 7. SERVIR AVATAR DO USUÁRIO
const getAvatarUsuario = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT avatar FROM usuario WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0 || !results[0].avatar) {
            return res.status(404).send('Avatar não encontrado');
        }

        const avatar = results[0].avatar;
        // Se for uma string de URL ou base64
        if (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/'))) {
            return res.redirect(avatar);
        }

        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(avatar);
    });
};

router.delete('/administrador/servicos/:id', verificarAdmin, (req,res) => {
    const idService = req.params.id;

    db.query(
        'DELETE FROM service_infos WHERE id = ?',
        [idService],
        (err) => {
            if(err) {
                return res.status(500).send("Não foi possível continuar com a exclusão! Tente novamente.")
            } else {
                return res.status(200).end()
            }
        }
    )
})

router.get('/usuario/avatar/:id', getAvatarUsuario);
router.get('/administrador/usuario/avatar/:id', getAvatarUsuario);

module.exports = router;