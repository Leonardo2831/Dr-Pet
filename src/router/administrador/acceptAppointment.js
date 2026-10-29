const express = require("express");
const router = express.Router();
const db = require("../../database/mysql");
const sendEmail = require("../../utils/SendEmail");

function cleanPhoneForDatabase(rawPhone) {
    let digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.length > 11 && digits.startsWith("55")) {
        digits = digits.slice(2);
    }
    return digits.slice(0, 12);
}

router.post("/administrador/agendamentos/accept", (req, res) => {
    const payload = req.body.payload || req.body;
    if (!payload || !payload.id) {
        return res.status(400).json({ erro: "Dados de agendamento não fornecidos." });
    }

    const isRejected = payload.action === "rejected" || payload.status === "rejected";
    const telLimpo = cleanPhoneForDatabase(payload.telefone);

    let query;
    let params;

    if (isRejected) {
        query = `DELETE FROM agenda WHERE id IN (?)`;
        params = [payload.id];
    } else if (telLimpo) {
        query = `UPDATE agenda SET pendente = FALSE, telefone = ? WHERE id IN (?)`;
        params = [telLimpo, payload.id];
    } else {
        query = `UPDATE agenda SET pendente = FALSE WHERE id IN (?)`;
        params = [payload.id];
    }

    db.query(query, params, async (err) => {
        if (err) {
            console.log("Erro ao processar agendamento no banco: " + err);
            return res.status(500).json({ erro: "Erro ao atualizar status." });
        } else {
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
        }
    });
});

module.exports = router;