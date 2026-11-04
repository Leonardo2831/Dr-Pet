// Middleware para verificar se o usuário está logado nas rotas protegidas
function verificarLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

function verificarAdmin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
    }
    if (req.session.usuario.tipoUsuario !== 'admin') {
        return res.status(403).send('Acesso negado.');
    }
    next();
}

function loadUser(req, res, next) {
    res.locals.user = (req.session && req.session.usuario) ? req.session.usuario : null;
    next();
}

// Quem entrou com o Google e ainda não informou telefone/senha é levado a completar o cadastro
const ROTAS_LIBERADAS_PERFIL_INCOMPLETO = ['/completar-cadastro', '/logout'];

function exigirPerfilCompleto(req, res, next) {
    const usuario = req.session && req.session.usuario;
    const navegacao = req.method === 'GET' && (req.headers.accept || '').includes('text/html');

    if (usuario && usuario.perfilIncompleto && navegacao && !ROTAS_LIBERADAS_PERFIL_INCOMPLETO.includes(req.path)) {
        return res.redirect('/completar-cadastro');
    }
    next();
}

module.exports = { verificarLogin, verificarAdmin, loadUser, exigirPerfilCompleto };