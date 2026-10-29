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

// 1. Dados de todos os agendamentos formatados para o Admin
router.get("/administrador/agenda/dados", (req, res) => {
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
            u.email AS usuario_email,
            u.telefone AS usuario_telefone,
            s.nome AS service_nome,
            s.duracao AS service_duracao,
            s.preco AS service_preco
        FROM agenda a
        LEFT JOIN usuario u ON a.fk_user = u.id
        LEFT JOIN service_infos s ON a.fk_service = s.id
        ORDER BY a.dateAgendamento ASC, a.hourAgendamento ASC;
    `;

    db.query(query, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar dados da agenda no banco:", err);
            return res.status(500).json({ erro: "Erro ao buscar dados da agenda." });
        }

        const data = (rows || []).map(a => ({
            id: a.id,
            date: a.date,
            hour: a.hour,
            buscarResidencia: Boolean(a.buscarResidencia),
            observation: a.observation || "",
            endereco: a.endereco || "",
            pendente: a.pendente,
            nomePet: a.nomePet || "",
            nome: a.nome || a.usuario_nome || "Cliente",
            telefone: a.telefone || a.usuario_telefone || "",
            email: a.usuario_email || "",
            fk_service: a.fk_service,
            fk_user: a.fk_user,
            user: {
                id: a.fk_user,
                username: a.nome || a.usuario_nome || "Cliente",
                phone: a.telefone || a.usuario_telefone || "",
                email: a.usuario_email || "",
                endereco: a.endereco || ""
            },
            petAgendado: {
                name: a.nomePet || "Pet"
            },
            service: {
                id: a.fk_service,
                name: a.service_nome || "",
                nome: a.service_nome || "",
                observations: a.observation || ""
            }
        }));

        return res.status(200).json(data);
    });
});

// 2. Busca um agendamento individual pelo ID para trazer dados antigos
router.get("/administrador/agenda/:id", (req, res) => {
    const { id } = req.params;
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
            u.email AS usuario_email,
            u.telefone AS usuario_telefone,
            s.nome AS service_nome,
            s.duracao AS service_duracao,
            s.preco AS service_preco
        FROM agenda a
        LEFT JOIN usuario u ON a.fk_user = u.id
        LEFT JOIN service_infos s ON a.fk_service = s.id
        WHERE a.id = ?
    `;

    db.query(query, [id], (err, rows) => {
        if (err || !rows || rows.length === 0) {
            return res.status(404).json({ erro: "Agendamento não encontrado." });
        }

        const a = rows[0];
        const item = {
            id: a.id,
            date: a.date,
            hour: a.hour,
            buscarResidencia: Boolean(a.buscarResidencia),
            observation: a.observation || "",
            endereco: a.endereco || "",
            pendente: a.pendente,
            nomePet: a.nomePet || "",
            nome: a.nome || a.usuario_nome || "Cliente",
            telefone: a.telefone || a.usuario_telefone || "",
            email: a.usuario_email || "",
            fk_service: a.fk_service,
            fk_user: a.fk_user,
            user: {
                id: a.fk_user,
                username: a.nome || a.usuario_nome || "Cliente",
                phone: a.telefone || a.usuario_telefone || "",
                email: a.usuario_email || "",
                endereco: a.endereco || ""
            },
            petAgendado: {
                name: a.nomePet || "Pet"
            },
            service: {
                id: a.fk_service,
                name: a.service_nome || "",
                nome: a.service_nome || "",
                observations: a.observation || ""
            }
        };

        return res.status(200).json(item);
    });
});

// 3. Cancelar agendamento: exclui do banco e envia e-mail de cancelamento
router.post("/administrador/agenda/cancelar", async (req, res) => {
    const payload = req.body.payload || req.body;
    if (!payload || !payload.id) {
        return res.status(400).json({ erro: "ID do agendamento não fornecido." });
    }

    const id = payload.id;
    const query = "DELETE FROM agenda WHERE id = ?";

    db.query(query, [id], async (err) => {
        if (err) {
            console.error("Erro ao cancelar agendamento no banco:", err);
            return res.status(500).json({ erro: "Erro ao cancelar agendamento no banco." });
        }

        try {
            const to = payload.to || payload.email;
            const subject = payload.subject || payload.assunto || "Dr.Pet - Cancelamento de Agendamento";
            const html = payload.mensagemHtml || payload.html;

            if (to && html) {
                await sendEmail(html, subject, to);
            }
        } catch (emailErr) {
            console.error("Erro ao enviar e-mail de cancelamento:", emailErr);
        }

        return res.status(200).json({ sucesso: true, mensagem: "Agendamento cancelado com sucesso." });
    });
});

// 4. Editar agendamento: atualiza dados no banco e envia e-mail com as informações atualizadas
router.post("/administrador/agenda/editar", async (req, res) => {
    const payload = req.body.payload || req.body;
    if (!payload || !payload.id) {
        return res.status(400).json({ erro: "ID do agendamento não fornecido." });
    }

    const id = payload.id;
    const nome = String(payload.nome || payload.user?.username || "").trim().slice(0, 255);
    const telefone = payload.telefone || payload.user?.phone || "";
    const nomePet = String(payload.nomePet || payload.petAgendado?.name || "").trim().slice(0, 100);
    const fk_service = payload.serviceId || payload.service?.id || payload.fk_service;
    const date = payload.date;
    const hour = payload.hour;
    const endereco = String(payload.endereco || payload.user?.endereco || "").trim().slice(0, 255);
    const rawObservation = String(payload.descricao || payload.service?.observations || payload.observation || "").trim();
    const observation = rawObservation ? rawObservation.slice(0, 255) : null;
    const translado = Boolean(
        payload.buscarResidencia === true || 
        payload.buscarResidencia === "true" || 
        payload.buscarResidencia === 1
    );

    const telLimpo = cleanPhoneForDatabase(telefone);

    const query = `
        UPDATE agenda SET 
            nome = ?,
            telefone = ?,
            nomePet = ?,
            fk_service = ?,
            dateAgendamento = ?,
            hourAgendamento = ?,
            endereco = ?,
            observation = ?,
            buscarResidencia = ?
        WHERE id = ?
    `;

    db.query(query, [
        nome,
        telLimpo,
        nomePet,
        fk_service,
        date,
        hour,
        endereco,
        observation,
        translado,
        id
    ], async (err) => {
        if (err) {
            console.error("Erro ao salvar alterações do agendamento no banco:", err);
            return res.status(500).json({ erro: "Erro ao salvar alterações no banco." });
        }

        try {
            const to = payload.to || payload.email;
            const subject = payload.subject || payload.assunto || "Dr.Pet - Agendamento Atualizado";
            const html = payload.mensagemHtml || payload.html;

            if (to && html) {
                await sendEmail(html, subject, to);
            }
        } catch (emailErr) {
            console.error("Erro ao enviar e-mail de atualização:", emailErr);
        }

        return res.status(200).json({ sucesso: true, mensagem: "Agendamento atualizado com sucesso." });
    });
});

module.exports = router;