
import PopUp from './../Pop-up.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();
});