const express = require('express');
const router = express.Router();
const db = require('../../database/mysql');
const sendEmail = require('../../utils/SendEmail');

router.post('/administrador/agendamentos/status', (req, res) => {
    const { action, status, id, ids, destinatario, destinatarios, assunto, mensagemHtml } = req.body;
    const isAccepted = status === 'accepted' || action === 'accept_all';
    const novoStatus = isAccepted ? 0 : 2;

    if (action === 'accept_all' && Array.isArray(ids) && ids.length > 0) {
        db.query('UPDATE agenda SET pendente = ? WHERE id IN (?)', [novoStatus, ids], (err) => {
            if (err) console.error("Erro ao atualizar agendamentos no MySQL:", err);
            try {
                if (Array.isArray(destinatarios)) {
                    destinatarios.forEach(dest => {
                        const emailAddr = typeof dest === 'string' ? dest : dest?.email;
                        if (emailAddr && assunto && mensagemHtml) {
                            sendEmail(mensagemHtml, assunto, emailAddr);
                        }
                    });
                }
            } catch (e) {
                console.error("Erro ao disparar e-mails:", e);
            }
            return res.status(200).json({ mensagem: 'Agendamentos atualizados com sucesso!' });
        });
    } else if (id) {
        db.query('UPDATE agenda SET pendente = ? WHERE id = ?', [novoStatus, id], (err) => {
            if (err) console.error("Erro ao atualizar agendamento no MySQL:", err);
            try {
                const emailAddr = destinatario?.email;
                if (emailAddr && assunto && mensagemHtml) {
                    sendEmail(mensagemHtml, assunto, emailAddr);
                }
            } catch (e) {
                console.error("Erro ao disparar e-mail:", e);
            }
            return res.status(200).json({ mensagem: 'Status do agendamento atualizado com sucesso!' });
        });
    } else {
        return res.status(200).json({ mensagem: 'Nenhum agendamento para atualizar.' });
    }
});

module.exports = router;