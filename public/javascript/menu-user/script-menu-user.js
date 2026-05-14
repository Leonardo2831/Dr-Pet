import MenuUserLoading from './MenuUserLoding.js';
import PopUp from './../Pop-up.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    const menuUserConfig = new MenuUserLoading('[data-modal="menuUser"]').init();
});