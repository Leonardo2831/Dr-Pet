const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../database/mysql');
const { verificarAdmin } = require('./middlewares');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Garante que a tabela e as colunas existam, mesmo em bancos criados antes da migração
const colunasServico = {
    nome: 'VARCHAR(100) NOT NULL',
    duracao: 'DECIMAL(10,2) NOT NULL DEFAULT 0',
    preco: 'DECIMAL(10,2) NOT NULL DEFAULT 0',
    descricao: "VARCHAR(500) NOT NULL DEFAULT ''",
    imagem: 'MEDIUMBLOB NULL'
};

db.query(
    `CREATE TABLE IF NOT EXISTS service_infos (
        id INTEGER NOT NULL AUTO_INCREMENT,
        nome VARCHAR(100) NOT NULL,
        duracao DECIMAL(10,2) NOT NULL DEFAULT 0,
        preco DECIMAL(10,2) NOT NULL DEFAULT 0,
        descricao VARCHAR(500) NOT NULL DEFAULT '',
        imagem MEDIUMBLOB NULL,
        PRIMARY KEY(id)
    )`,
    (err) => {
        if (err) return console.error('Erro ao criar tabela service_infos:', err);

        db.query(
            'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
            ['service_infos'],
            (err, rows) => {
                if (err) return console.error('Erro ao verificar colunas de service_infos:', err);

                const existentes = rows.map(r => (r.COLUMN_NAME || r.column_name).toLowerCase());
                Object.entries(colunasServico).forEach(([coluna, definicao]) => {
                    if (existentes.includes(coluna)) return;
                    db.query(`ALTER TABLE service_infos ADD COLUMN ${coluna} ${definicao}`, (err) => {
                        if (err) console.error(`Erro ao adicionar coluna ${coluna}:`, err);
                    });
                });
            }
        );
    }
);

// "60 min" -> 60
function parseDuracao(valor) {
    const digitos = String(valor || '').replace(/\D/g, '');
    return digitos ? Number(digitos) : NaN;
}

// "R$ 12,50" -> 12.5
function parsePreco(valor) {
    const limpo = String(valor || '').replace(/[^\d,]/g, '').replace(',', '.');
    return limpo ? Number(limpo) : NaN;
}

router.get('/servicos/imagem/:id', (req, res) => {
    db.query('SELECT imagem FROM service_infos WHERE id = ?', [req.params.id], (err, results) => {
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

module.exports = router;
