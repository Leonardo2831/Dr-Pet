const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../database/mysql');

// Configuração simples para upload de imagens
const upload = multer({ dest: 'public/uploads/' });
const uploadCampos = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'slide_images', maxCount: 10 }
]);

// ==========================================
// ROTA PRINCIPAL DO ADMINISTRADOR (GET /administrador)
// ==========================================
router.get('/administrador', (req, res) => {
    const querySlides = 'SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC';
    const queryUsers = 'SELECT id, nome, email, telefone, tipo_usuario FROM usuario ORDER BY id ASC';
    const queryProdutos = 'SELECT id, nome, preco, short_description AS descricao_curta, long_description AS descricao_longa FROM produtos ORDER BY id ASC';

    db.query(querySlides, (err, slides) => {
        db.query(queryUsers, (err, usuarios) => {
            db.query(queryProdutos, (err, produtos) => {
                db.query('SELECT id, nome FROM service_infos ORDER BY nome ASC', (err, servicos) => {
                    res.render('administrador', {
                        slides: slides || [],
                        agendamentos: [],
                        produtos: produtos || [],
                        usuarios: usuarios || [],
                        servicos: servicos || []
                    });
                });
            });
        });
    });
});

// ==========================================
// 1. LISTAR PRODUTOS (GET /produtos)
// ==========================================
router.get('/produtos', (req, res) => {
    // Adicionado 'categoria' na listagem
    const query = 'SELECT id, nome, categoria, preco, short_description AS descricao_curta, long_description AS descricao_longa FROM produtos ORDER BY id ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ erro: "Erro ao buscar produtos." });
        return res.status(200).json(results);
    });
});

// ==========================================
// 2. CADASTRAR PRODUTO (POST /produtos)
// ==========================================
router.post('/produtos', uploadCampos, (req, res) => {
    console.log("--> REQ.BODY RECEBIDO:", req.body);
    console.log("--> REQ.FILES RECEBIDOS:", req.files);

    const nome = req.body.nome || req.body.produto || req.body.title || req.body.product_name || req.body.name || '';
    
    const categoria = req.body.categoria || req.body.category || '';
    const precoBruto = req.body.preco || req.body.price || req.body.valor || 0;
    const preco = parseFloat(precoBruto) || 0.00;
    const short_description = req.body.short_description || req.body.descricao_curta || req.body.desc_curta || req.body.shortDescription || req.body.description_short || '';
    const long_description = req.body.long_description || req.body.descricao_longa || req.body.desc_longa || req.body.longDescription || req.body.description_long || '';

    let main_image = '';
    if (req.files && req.files['main_image']) {
        main_image = '/uploads/' + req.files['main_image'][0].filename;
    } else if (req.body.main_image || req.body.image) {
        main_image = req.body.main_image || req.body.image;
    }
    
    const query = 'INSERT INTO produtos (nome, categoria, preco, short_description, long_description, main_image, main_alt_image) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [nome, categoria, preco, short_description, long_description, main_image, nome], (err, results) => {
        if (err) {
            console.error("Erro ao cadastrar produto no MySQL:", err);
            return res.status(500).json({ erro: "Erro ao cadastrar produto." });
        }
        return res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id: results.insertId });
    });
});

// ==========================================
// 3. EDITAR PRODUTO (PUT /produtos/:id)
// ==========================================
router.put('/produtos/:id', uploadCampos, (req, res) => {
    const { id } = req.params;

    // Busca o produto atual na base de dados para preservar o que não foi enviado
    db.query('SELECT * FROM produtos WHERE id = ?', [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado." });
        }

        const produtoAtual = rows[0];

        const nome = req.body.nome || req.body.produto || req.body.name || produtoAtual.nome;
        const categoria = req.body.categoria || req.body.category || produtoAtual.categoria;
        const preco = req.body.preco !== undefined && req.body.preco !== '' ? req.body.preco : produtoAtual.preco;
        const short_description = req.body.short_description || req.body.descricao_curta || produtoAtual.short_description;
        const long_description = req.body.long_description || req.body.descricao_longa || produtoAtual.long_description;

        const query = `
            UPDATE produtos 
            SET nome = ?, categoria = ?, preco = ?, short_description = ?, long_description = ? 
            WHERE id = ?
        `;

        db.query(query, [nome, categoria, preco, short_description, long_description, id], (err, results) => {
            if (err) {
                console.error("Erro ao atualizar produto:", err);
                return res.status(500).json({ erro: "Erro ao atualizar produto." });
            }
            return res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
        });
    });
});

// ==========================================
// 4. EXCLUIR PRODUTO (DELETE /produtos/:id)
// ==========================================
router.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM produto_image WHERE fk_produto = ?', [id], () => {
        db.query('DELETE FROM produtos WHERE id = ?', [id], (err, results) => {
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

router.get('/usuario/avatar/:id', getAvatarUsuario);
router.get('/administrador/usuario/avatar/:id', getAvatarUsuario);

module.exports = router;