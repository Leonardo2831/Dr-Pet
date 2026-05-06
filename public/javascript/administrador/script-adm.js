import selectSectionAdm from "./select-section-adm.js";
import SlidesHome from "./Slides-home.js";

document.addEventListener('DOMContentLoaded', () => {
    selectSectionAdm();
    const slidesConfig = new SlidesHome('[data-add-slide]', '[data-content-slides]').init();
});