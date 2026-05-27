import Cadastrar from "./Cadastrar.js";
import formatPhone from "../../utils/formatPhone.js";
import CheckLogin from "../../utils/checkLogin.js";

document.addEventListener('DOMContentLoaded', () => {
    formatPhone('[data-input="formatPhone"]');
    const cadastrarAccount = new Cadastrar('[data-form="cadastrar"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
});