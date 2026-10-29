const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { verificarLogin } = require('./middlewares');

function cleanPhoneForDatabase(rawPhone) {
    let digits = String(rawPhone || '').replace(/\D/g, '');
    if (digits.length > 11 && digits.startsWith('55')) {
        digits = digits.slice(2);
    }
    return digits.slice(0, 12);
}

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
        const { usuario, pet, endereco } = results[0] || {};
        return res.render('form-agendar', { usuario, pet, endereco });
    });
});

router.post('/form-agendar/send', verificarLogin, (req, res) => {
    const userId = req.session && req.session.usuario ? req.session.usuario.id : null;

    if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado.', redirect: '/login' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Dados do formulário inválidos.' });
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

    const serviceId = service || req.body.serviceId || req.body.fk_service;
    const telLimpo = cleanPhoneForDatabase(telefone);
    const nomeLimpo = String(nome || '').trim().slice(0, 255);
    const enderecoLimpo = String(endereco || '').trim().slice(0, 255);
    const nomePetLimpo = String(nomePet || '').trim().slice(0, 100);
    const descricaoLimpa = descricao ? String(descricao).trim().slice(0, 255) : null;
    const translado = Boolean(
        buscarResidencia === true || 
        buscarResidencia === 'true' || 
        buscarResidencia === 'on' || 
        buscarResidencia === 1
    );

    if (!serviceId) {
        return res.status(400).json({ erro: 'Serviço não selecionado. Por favor, volte e escolha um serviço.' });
    }

    if (!date || !hour) {
        return res.status(400).json({ erro: 'Data e horário são obrigatórios para o agendamento.' });
    }

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
            date, 
            hour, 
            translado, 
            descricaoLimpa, 
            enderecoLimpo, 
            nomeLimpo, 
            telLimpo, 
            nomePetLimpo, 
            userId, 
            serviceId
        ], 
        (err, result) => {
        if (err) {
            console.error('Erro ao salvar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao salvar agendamento no banco de dados.' });
        } else {
            // Se a requisição veio via Fetch / JSON (AJAX)
            if (req.is('json') || req.headers.accept?.includes('application/json')) {
                return res.status(200).json({ 
                    sucesso: true, 
                    redirect: '/', 
                    id: result.insertId 
                });
            }
            // Submissão nativa de formulário HTML
            return res.redirect('/');
        }
    });
});

module.exports = router;
