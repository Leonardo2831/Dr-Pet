import selectSectionAdm from "./select-section-adm.js";
import SlidesHome from "./SlidesHome.js";
import Agenda from "./Agenda.js";
import Products from "./Products.js";

document.addEventListener('DOMContentLoaded', () => {
    selectSectionAdm();
    const slidesConfig = new SlidesHome('[data-add-slide]', '[data-content-slides]').init();
    const scheduleConfig = new Agenda('[data-content-schedule]', '[data-input-date="adm"]', '[data-select="service"]', '[data-button="searchSchedule"]').init();
    const productsConfig = new Products('[data-content-products="table"]', '[data-button="addProduct"]', '[data-input="filterProduct"]', '[data-select="typeProduct"]').init();
});