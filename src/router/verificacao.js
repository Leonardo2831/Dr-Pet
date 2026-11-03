const express = require('express');
const router = express.Router();
const db = require('../database/mysql').promise();

const codigos = require('../utils/codigos');
const criptografia = require('../utils/Criptografia');
const { enviarCodigo, mascararEmail } = require('../utils/enviarCodigo');
const { iniciarSessao, senhaValida, emailValido } = require('../utils/sessao');

const CAMPO_CODIGO = {
    name: 'codigo', label: 'Código de 6 dígitos', type: 'text', inputmode: 'numeric',
    autocomplete: 'one-time-code', pattern: '\\d{6}', minlength: 6, maxlength: 6, extraClass: 'tracking-[0.5em]'
};

const MENSAGENS_CODIGO = {
    invalido: 'Código inválido ou expirado.',
    expirado: 'Código inválido ou expirado.',
    tentativas: 'Muitas tentativas incorretas. Reenvie um novo código.'
};

function salvarSessao(req, res, destino) {
    req.session.save(() => res.redirect(destino));
}

function mensagemEnvio(resultado) {
    if (resultado.erro === 'aguarde') return `Aguarde ${resultado.segundos}s para solicitar um novo código.`;
    if (resultado.erro === 'envio') return 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.';
    return null;
}

function erroInterno(res, contexto, err) {
    console.error(`Erro em ${contexto}:`, err);
    return res.status(500).send('Erro interno. Tente novamente em instantes.');
}

// ---------------------------------------------------------------------------
// Verificação de e-mail (após cadastro ou login com e-mail ainda não confirmado)
// ---------------------------------------------------------------------------

function telaVerificarEmail(req, res, extra = {}) {
    const pendente = req.session.verificacaoPendente;
    res.render('auth-simples', {
        titulo: 'Confirme seu e-mail',
        descricao: `Enviamos um código de 6 dígitos para ${mascararEmail(pendente.email)}. Digite-o abaixo para ativar sua conta.`,
        acao: '/verificar-email/confirmar',
        reenviar: '/verificar-email/reenviar',
        campos: [CAMPO_CODIGO],
        botao: 'Confirmar',
        ...extra
    });
}

function exigirPendente(req, res, next) {
    if (!req.session.verificacaoPendente) return res.redirect('/login');
    next();
}

router.get('/verificar-email', exigirPendente, (req, res) => {
    const info = req.session.verificacaoInfo;
    delete req.session.verificacaoInfo;
    telaVerificarEmail(req, res, info ? { info } : {});
});

router.post('/verificar-email/confirmar', exigirPendente, async (req, res) => {
    try {
        const { usuarioId } = req.session.verificacaoPendente;
        const resultado = await codigos.validar(usuarioId, 'verificar_email', req.body.codigo);

        if (!resultado.ok) {
            return res.status(400).render('auth-simples', {
                titulo: 'Confirme seu e-mail',
                descricao: `Enviamos um código de 6 dígitos para ${mascararEmail(req.session.verificacaoPendente.email)}.`,
                acao: '/verificar-email/confirmar',
                reenviar: '/verificar-email/reenviar',
                campos: [CAMPO_CODIGO],
                botao: 'Confirmar',
                erro: MENSAGENS_CODIGO[resultado.motivo]
            });
        }

        await db.query('UPDATE usuario SET email_verificado = TRUE WHERE id = ?', [usuarioId]);
        const [rows] = await db.query('SELECT * FROM usuario WHERE id = ?', [usuarioId]);
        if (rows.length === 0) return res.redirect('/login');

        iniciarSessao(req, rows[0], (err) => {
            if (err) return erroInterno(res, 'iniciar sessão', err);
            res.redirect('/');
        });
    } catch (err) {
        erroInterno(res, 'confirmar e-mail', err);
    }
});

router.post('/verificar-email/reenviar', exigirPendente, async (req, res) => {
    try {
        const { usuarioId } = req.session.verificacaoPendente;
        const [rows] = await db.query('SELECT id, nome, email FROM usuario WHERE id = ?', [usuarioId]);
        if (rows.length === 0) return res.redirect('/login');

        const resultado = await enviarCodigo(rows[0], 'verificar_email');
        if (!resultado.ok) {
            return res.status(429).render('auth-simples', {
                titulo: 'Confirme seu e-mail',
                descricao: `Enviamos um código de 6 dígitos para ${mascararEmail(rows[0].email)}.`,
                acao: '/verificar-email/confirmar',
                reenviar: '/verificar-email/reenviar',
                campos: [CAMPO_CODIGO],
                botao: 'Confirmar',
                erro: mensagemEnvio(resultado)
            });
        }

        req.session.verificacaoInfo = 'Enviamos um novo código para o seu e-mail.';
        salvarSessao(req, res, '/verificar-email');
    } catch (err) {
        erroInterno(res, 'reenviar código de verificação', err);
    }
});

// ---------------------------------------------------------------------------
// Recuperação de senha
// ---------------------------------------------------------------------------

function telaPedirEmail(res, extra = {}) {
    res.render('auth-simples', {
        titulo: 'Recuperar senha',
        descricao: 'Informe o e-mail da sua conta. Enviaremos um código de 6 dígitos para você criar uma nova senha.',
        acao: '/recuperar-senha',
        campos: [{ name: 'email', label: 'E-mail', type: 'email', autocomplete: 'email', minlength: 5, maxlength: 255, value: extra.email || '' }],
        botao: 'Enviar código',
        ...extra
    });
}

