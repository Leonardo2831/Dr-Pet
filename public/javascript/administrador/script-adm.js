import selectSectionAdm from "./select-section-adm.js";
import SlidesHome from "./Slides-home.js";
import Agenda from "./Agenda.js";

document.addEventListener('DOMContentLoaded', () => {
    selectSectionAdm();
    const slidesConfig = new SlidesHome('[data-add-slide]', '[data-content-slides]').init();
    const scheduleConfig = new Agenda('[data-content-schedule]', '[data-input-date="adm"]', '[data-select="service"]', '[data-button="searchSchedule"]').init();
});