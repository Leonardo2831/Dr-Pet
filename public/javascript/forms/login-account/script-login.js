import Login from "./Login.js";
import CheckLogin from "../../utils/checkLogin.js";

document.addEventListener('DOMContentLoaded', () => {
    const login = new Login('[data-form="login"]', '[data-input="emailLogin"]', '[data-input="passwordLogin"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
});