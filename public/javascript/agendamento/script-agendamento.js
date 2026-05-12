import PopUp from './../Pop-up.js';
import selectAgenda from './selectAgenda.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();
    selectAgenda(selectService);
});