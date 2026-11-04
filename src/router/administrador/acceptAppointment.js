const express = require("express");
const router = express.Router();
const db = require("../../database/mysql");
const sendEmail = require("../../utils/SendEmail");
const { cancelarAgendamento } = require("../../utils/cancelamento");

function cleanPhoneForDatabase(rawPhone) {
    let digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.length > 11 && digits.startsWith("55")) {
        digits = digits.slice(2);
    }
    return digits.slice(0, 12);
}

router.post("/administrador/agendamentos/accept", async (req, res) => {
    const payload = req.body.payload || req.body;
    if (!payload || !payload.id) {
        return res.status(400).json({ erro: "Dados de agendamento não fornecidos." });
    }

    const isRejected = payload.action === "rejected" || payload.status === "rejected";
    const telLimpo = cleanPhoneForDatabase(payload.telefone);
    const ids = [].concat(payload.id);

    try {
        if (isRejected) {
            // recusar = cancelar com histórico (aparece em Relatórios > Agendamentos > Cancelados)
            for (const id of ids) {
                await cancelarAgendamento(id, "recusado");
            }
        } else if (telLimpo) {
            await db.promise().query("UPDATE agenda SET pendente = FALSE, telefone = ? WHERE id IN (?)", [telLimpo, ids]);
        } else {
            await db.promise().query("UPDATE agenda SET pendente = FALSE WHERE id IN (?)", [ids]);
        }
    } catch (err) {
        console.log("Erro ao processar agendamento no banco: " + err);
        return res.status(500).json({ erro: "Erro ao atualizar status." });
    }

    try {
        const to = payload.to || payload.email;
        const subject = payload.subject || payload.assunto;
        const html = payload.mensagemHtml || payload.html;

        if (to && html) {
            await sendEmail(html, subject, to);
        }
    } catch (emailErr) {
        console.error("Erro ao enviar e-mail:", emailErr);
    }

    return res.status(200).json({ sucesso: true });
});

module.exports = router;