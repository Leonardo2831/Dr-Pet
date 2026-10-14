// Middleware opcional para verificar se o usuário está logado em todas essas rotas
function verificarLogin(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
    }
    next();
}

module.exports = { verificarLogin };