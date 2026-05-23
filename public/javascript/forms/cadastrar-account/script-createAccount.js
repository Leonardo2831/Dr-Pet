import Cadastrar from "./Cadastrar.js";
import formatPhone from "../../formatPhone.js";

document.addEventListener('DOMContentLoaded', () => {
    formatPhone('[data-input="formatPhone"]');
    const cadastrarAccount = new Cadastrar('[data-form="cadastrar"]').init();
});