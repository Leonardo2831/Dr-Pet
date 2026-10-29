const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../../database/mysql');
const { verificarAdmin } = require('../middlewares');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

function parseDuracao(valor) {
    const digitos = String(valor || '').replace(/\D/g, '');
    return digitos ? Number(digitos) : NaN;
}

function parsePreco(valor) {
    const limpo = String(valor || '').replace(/[^\d,]/g, '').replace(',', '.');
    return limpo ? Number(limpo) : NaN;
}

router.get('/administrador/servicos', (req, res) => {
    const query = 'SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar serviços:', err);
            return res.status(500).json({ erro: 'Erro ao buscar serviços.' });
        }
        return res.status(200).json(results);
    });
});

router.get('/administrador/servicos/imagem/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT imagem FROM service_infos WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0 || !results[0].imagem) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].imagem);
    });
});

router.post('/administrador/servicos/criar', verificarAdmin, upload.single('imagem'), (req, res) => {
    const nome = (req.body.nome || '').trim();
    const descricao = (req.body.descricao || '').trim();
    const duracao = parseDuracao(req.body.duracao);
    const preco = parsePreco(req.body.preco);

    if (!nome || !descricao || Number.isNaN(duracao) || Number.isNaN(preco) || !req.file) {
        return res.status(400).send('Preencha todos os campos e envie uma imagem.');
    }

    db.query(
        'INSERT INTO service_infos (nome, duracao, preco, descricao, imagem) VALUES (?, ?, ?, ?, ?)',
        [nome, duracao, preco, descricao, req.file.buffer],
        (err) => {
            if (err) {
                console.error('Erro ao cadastrar serviço:', err);
                return res.status(500).send('Erro ao cadastrar serviço.');
            }
            res.redirect('/administrador');
        }
    );
});

router.post('/administrador/servicos/atualizar', verificarAdmin, upload.single('imagem'), (req, res) => {
    const { servicoId } = req.body;
    if (!servicoId) return res.status(400).send('Selecione um serviço.');

    const campos = [];
    const valores = [];

    const duracao = parseDuracao(req.body.duracao);
    const preco = parsePreco(req.body.preco);
    const descricao = (req.body.descricao || '').trim();

    if (!Number.isNaN(duracao)) { campos.push('duracao = ?'); valores.push(duracao); }
    if (!Number.isNaN(preco)) { campos.push('preco = ?'); valores.push(preco); }
    if (descricao) { campos.push('descricao = ?'); valores.push(descricao); }
    if (req.file) { campos.push('imagem = ?'); valores.push(req.file.buffer); }

    if (campos.length === 0) return res.status(400).send('Nada para atualizar.');

    db.query(`UPDATE service_infos SET ${campos.join(', ')} WHERE id = ?`, [...valores, servicoId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar serviço:', err);
            return res.status(500).send('Erro ao atualizar serviço.');
        }
        if (result.affectedRows === 0) return res.status(404).send('Serviço não encontrado.');
        res.redirect('/administrador');
    });
});

router.post('/administrador/servicos/delete/:id', verificarAdmin, (req, res) => {
    const idService = req.params.id;

    db.query(
        'DELETE FROM service_infos WHERE id = ?',
        [idService],
        (err) => {
            if (err) {
                return res.status(500).send("Não foi possível continuar com a exclusão! Tente novamente.");
            } else {
                return res.status(200).end();
            }
        }
    );
});

module.exports = router;
