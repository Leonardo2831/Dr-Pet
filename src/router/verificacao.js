const express = require('express');
const router = express.Router();
const db = require('../database/mysql').promise();

const codigos = require('../utils/codigos');
const criptografia = require('../utils/Criptografia');
const { enviarCodigo, enviarLinkRecuperacao, mascararEmail, AVISO_DEV } = require('../utils/enviarCodigo');
const { iniciarSessao, senhaValida } = require('../utils/sessao');

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

        req.session.verificacaoInfo = resultado.dev ? AVISO_DEV : 'Enviamos um novo código para o seu e-mail.';
        salvarSessao(req, res, '/verificar-email');
    } catch (err) {
        erroInterno(res, 'reenviar código de verificação', err);
    }
});

// ---------------------------------------------------------------------------
// Recuperação de senha (por link enviado ao e-mail)
// ---------------------------------------------------------------------------

// Formato básico: algo@algo (sem espaços). Se o e-mail existir ou não é decidido na consulta ao banco.
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+$/;

function telaPedirEmail(res, extra = {}) {
    res.render('auth-simples', {
        titulo: 'Recuperar senha',
        descricao: 'Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.',
        acao: '/recuperar-senha',
        semValidacaoNavegador: true,
        campos: [{ name: 'email', label: 'E-mail', type: 'email', autocomplete: 'email', maxlength: 255, value: extra.email || '' }],
        botao: 'Enviar link',
        ...extra
    });
}

router.get('/recuperar-senha', (req, res) => telaPedirEmail(res));

router.post('/recuperar-senha', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();

    const falhar = (status, erro) => {
        res.status(status);
        return telaPedirEmail(res, { erro, email: req.body.email });
    };

    if (!email) return falhar(400, 'Informe o e-mail da sua conta.');
    if (email.length > 255 || !FORMATO_EMAIL.test(email)) return falhar(400, 'Formato de e-mail inválido.');

    try {
        const [rows] = await db.query('SELECT id, nome, email FROM usuario WHERE email = ?', [email]);
        if (rows.length === 0) return falhar(404, 'E-mail não cadastrado.');

        const resultado = await enviarLinkRecuperacao(rows[0]);

        if (!resultado.ok) {
            if (resultado.erro === 'aguarde') {
                return falhar(429, `Já enviamos um link para esse e-mail. Aguarde ${resultado.segundos}s para solicitar outro.`);
            }
            return falhar(500, 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.');
        }

        if (resultado.dev) {
            // o e-mail NÃO saiu: não dizer que foi enviado
            return telaPedirEmail(res, { email: req.body.email, info: AVISO_DEV });
        }

        telaPedirEmail(res, {
            email: req.body.email,
            info: `Enviamos um link para ${mascararEmail(rows[0].email)}. Ele vale por ${codigos.VALIDADE_LINK_MIN} minutos. Confira também a caixa de spam.`
        });
    } catch (err) {
        erroInterno(res, 'pedir recuperação de senha', err);
    }
});

// Link recebido por e-mail: valida o token e leva para a tela da nova senha (sem deixar o token na URL)
router.get('/recuperar-senha/redefinir', async (req, res) => {
    try {
        const usuarioId = await codigos.usuarioDoToken(req.query.token);

        if (!usuarioId) {
            return res.status(400).render('auth-simples', {
                titulo: 'Link inválido',
                descricao: 'Este link de recuperação é inválido, expirou ou já foi usado. Solicite um novo link.',
                semFormulario: true,
                voltarHref: '/recuperar-senha',
                voltarTexto: 'Solicitar novo link'
            });
        }

        req.session.recuperacao = { usuarioId, token: req.query.token };
        salvarSessao(req, res, '/recuperar-senha/nova');
    } catch (err) {
        erroInterno(res, 'validar link de recuperação', err);
    }
});

// A sessão precisa ter vindo de um link válido, e o token ainda precisa valer (não usado nem expirado)
async function exigirLinkValido(req, res, next) {
    const recuperacao = req.session.recuperacao;
    if (!recuperacao || !recuperacao.token) return res.redirect('/recuperar-senha');

    const usuarioId = await codigos.usuarioDoToken(recuperacao.token);
    if (!usuarioId || usuarioId !== recuperacao.usuarioId) {
        delete req.session.recuperacao;
        return res.status(400).render('auth-simples', {
            titulo: 'Link inválido',
            descricao: 'Este link de recuperação expirou ou já foi usado. Solicite um novo link.',
            semFormulario: true,
            voltarHref: '/recuperar-senha',
            voltarTexto: 'Solicitar novo link'
        });
    }
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

router.get('/recuperar-senha/nova', exigirLinkValido, (req, res) => telaNovaSenha(res));

router.post('/recuperar-senha/nova', exigirLinkValido, async (req, res) => {
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
        // Quem recebeu o link no e-mail provou ser dono dele, então o e-mail também fica verificado
        await db.query('UPDATE usuario SET senha = ?, email_verificado = TRUE WHERE id = ?', [criptografia.generateHash(password), usuarioId]);
        await codigos.consumirTokens(usuarioId); // o link não pode ser usado de novo

        // Deixa a pessoa logada: ela acabou de provar que é dona da conta (link do e-mail) e de definir a senha.
        // iniciarSessao troca o id da sessão, então nada do fluxo de recuperação fica para trás.
        const [rows] = await db.query('SELECT * FROM usuario WHERE id = ?', [usuarioId]);
        if (rows.length === 0) return res.redirect('/login');

        iniciarSessao(req, rows[0], (err) => {
            if (err) return erroInterno(res, 'iniciar sessão após redefinir senha', err);
            res.redirect('/'); // conta sem telefone (criada pelo Google) segue para /completar-cadastro
        });
    } catch (err) {
        erroInterno(res, 'salvar nova senha', err);
    }
});

module.exports = router;
