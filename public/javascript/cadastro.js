import Fetch from './fetch.js';

const apiUsuarios = new Fetch('usuarios', '#modal-info');

const formCadastro = document.querySelector('form');

formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(formCadastro);
    const dadosUsuario = Object.fromEntries(formData.entries());

    if (dadosUsuario.password !== dadosUsuario.confirmPassword) {
        apiUsuarios.showModalError('As senhas não são iguais');
        const modalErr = document.getElementById('modal-info');
        return;
    }
    delete dadosUsuario.confirmPassword;

    const response = await apiUsuarios.post(dadosUsuario);

    if (response && response.ok) {
        formCadastro.reset();
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
});