const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { verificarLogin } = require('./middlewares');

router.get('/form-agendar', verificarLogin, (req, res) => {
    const userId = req.session && req.session.usuario ? req.session.usuario.id : null;

    if (!userId) {
        return res.render('form-agendar', { usuario: {}, pet: {}, endereco: {} });
    }

    // transforma os resultados dos join em objeto
    const query = `
        SELECT 
            JSON_OBJECT(
                'id', u.id, 'nome', u.nome, 'email', u.email, 
                'telefone', u.telefone, 'avatar', u.avatar
            ) AS usuario,
            JSON_OBJECT(
                'id', p.id, 'nome', p.nome, 'raca', p.raca, 
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
        const { usuario, pet, endereco } = results[0];
        return res.render('form-agendar', { usuario, pet, endereco });
    });
});

router.post('/form-agendar/send', verificarLogin, (req, res) => {
    const userId = req.session && req.session.usuario ? req.session.usuario.id : null;

    if(!req.body || Object.keys(req.body).length === 0){
        res.status(500).json({ erro: 'Dados do formulário inválidos.' });
    }

    const { 
        nome, 
        telefone, 
        endereco, 
        nomePet, 
        descricao, 
        buscarResidencia,
        service,
        date,
        hour
    } = req.body;

    const query = `
        INSERT INTO agenda (
            dateAgendamento, 
            hourAgendamento,
            buscarResidencia,
            observation,
            endereco,
            nome,
            telefone,
            nomePet,
            fk_user,
            fk_service
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(query, [
            date, hour, buscarResidencia, descricao, endereco, 
            nome, telefone.replace(/\D/g, ''), nomePet, userId, service
        ], 
        (err) => {
        if(err){
            console.error('Erro ao salvar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao salvar agendamento.' });
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;