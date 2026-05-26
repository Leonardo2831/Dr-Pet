import PopUp from "../utils/Pop-up.js";
import initSlides from "./initSlides.js";
import CheckLogin from "../utils/checkLogin.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    initSlides();
    new CheckLogin('[data-modal="loginRequired"]').init();
});