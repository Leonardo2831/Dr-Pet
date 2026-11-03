require('dotenv').config();
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
    if (!transporter) {
        const port = Number(process.env.PORT_EMAIL);
        transporter = nodemailer.createTransport({
            host: process.env.HOST_EMAIL,
            port,
            // 465 usa TLS direto; 587 usa STARTTLS (secure: false)
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

async function sendEmail(html, subject, to) {
    try {
        await getTransporter().sendMail({
            from: `"Dr. Pet" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email enviado com sucesso.");
        return true;
    } catch (err) {
        console.log("Erro ao enviar o email ao destinatário: " + err);
        return false;
    }
}

module.exports = sendEmail;
