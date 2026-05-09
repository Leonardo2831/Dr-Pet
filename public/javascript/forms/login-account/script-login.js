import Fetch from '../../Fetch.js';

const api = new Fetch('usuarios', '#modal-info');

const form = document.getElementById('form-login');

const emailInput = document.getElementById('email');

const passwordInput = document.getElementById('password');

console.log(form, emailInput, passwordInput);

form.addEventListener('submit', async (event) => {

    // IMPEDE A SENHA DE IR PRA URL
    event.preventDefault();

    const emailDigitado = emailInput.value;
    const senhaDigitada = passwordInput.value;

    console.log('teste')

    // busca os dados do json-server
    const dados = await api.get();

    // procura usuário válido
    const usuarioValido = dados.find(item =>
        item.user.email === emailDigitado &&
        item.user.password === senhaDigitada
    );

    console.log(usuarioValido);

    if (usuarioValido) {

        api.showModalSuccess('Login realizado com sucesso!');

        // pega o ID do usuário
        const userId = usuarioValido.user.id;

        console.log('ID:', userId);

        // redireciona
        setTimeout(() => {
            window.open(`index.html?id=${userId}`);
        }, 1000);

    } else {
        api.showModalError(
            null,
            'E-mail ou senha incorretos'
        );
    }

});