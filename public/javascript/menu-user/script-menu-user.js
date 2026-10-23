import PopUp from './../utils/Pop-up.js';
import CheckLogin from './../utils/CheckLogin.js';

function initMenuUser() {
    new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenuUser);
} else {
    initMenuUser();
}