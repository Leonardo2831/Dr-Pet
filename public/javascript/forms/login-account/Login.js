import Fetch from '../../Fetch.js';
import Storage from '../../Storage.js';
import toggleShowPassword from '../toggleShowPassword.js';

export default class Login{
    constructor(selectorForm, selectorInputEmail, selectorInputPassword){
        this.form = document.querySelector(selectorForm);
        this.inputEmail = document.querySelector(selectorInputEmail);
        this.inputPassword = document.querySelector(selectorInputPassword);

        this.fetchJson = new Fetch('usuarios', '[data-modal-info="login"]');

        this.loginAccount = this.loginAccount.bind(this);
    }

    markErrorInput(){
        this.inputEmail.parentElement.classList.add('error');
        this.inputPassword.parentElement.classList.add('error');

        this.inputEmail.addEventListener('focus', () => {
            this.inputEmail.parentElement.classList.remove('error');
        });
        this.inputPassword.addEventListener('focus', () => {
            this.inputPassword.parentElement.classList.remove('error');
        });
    }

    async loginAccount(event){
        event.preventDefault();

        const data = await this.fetchJson.get();
        // procura usuário válido
        const validUser = data.find(user =>
            user.email === this.inputEmail.value &&
            user.password === this.inputPassword.value
        );

        if (validUser) {
            this.fetchJson.showModalSuccess('Login realizado com sucesso!');
            if(validUser.typeUser == "comum"){
                Storage.setValueStorage('user-id', validUser.id);
                window.location.href = '../../index.html';
            } else {
                window.location.href = '../../public/pages/administrador.html';
            }
        } else {
            this.fetchJson.showModalError(null, 'E-mail ou senha incorretos');
            this.markErrorInput();
        }
    }

    addEventForm(){
        this.form.addEventListener('submit', this.loginAccount);
    }

    init(){
        if(this.form && this.inputEmail && this.inputPassword){
            toggleShowPassword();
            this.addEventForm();
        }

        return this;
    }
}