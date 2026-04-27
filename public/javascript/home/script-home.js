import PopUp from "../Pop-up.js";
import slidesHome from "../slides/slides-home.js";

document.addEventListener('DOMContentLoaded', () => {
    slidesHome();
    const menuMobileHeader = new PopUp('[data-button="menuMobile"]', '[data-menuMobile]').init();
    const menuUser = new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
});