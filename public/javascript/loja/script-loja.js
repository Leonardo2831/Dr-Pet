
import PopUp from './../Pop-up.js';
import slidesLoja from './slides-produtos-loja.js';

document.addEventListener('DOMContentLoaded', () => {
    slidesLoja();
    const filtroMenu = new PopUp('[data-button="filtro"]', '[data-modal="filtro"]').init();
});