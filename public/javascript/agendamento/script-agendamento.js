import PopUp from './../Pop-up.js';
import Calender from './Calender.js';
import Hours from './Hours.js';
import selectAgenda from './selectAgenda.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();
    selectAgenda(selectService);
    const hours = new Hours('[data-content="hours-morning"]', '[data-content="hours-afternoon"]').init();
    const calender = new Calender('[data-calender-title="month"]', '[data-calender-title="year"]', '[data-button="next-month"]', '[data-button="prev-month"]', '[data-container="calender-days"]', '[data-schedule-date="agenda"]', '[data-schedule-time="agenda"]', (date) => hours.loadByDay(date)).init();
});