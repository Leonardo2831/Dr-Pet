// Cria a sessão de login com o mesmo formato usado em toda a aplicação
function iniciarSessao(req, usuario, callback) {
    req.session.regenerate((errRegen) => {
        if (errRegen) return callback(errRegen);

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            tipoUsuario: usuario.tipo_usuario,
            avatar: usuario.avatar
        };

        req.session.save(callback);
    });
}

function senhaValida(senha) {
    return typeof senha === 'string' && senha.length >= 8 && senha.length <= 60;
}

function emailValido(email) {
    return typeof email === 'string' && email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = { iniciarSessao, senhaValida, emailValido };
