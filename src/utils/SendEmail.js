const nodemailer = require("nodemailer");

function sendEmail(html, subject, to){
    const transporter = nodemailer.createTestAccount({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'SEU_EMAIL',
            pass: 'SUA_SENHA'
        }
    });

    async function send(){
        try{
            const info = await transporter.sendMail({
                from: '"Meu App" <[EMAIL_ADDRESS]>',
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

    send();
}

module.exports = sendEmail;