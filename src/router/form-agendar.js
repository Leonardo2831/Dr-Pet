const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { verificarLogin } = require('./middlewares');

router.get('/form-agendar', verificarLogin, (req, res) => {
    const userId = req.session && req.session.usuario ? req.session.usuario.id : null;

    if (!userId) {
        const dataUser = {};
        return res.render('form-agendar', { dataUser });
    }

    // transforma os resultados dos join em objeto
    const query = `
        SELECT 
            JSON_OBJECT(
                'id', u.id, 'nome', u.nome, 'name', u.nome, 'email', u.email, 
                'telefone', u.telefone, 'avatar', u.avatar
            ) AS usuario,
            JSON_OBJECT(
                'id', p.id, 'nome', p.nome, 'name', p.nome, 'raca', p.raca, 
                'genero', p.genero, 'descricao', p.descricao
            ) AS pet,
            JSON_OBJECT(
                'id', e.id, 'rua', e.rua,
                'numero', e.numero, 'cep', e.cep,
                'cidade', e.cidade, 'estado', e.estado, 'bairro', e.bairro,
                'telefone-contato', e.telefone_contato,
                'complemento', e.complemento
            ) AS endereco
        FROM usuario u
        LEFT JOIN pet p ON u.id = p.usuario_id
        LEFT JOIN endereco e ON u.id = e.usuario_id
        WHERE u.id = ?;
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados do usuário:', err);
            return res.status(500).send('Erro ao buscar dados do usuário.');
        }

        const dataUser = results || [];
        dataUser.usuario = (dataUser[0] && dataUser[0].usuario) || {};
        dataUser.pet = (dataUser[0] && dataUser[0].pet) || {};
        dataUser.endereco = (dataUser[0] && dataUser[0].endereco) || {};

        return res.render('form-agendar', { dataUser });
    });
});

module.exports = router;