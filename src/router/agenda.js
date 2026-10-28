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
        const query = `
            SELECT 
                a.id,
                DATE_FORMAT(a.dateAgendamento, '%Y-%m-%d') AS date,
                TIME_FORMAT(a.hourAgendamento, '%H:%i') AS hour,
                a.buscarResidencia,
                a.observation,
                a.endereco,
                a.nome,
                a.telefone,
                a.pendente,
                a.nomePet,
                a.fk_user,
                a.fk_service,
                u.nome AS usuario_nome,
                u.telefone AS usuario_telefone,
                u.email AS usuario_email,
                s.id AS service_id,
                s.nome AS service_nome
            FROM agenda a
            LEFT JOIN usuario u ON a.fk_user = u.id
            LEFT JOIN service_infos s ON a.fk_service = s.id
            ORDER BY a.dateAgendamento ASC, a.hourAgendamento ASC
        `;
        db.query(query, (err, rows) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
            const result = (rows || []).map(a => ({
                id: a.id,
                date: a.date,
                hour: a.hour,
                buscarResidencia: Boolean(a.buscarResidencia),
                observation: a.observation || '',
                endereco: a.endereco || '',
                pendente: a.pendente,
                nomePet: a.nomePet || '',
                user: {
                    username: a.nome || a.usuario_nome || 'Cliente',
                    phone: a.telefone || a.usuario_telefone || '',
                    endereco: a.endereco || ''
                },
                petAgendado: {
                    name: a.nomePet || 'Pet'
                },
                service: {
                    id: a.service_id || a.fk_service,
                    name: a.service_nome || '',
                    nome: a.service_nome || '',
                    observations: a.observation || ''
                }
            }));
            return res.json(result);
        });

    const queryServicos = 'SELECT id, nome, duracao, preco, descricao, (imagem IS NOT NULL AND LENGTH(imagem) > 0) AS has_imagem FROM service_infos ORDER BY id ASC';
    const queryAgenda = "SELECT id, DATE_FORMAT(dateAgendamento, '%Y-%m-%d') AS date, TIME_FORMAT(hourAgendamento, '%H:%i') AS hour, fk_service FROM agenda WHERE dateAgendamento >= CURDATE()";

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

router.get('/agenda/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT a.*, u.nome AS usuario_nome, u.telefone AS usuario_telefone, u.email AS usuario_email, s.nome AS servico_nome
        FROM agenda a
        LEFT JOIN usuario u ON a.fk_user = u.id
        LEFT JOIN service_infos s ON a.fk_service = s.id
        WHERE a.id = ?
    `;
    db.query(query, [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado.' });
        }
        const a = rows[0];
        const dateStr = a.dateAgendamento ? String(a.dateAgendamento).split('T')[0] : '';
        const hourStr = a.hourAgendamento ? String(a.hourAgendamento).slice(0, 5) : '';
        res.json({
            id: a.id,
            date: dateStr,
            hour: hourStr,
            buscarResidencia: Boolean(a.buscarResidencia),
            observation: a.observation || '',
            user: {
                username: a.nome || a.usuario_nome || '',
                phone: a.telefone || a.usuario_telefone || '',
                endereco: a.endereco || ''
            },
            petAgendado: {
                name: a.nomePet || ''
            },
            service: {
                id: a.fk_service,
                name: a.servico_nome || '',
                observations: a.observation || ''
            }
        });
    });
});

router.delete('/agenda/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM agenda WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao deletar agendamento.' });
        res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });
    });
});

router.patch('/agenda/:id', (req, res) => {
    const { id } = req.params;
    const { date, hour, buscarResidencia, service, user, petAgendado } = req.body;
    let fields = [];
    let params = [];
    if (date) { fields.push('dateAgendamento = ?'); params.push(date); }
    if (hour) { fields.push('hourAgendamento = ?'); params.push(hour); }
    if (buscarResidencia !== undefined) { fields.push('buscarResidencia = ?'); params.push(buscarResidencia ? 1 : 0); }
    if (service && service.observations !== undefined) { fields.push('observation = ?'); params.push(service.observations); }
    if (petAgendado && petAgendado.name) { fields.push('nomePet = ?'); params.push(petAgendado.name); }
    if (user && user.username) { fields.push('nome = ?'); params.push(user.username); }
    if (user && user.phone) { fields.push('telefone = ?'); params.push(user.phone); }
    if (user && user.endereco) { fields.push('endereco = ?'); params.push(user.endereco); }

    if (fields.length === 0) return res.status(200).json({ mensagem: 'Nada a atualizar.' });
    params.push(id);
    db.query(`UPDATE agenda SET ${fields.join(', ')} WHERE id = ?`, params, (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar agendamento.' });
        res.status(200).json({ mensagem: 'Agendamento atualizado com sucesso.' });
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