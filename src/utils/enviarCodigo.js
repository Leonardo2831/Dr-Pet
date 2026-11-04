const sendEmail = require('./SendEmail');
const codigos = require('./codigos');

const TEXTOS = {
    verificar_email: {
        assunto: 'Dr. Pet - Confirme seu e-mail',
        titulo: 'Confirme seu e-mail',
        intro: 'Use o código abaixo para confirmar seu e-mail e ativar sua conta na Dr. Pet.'
    },
    recuperar_senha: {
        assunto: 'Dr. Pet - Recuperação de senha',
        titulo: 'Recuperação de senha',
        intro: 'Recebemos um pedido para redefinir a senha da sua conta. Use o código abaixo para continuar.'
    }
};

function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function montarHtml(tipo, nome, codigo) {
    const t = TEXTOS[tipo];
    return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;border:1px solid #d4d9d6;border-radius:12px;overflow:hidden">
        <div style="background:#127447;color:#fcfcfc;padding:20px 24px;font-size:20px;font-weight:bold">Dr. Pet</div>
        <div style="padding:24px;color:#2f3331">
            <h2 style="margin:0 0 12px">${t.titulo}</h2>
            <p>Olá, ${escapeHtml(nome)}!</p>
            <p>${t.intro}</p>
            <p style="text-align:center;margin:28px 0">
                <span style="display:inline-block;font-size:34px;letter-spacing:8px;font-weight:bold;background:#e8ebe9;padding:12px 24px;border-radius:8px">${codigo}</span>
            </p>
            <p style="font-size:14px;color:#606662">O código vale por ${codigos.VALIDADE_MIN} minutos. Se você não fez essa solicitação, ignore este e-mail.</p>
        </div>
    </div>`;
}

// Mostrado na tela quando o e-mail NÃO foi enviado de verdade (SMTP não configurado ou com falha) fora de produção
const AVISO_DEV = 'Modo de desenvolvimento: o e-mail não foi enviado (o envio de e-mail não está configurado ou falhou). O código/link foi mostrado no console do servidor.';

function smtpConfigurado() {
    const { HOST_EMAIL, PORT_EMAIL, EMAIL_USER, EMAIL_PASS } = process.env;
    if (!HOST_EMAIL || !PORT_EMAIL || !EMAIL_USER || !EMAIL_PASS) return false;
    // valores de exemplo (copy.env) não contam como configurado
    const exemplos = ['seu_email@gmail.com', 'EMAIL_DRPET', 'SENHA_DE_APP_DO_GMAIL', 'SENHA_APP'];
    return !exemplos.includes(EMAIL_USER) && !exemplos.includes(EMAIL_PASS);
}

/**
 * Gera um código e envia por e-mail.
 * Retorna { ok: true } | { ok: false, erro: 'aguarde', segundos } | { ok: false, erro: 'envio' }
 * Fora de produção, se o SMTP não estiver configurado (ou falhar), o código é mostrado no console do servidor.
 */
async function enviarCodigo(usuario, tipo) {
    const resultado = await codigos.gerar(usuario.id, tipo);
    if (resultado.erro) return { ok: false, erro: resultado.erro, segundos: resultado.segundos };

    const emBreve = process.env.NODE_ENV !== 'production';
    let enviado = false;

    if (smtpConfigurado()) {
        enviado = await sendEmail(montarHtml(tipo, usuario.nome, resultado.codigo), TEXTOS[tipo].assunto, usuario.email);
    }

    if (!enviado) {
        if (emBreve) {
            console.log(`[DEV] SMTP indisponível. Código (${tipo}) para ${usuario.email}: ${resultado.codigo}`);
            return { ok: true, dev: true };
        }
        return { ok: false, erro: 'envio' };
    }

    return { ok: true };
}

// Endereço público do site, usado nos links enviados por e-mail (não vem do cabeçalho Host, que pode ser forjado)
function urlBase() {
    return String(process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
}

function montarHtmlLink(nome, link) {
    return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;border:1px solid #d4d9d6;border-radius:12px;overflow:hidden">
        <div style="background:#127447;color:#fcfcfc;padding:20px 24px;font-size:20px;font-weight:bold">Dr. Pet</div>
        <div style="padding:24px;color:#2f3331">
            <h2 style="margin:0 0 12px">Redefinir senha</h2>
            <p>Olá, ${escapeHtml(nome)}!</p>
            <p>Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
            <p style="text-align:center;margin:28px 0">
                <a href="${link}" style="display:inline-block;background:#127447;color:#fcfcfc;text-decoration:none;font-weight:bold;font-size:18px;padding:14px 28px;border-radius:8px">Redefinir minha senha</a>
            </p>
            <p style="font-size:14px;color:#606662">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="word-break:break-all">${link}</span></p>
            <p style="font-size:14px;color:#606662">O link vale por ${codigos.VALIDADE_LINK_MIN} minutos e só pode ser usado uma vez. Se você não fez essa solicitação, ignore este e-mail: sua senha continua a mesma.</p>
        </div>
    </div>`;
}

/**
 * Gera um link de recuperação de senha e envia por e-mail.
 * Retorna { ok: true } | { ok: false, erro: 'aguarde', segundos } | { ok: false, erro: 'envio' }
 * Fora de produção, se o SMTP não estiver configurado (ou falhar), o link é mostrado no console do servidor.
 */
async function enviarLinkRecuperacao(usuario) {
    const resultado = await codigos.gerarToken(usuario.id);
    if (resultado.erro) return { ok: false, erro: resultado.erro, segundos: resultado.segundos };

    const link = `${urlBase()}/recuperar-senha/redefinir?token=${resultado.token}`;

    let enviado = false;
    if (smtpConfigurado()) {
        enviado = await sendEmail(montarHtmlLink(usuario.nome, link), 'Dr. Pet - Redefinir senha', usuario.email);
    }

    if (!enviado) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] SMTP indisponível. Link de recuperação para ${usuario.email}: ${link}`);
            return { ok: true, dev: true };
        }
        return { ok: false, erro: 'envio' };
    }

    return { ok: true };
}

function mascararEmail(email) {
    const [user, domain] = String(email || '').split('@');
    if (!domain) return '';
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

module.exports = { enviarCodigo, enviarLinkRecuperacao, mascararEmail, smtpConfigurado, AVISO_DEV };
