// Testa o envio de e-mail com as configurações do .env: npm run test-email [destinatario@exemplo.com]
// Se não informar o destinatário, envia para o próprio EMAIL_USER.
require('dotenv').config({ quiet: true });
const nodemailer = require('nodemailer');
const { smtpConfigurado } = require('../src/utils/enviarCodigo');

const { HOST_EMAIL, PORT_EMAIL, EMAIL_USER, EMAIL_PASS } = process.env;

console.log('Configuração lida do .env:');
console.log(`  HOST_EMAIL = ${HOST_EMAIL}`);
console.log(`  PORT_EMAIL = ${PORT_EMAIL}`);
console.log(`  EMAIL_USER = ${EMAIL_USER}`);
console.log(`  EMAIL_PASS = ${EMAIL_PASS ? `(${EMAIL_PASS.length} caracteres)` : '(vazio)'}`);

if (!smtpConfigurado()) {
    console.error('\n[X] O e-mail ainda NÃO está configurado: EMAIL_USER / EMAIL_PASS estão vazios ou com os valores de exemplo.');
    console.error('    Edite o .env com o seu Gmail e a senha de app, e rode este teste de novo.');
    process.exit(1);
}

const porta = Number(PORT_EMAIL);
const transporter = nodemailer.createTransport({
    host: HOST_EMAIL,
    port: porta,
    secure: porta === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    connectionTimeout: 10000
});

const DICAS = {
    EAUTH: 'Login recusado. No Gmail é preciso usar uma SENHA DE APP (não a senha normal da conta), com a verificação em duas etapas ligada. EMAIL_USER deve ser o endereço Gmail completo.',
    ESOCKET: 'Não foi possível conectar com segurança. Confira HOST_EMAIL/PORT_EMAIL (smtp.gmail.com / 587). Antivírus ou proxy que inspeciona HTTPS também pode causar isso.',
    ECONNECTION: 'Sem conexão com o servidor SMTP. Confira a internet, o firewall e a porta (587).',
    ETIMEDOUT: 'Tempo esgotado. A rede pode estar bloqueando a porta 587.',
    EENVELOPE: 'Endereço de destino inválido.'
};

(async () => {
    const destino = process.argv[2] || EMAIL_USER;
    try {
        await transporter.verify();
        console.log('\n[OK] Conectou e autenticou no servidor SMTP.');

        await transporter.sendMail({
            from: `"Dr. Pet" <${EMAIL_USER}>`,
            to: destino,
            subject: 'Dr. Pet - teste de envio de e-mail',
            html: '<p>Se você recebeu este e-mail, o envio do Dr. Pet está funcionando.</p>'
        });
        console.log(`[OK] E-mail de teste enviado para ${destino}. Confira a caixa de entrada (e o spam).`);
    } catch (err) {
        console.error(`\n[X] Falhou: ${err.message}`);
        console.error(`    código: ${err.code || '-'}${err.responseCode ? ` | resposta SMTP: ${err.responseCode}` : ''}`);
        if (DICAS[err.code]) console.error(`    dica: ${DICAS[err.code]}`);
        process.exitCode = 1;
    }
})();
