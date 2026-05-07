import PopUp from "../Pop-up.js";
import initSlides from "./initSlides.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuMobile"]', '[data-menuMobile]').init();
    initSlides();
});