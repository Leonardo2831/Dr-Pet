import PopUp from './../utils/Pop-up.js';
import CheckLogin from './../utils/CheckLogin.js';

document.addEventListener('DOMContentLoaded', () => {
    new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
});