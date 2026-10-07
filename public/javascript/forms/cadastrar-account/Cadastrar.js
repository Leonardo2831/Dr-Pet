import Criptografia from '../../utils/Criptografia.js';
import Fetch from '../../utils/Fetch.js';
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
        // cria um objeto com os dados do formulÃ¡rio
        const dadosUsuario = Object.fromEntries(formData.entries());

        if (dadosUsuario.password !== dadosUsuario.confirmPassword) {
            this.api.showModalError("Erro de autenticaÃ§Ã£o, senhas diferentes", 'As senhas nÃ£o sÃ£o iguais');
            return;
        }

        // deletando o atributo do objeto de confirmaÃ§Ã£o de senha
        delete dadosUsuario.confirmPassword;
        dadosUsuario.id = crypto.randomUUID();
        dadosUsuario.password = Criptografia.generateHash(dadosUsuario.password);
        dadosUsuario.pets = [];
        dadosUsuario.address = [];
        dadosUsuario.typeUser = 'comum';
        dadosUsuario.avatar = "";

        const response = await this.api.post(dadosUsuario);

        if (response && response.ok) {
            this.api.showModalSuccess('Conta criada com sucesso!');
            window.location.href = '/login';
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
