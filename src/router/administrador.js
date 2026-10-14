const express = require('express');
const router = express.Router();

// IMPORTANTE: Importa a conexão com o banco de dados
const db = require('../database/mysql');

// Rota para renderizar a página do administrador
router.get('/administrador', (req, res) => {
    res.render('administrador');
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


router.get('/slides-home', (req, res) => {
    return res.status(200).json([]);
});
module.exports = router;