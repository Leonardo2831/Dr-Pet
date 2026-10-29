const express = require('express');
const router = express.Router();
const db = require('../database/mysql');

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

router.get('/service-infos', (req, res) => {
    db.query('SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC', (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar serviços.' });
        return res.status(200).json(results);
    });
});

router.get('/servicos/imagem/:id', (req, res) => {
    db.query('SELECT imagem FROM service_infos WHERE id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0 || !results[0].imagem) {
            return res.status(404).send('Imagem não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(results[0].imagem);
    });
});

module.exports = router;
