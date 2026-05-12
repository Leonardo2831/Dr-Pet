import PopUp from './../Pop-up.js';
import Calender from './Calender.js';
import selectAgenda from './selectAgenda.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();
    selectAgenda(selectService);

    const calender = new Calender('[data-calender-title="month"]', '[data-calender-title="year"]', '[data-button="next-month"]', '[data-button="prev-month"]', '[data-container="calender-days"]').init();
});