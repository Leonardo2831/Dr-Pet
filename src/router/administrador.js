const express = require('express');
const router = express.Router();
const multer = require('multer');
// IMPORTANTE: Importa a conexão com o banco de dados
const db = require('../database/mysql');

// Rota para renderizar a página do administrador
router.get('/administrador', (req, res) => {
    // if(req.session.usuario && req.session.usuario.tipoUsuario == 'admin') {
    //     res.render('administrador', { slides: [], agendamentos: [], produtos: [], usuarios: [] });
    // } else {
    //     res.redirect('/login');
    // }

    const querySlides = 'SELECT id, alt, ordem FROM slide_home ORDER BY ordem ASC';
    const queryUsers = 'SELECT id, nome, email, telefone, tipo_usuario, (avatar IS NOT NULL AND LENGTH(avatar) > 0) AS has_avatar FROM usuario ORDER BY id ASC';
    
    db.query(querySlides, (errSlides, slides) => {
        if (errSlides) {
            console.error('Erro ao buscar slides:', errSlides);
            slides = [];
        }
        db.query(queryUsers, (errUsers, usuarios) => {
            if (errUsers) {
                console.error('Erro ao buscar usuários:', errUsers);
                usuarios = [];
            }
            res.render('administrador', { 
                slides: slides || [], 
                agendamentos: [], 
                produtos: [],
                usuarios: usuarios || []
            });
        });
    });
});

// 1. LISTAR / BUSCAR PRODUTOS (GET /produtos)
const listarProdutos = (req, res) => {
    const { nome, categoria } = req.query;
    
    let query = 'SELECT * FROM produtos WHERE 1=1';
    let params = [];

    // Filtra pelo campo "Busca por nome..."
    if (nome) {
        query += ' AND produto LIKE ?';
        params.push(`%${nome}%`);
    }

    // Filtra pelo dropdown "TODAS AS CATEGORIAS"
    if (categoria && categoria !== 'TODAS AS CATEGORIAS' && categoria !== 'TODAS') {
        query += ' AND categoria = ?';
        params.push(categoria);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }
        return res.status(200).json(results);
    });
};

router.get('/produtos', listarProdutos);
router.get('/administrador/produtos', listarProdutos); // Mantém compatibilidade com a URL antiga

// 2. BUSCAR UM ÚNICO PRODUTO POR ID (GET /produtos/:id)
const buscarProdutoPorId = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM produtos WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }
        return res.status(200).json(result[0]);
    });
};

router.get('/produtos/:id', buscarProdutoPorId);
router.get('/administrador/produtos/:id', buscarProdutoPorId);

// 3. ADICIONAR PRODUTO (POST /produtos)
const salvarProduto = (req, res) => {
    const { produto, categoria, preco, descricao_longa, descricao_curta } = req.body;

    const query = 'INSERT INTO produtos (produto, categoria, preco, descricao_longa, descricao_curta) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [produto, categoria, preco, descricao_longa, descricao_curta], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao CADASTRAR produto:', erro);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }
        
        console.log('Produto inserido com sucesso:', resultado);
        return res.status(201).json({ 
            message: 'Produto cadastrado com sucesso!', 
            id: resultado.insertId 
        });
    });
};

router.post('/produtos', salvarProduto);
router.post('/administrador/produtos', salvarProduto);

// 4. EDITAR PRODUTO (PUT /produtos/:id)
const editarProduto = (req, res) => {
    const { id } = req.params;
    const { produto, categoria, preco, descricao_longa, descricao_curta } = req.body;

    const query = 'UPDATE produtos SET produto = ?, categoria = ?, preco = ?, descricao_longa = ?, descricao_curta = ? WHERE id = ?';

    db.query(query, [produto, categoria, preco, descricao_longa, descricao_curta, id], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao EDITAR produto:', erro);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }

        console.log(`Produto ID ${id} atualizado com sucesso!`, resultado);
        return res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    });
};

router.put('/produtos/:id', editarProduto);
router.put('/administrador/produtos/:id', editarProduto);

// 5. EXCLUIR PRODUTO (DELETE /produtos/:id)
const excluirProduto = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM produtos WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir produto:', err);
            return res.status(500).json({ message: 'Erro no Servidor.' });
        }
        console.log(`Produto ID ${id} excluído com sucesso!`, result);
        return res.status(200).json({ message: 'Produto excluído!' });
    });
};

router.delete('/produtos/:id', excluirProduto);
router.delete('/administrador/produtos/:id', excluirProduto);


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