function telaCodigoRecuperacao(req, res, extra = {}) {
    res.render('auth-simples', {
        titulo: 'Digite o código',
        descricao: `Se existir uma conta com o e-mail ${mascararEmail(req.session.recuperacao.email)}, enviamos um código de 6 dígitos para ele.`,
        acao: '/recuperar-senha/codigo',
        reenviar: '/recuperar-senha/reenviar',
        campos: [CAMPO_CODIGO],
        botao: 'Continuar',
        voltarHref: '/recuperar-senha',
        voltarTexto: 'Usar outro e-mail',
        ...extra
    });
}

function exigirRecuperacao(req, res, next) {
    if (!req.session.recuperacao) return res.redirect('/recuperar-senha');
    next();
}

router.get('/recuperar-senha', (req, res) => telaPedirEmail(res));

// Resposta sempre igual, exista a conta ou não (não revela quais e-mails estão cadastrados)
router.post('/recuperar-senha', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!emailValido(email)) {
        res.status(400);
        return telaPedirEmail(res, { erro: 'Informe um e-mail válido.', email });
    }
    try {
        const [rows] = await db.query('SELECT id, nome, email FROM usuario WHERE email = ?', [email]);
        const usuario = rows[0] || null;

        if (usuario) {
            const resultado = await enviarCodigo(usuario, 'recuperar_senha');
            if (!resultado.ok && resultado.erro === 'aguarde') {
                // já existe um código recente: segue para a tela do código sem revelar nada
            } else if (!resultado.ok) {
                console.error('Falha ao enviar código de recuperação para', email);
            }
        }

        req.session.recuperacao = { email, usuarioId: usuario ? usuario.id : null, validado: false };
        salvarSessao(req, res, '/recuperar-senha/codigo');
    } catch (err) {
        erroInterno(res, 'pedir recuperação de senha', err);
    }
});

router.get('/recuperar-senha/codigo', exigirRecuperacao, (req, res) => {
    const info = req.session.recuperacaoInfo;
    delete req.session.recuperacaoInfo;
    telaCodigoRecuperacao(req, res, info ? { info } : {});
});

router.post('/recuperar-senha/codigo', exigirRecuperacao, async (req, res) => {
    try {
        const { usuarioId } = req.session.recuperacao;
        const resultado = usuarioId
            ? await codigos.validar(usuarioId, 'recuperar_senha', req.body.codigo)
            : { ok: false, motivo: 'invalido' };

        if (!resultado.ok) {
            res.status(400);
            return telaCodigoRecuperacao(req, res, { erro: MENSAGENS_CODIGO[resultado.motivo] });
        }

        req.session.recuperacao.validado = true;
        salvarSessao(req, res, '/recuperar-senha/nova');
    } catch (err) {
        erroInterno(res, 'validar código de recuperação', err);
    }
});

router.post('/recuperar-senha/reenviar', exigirRecuperacao, async (req, res) => {
    try {
        const { usuarioId } = req.session.recuperacao;
        if (usuarioId) {
            const [rows] = await db.query('SELECT id, nome, email FROM usuario WHERE id = ?', [usuarioId]);
            if (rows.length) {
                const resultado = await enviarCodigo(rows[0], 'recuperar_senha');
                if (!resultado.ok && resultado.erro === 'aguarde') {
                    res.status(429);
                    return telaCodigoRecuperacao(req, res, { erro: mensagemEnvio(resultado) });
                }
            }
        }
        req.session.recuperacaoInfo = 'Se a conta existir, enviamos um novo código.';
        salvarSessao(req, res, '/recuperar-senha/codigo');
    } catch (err) {
        erroInterno(res, 'reenviar código de recuperação', err);
    }
});

function exigirCodigoValidado(req, res, next) {
    if (!req.session.recuperacao || !req.session.recuperacao.validado) return res.redirect('/recuperar-senha');
    next();
}

function telaNovaSenha(res, extra = {}) {
    res.render('auth-simples', {
        titulo: 'Nova senha',
        descricao: 'Crie uma nova senha com 8 a 60 caracteres.',
        acao: '/recuperar-senha/nova',
        campos: [
            { name: 'password', label: 'Nova senha', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 60 },
            { name: 'confirmPassword', label: 'Confirmar nova senha', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 60 }
        ],
        botao: 'Salvar senha',
        ...extra
    });
}

router.get('/recuperar-senha/nova', exigirCodigoValidado, (req, res) => telaNovaSenha(res));

router.post('/recuperar-senha/nova', exigirCodigoValidado, async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!senhaValida(password)) {
        res.status(400);
        return telaNovaSenha(res, { erro: 'A senha deve ter de 8 a 60 caracteres.' });
    }
    if (password !== confirmPassword) {
        res.status(400);
        return telaNovaSenha(res, { erro: 'As senhas não coincidem.' });
    }

    try {
        const { usuarioId } = req.session.recuperacao;
        // Quem recebeu o código no e-mail provou ser dono dele, então o e-mail também fica verificado
        await db.query('UPDATE usuario SET senha = ?, email_verificado = TRUE WHERE id = ?', [criptografia.generateHash(password), usuarioId]);
        await db.query("UPDATE codigo_verificacao SET usado = TRUE WHERE usuario_id = ? AND tipo = 'recuperar_senha'", [usuarioId]);

        // Encerra a sessão atual: a pessoa precisa entrar com a nova senha
        req.session.regenerate((err) => {
            if (err) return erroInterno(res, 'regenerar sessão', err);
            res.redirect('/login?msg=senha-alterada');
        });
    } catch (err) {
        erroInterno(res, 'salvar nova senha', err);
    }
});

module.exports = router;
