import Fetch from '../../Fetch.js';
import toggleShowPassword from '../toggleShowPassword.js';

export default class Cadastrar {
    constructor(selectorForm) {
        this.form = document.querySelector(selectorForm);
        this.api = new Fetch('usuarios', '[data-modal-info="cadastrar"]');

        this.formCadastrar = this.formCadastrar.bind(this);
    }

    async formCadastrar(event){
        event.preventDefault();

        const formData = new FormData(this.form);
        // cria um objeto com os dados do formulário
        const dadosUsuario = Object.fromEntries(formData.entries());

        if (dadosUsuario.password !== dadosUsuario.confirmPassword) {
            this.api.showModalError('As senhas não são iguais');
            return;
        }

        // deletando o atributo do objeto de confirmação de senha
        delete dadosUsuario.confirmPassword;
        dadosUsuario.id = crypto.randomUUID();
        dadosUsuario.pets = [];
        dadosUsuario.typeUser = 'comum';

        const response = await this.api.post(dadosUsuario);

        if (response && response.ok) {
            this.api.showModalSuccess('Conta criada com sucesso!');
            window.location.href = 'login.html';
        }
    }

    addEventSubmit() {
        this.form.addEventListener('submit', this.formCadastrar);
    }

    init(){
        if(this.form){
            this.addEventSubmit();
            toggleShowPassword();
        }

        return this;
    }
}