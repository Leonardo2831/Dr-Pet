const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { verificarLogin } = require('./middlewares');

// Helper para criar slug amigável do serviço
function getServiceSlug(nome) {
    if (!nome) return '';
    return nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+e\s+/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

// ROTA PRINCIPAL DA AGENDA (GET /agenda)
router.get('/agenda', verificarLogin, (req, res) => {
    const queryServicos = 'SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC';
    const queryAgenda = "SELECT id, DATE_FORMAT(date_agendamento, '%Y-%m-%d') AS date, TIME_FORMAT(hour_agendamento, '%H:%i') AS hour, fk_service FROM agenda WHERE date_agendamento >= CURDATE()";

    db.query(queryServicos, (errServicos, servicosResults) => {
        if (errServicos) {
            console.error('Erro ao buscar serviços no MySQL:', errServicos);
        }

        const rawServicos = servicosResults || [];
        const servicos = rawServicos.map(s => ({
            ...s,
            slug: getServiceSlug(s.nome),
            duracao: Number(s.duracao) || 30,
            preco: Number(s.preco) || 0
        }));

        db.query(queryAgenda, (errAgenda, agendaResults) => {
            if (errAgenda) {
                console.error('Erro ao buscar agendamentos no MySQL:', errAgenda);
            }

            const agendamentos = agendaResults || [];
            const selectedServiceParam = (req.query.service || '').trim();

            res.render('agenda', {
                servicos,
                agendamentos,
                selectedServiceParam
            });
        });
    });
});

// SERVIR IMAGEM DO SERVIÇO (GET /servicos/imagem/:id)
router.get('/servicos/imagem/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT imagem FROM service_infos WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0 || !results[0].imagem) {
            return res.status(404).send('Imagem do serviço não encontrada');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(results[0].imagem);
    });
});

// SALVAR AGENDAMENTO (POST /agenda)
router.post('/agenda', verificarLogin, (req, res) => {
    const userId = req.session.usuario.id;

    if (!date || !hour || !fk_service) {
        return res.status(400).json({ erro: 'Data, horário e serviço são obrigatórios.' });
    }

    const query = `
                INSERT INTO agenda 
                (date_agendamento, hour_agendamento, buscarResidencia, observation, endereco, pendente, fk_user, fk_pet, fk_service) 
                VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
            `;

            db.query(
        query,
                [
                    date,
                    hour,
                    buscarResidencia ? 1 : 0,
            observation || null,
            endereco || null,
                    userId,
            fk_pet || null,
            fk_service
                ],
        (err, result) => {
            if (err) {
                console.error('Erro ao salvar agendamento no MySQL:', err);
                return res.status(500).json({ erro: 'Erro ao salvar agendamento.' });
                    }
            return res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!', id: result.insertId });
                }
    );
});

module.exports = router;