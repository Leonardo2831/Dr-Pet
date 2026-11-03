const express = require('express');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const db = require('../database/mysql').promise();
const { iniciarSessao } = require('../utils/sessao');

function googleConfigurado() {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
}

function criarCliente() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

/**
 * Encontra (ou cria) o usuário a partir dos dados verificados do Google.
 *  1. já existe com esse google_id           -> usa
 *  2. existe conta com o mesmo e-mail        -> vincula o google_id (o Google garante o e-mail)
 *  3. não existe                             -> cria conta sem senha e sem telefone
 */
async function resolverUsuarioGoogle({ sub, email, nome }) {
    const emailNormalizado = String(email).trim().toLowerCase();

    const [porGoogle] = await db.query('SELECT * FROM usuario WHERE google_id = ?', [sub]);
    if (porGoogle.length) return porGoogle[0];

    const [porEmail] = await db.query('SELECT * FROM usuario WHERE email = ?', [emailNormalizado]);
    if (porEmail.length) {
        const existente = porEmail[0];
        if (existente.google_id && existente.google_id !== sub) {
            throw new Error('E-mail já vinculado a outra conta Google.');
        }
        await db.query('UPDATE usuario SET google_id = ?, email_verificado = TRUE WHERE id = ?', [sub, existente.id]);
        const [atualizado] = await db.query('SELECT * FROM usuario WHERE id = ?', [existente.id]);
        return atualizado[0];
    }

    const nomeFinal = String(nome || emailNormalizado.split('@')[0]).trim().slice(0, 150);
    const [resultado] = await db.query(
        'INSERT INTO usuario (nome, email, google_id, email_verificado) VALUES (?, ?, ?, TRUE)',
        [nomeFinal, emailNormalizado, sub]
    );
    const [novo] = await db.query('SELECT * FROM usuario WHERE id = ?', [resultado.insertId]);
    return novo[0];
}

router.get('/auth/google', (req, res) => {
    if (!googleConfigurado()) return res.redirect('/login?msg=google-indisponivel');

    const state = crypto.randomBytes(24).toString('hex');
    req.session.googleState = state;

    const url = criarCliente().generateAuthUrl({
        scope: ['openid', 'email', 'profile'],
        state,
        prompt: 'select_account'
    });

    req.session.save(() => res.redirect(url));
});

router.get('/auth/google/callback', async (req, res) => {
    if (!googleConfigurado()) return res.redirect('/login?msg=google-indisponivel');

    const { code, state, error } = req.query;
    const esperado = req.session.googleState;
    delete req.session.googleState;

    if (error) return res.redirect('/login?msg=google-cancelado');

    const stateOk = typeof state === 'string' && typeof esperado === 'string' &&
        state.length === esperado.length &&
        crypto.timingSafeEqual(Buffer.from(state), Buffer.from(esperado));

    if (!stateOk || typeof code !== 'string') return res.redirect('/login?msg=google-erro');

    try {
        const cliente = criarCliente();
        const { tokens } = await cliente.getToken(code);
        const ticket = await cliente.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();

        if (!payload || !payload.email || payload.email_verified !== true) {
            return res.redirect('/login?msg=google-email-nao-verificado');
        }

        const usuario = await resolverUsuarioGoogle({ sub: payload.sub, email: payload.email, nome: payload.name });

        iniciarSessao(req, usuario, (err) => {
            if (err) {
                console.error('Erro ao salvar sessão (Google):', err);
                return res.redirect('/login?msg=google-erro');
            }
            res.redirect('/');
        });
    } catch (err) {
        console.error('Erro no login com Google:', err.message);
        res.redirect('/login?msg=google-erro');
    }
});

module.exports = router;
module.exports.resolverUsuarioGoogle = resolverUsuarioGoogle;
