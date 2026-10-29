require('dotenv').config();
const nodemailer = require("nodemailer");

function sendEmail(html, subject, to){
    const transporter = nodemailer.createTransport({
        host: process.env.HOST_EMAIL,
        port: process.env.PORT_EMAIL,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    async function send(){
        try {
            await transporter.sendMail({
                from: `"Dr. Pet" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });

            console.log("Email enviado com sucesso.");
            return true;
        } catch(err) {
            console.log("Erro ao enviar o email ao destinatário: " + err);
            return false;
        }
    }

    return send();
}

module.exports = sendEmail;