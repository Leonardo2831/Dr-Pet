// Middleware para verificar se o usuário está logado nas rotas protegidas
function verificarLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

function loadUser(req, res, next) {
    res.locals.user = (req.session && req.session.usuario) ? req.session.usuario : null;
    next();
}

module.exports = { verificarLogin, loadUser };