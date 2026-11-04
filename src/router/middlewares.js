// Middleware para verificar se o usuário está logado nas rotas protegidas
function verificarLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

// Só administradores. Navegação do navegador (e envio de formulário) é redirecionada/recusada com página;
// chamadas fetch/API recebem JSON com o status certo (401 = não logado, 403 = logado sem permissão).
function verificarAdmin(req, res, next) {
    const usuario = req.session && req.session.usuario;
    const querPagina = (req.headers.accept || '').includes('text/html');

    if (!usuario) {
        return querPagina ? res.redirect('/login') : res.status(401).json({ erro: 'É preciso estar logado como administrador.' });
    }
    if (usuario.tipoUsuario !== 'admin') {
        return querPagina ? res.status(403).send('Acesso negado.') : res.status(403).json({ erro: 'Acesso negado.' });
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