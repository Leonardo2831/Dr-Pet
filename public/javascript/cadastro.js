import Fetch from './fetch.js';

const apiUsuarios = new Fetch('usuarios', '#modal-info');

const formCadastro = document.querySelector('form');

formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(formCadastro);
    const dadosUsuario = Object.fromEntries(formData.entries());

    if (dadosUsuario.password !== dadosUsuario.confirmPassword) {
        apiUsuarios.showModalError('As senhas não são iguais');
        alert("As senhas não sao iguais! ");
        const modalErr = document.getElementById('modal-info');
        return;
    }
    delete dadosUsuario.confirmPassword;
    dadosUsuario.pets = [];
    dadosUsuario.typeUser = "comum";
    const response = await apiUsuarios.post(dadosUsuario);

    if (response && response.ok) {
        alert("Conta criada com sucesso! ");
        window.location.href = 'login.html';
    }

});

const botaoSenhaMostrar = document.querySelectorAll('[data-toggle-password]');
    botaoSenhaMostrar.forEach(button => {
        button.addEventListener("click", () => {
            const inputId = button.getAttribute('data-toggle-password');
            const senhaInput = document.getElementById(inputId);
            const iconImg = button.querySelector('img');

            if(senhaInput.type === 'password') {
                senhaInput.type = 'text';
                console.log("senha visivel")
            } else {
                senhaInput.type = 'password';
                console.log("senha invisivel")
            }
        });
});