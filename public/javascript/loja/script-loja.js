
import PopUp from './../Pop-up.js';
import ProductsLoja from './ProductsLoja.js';

document.addEventListener('DOMContentLoaded', () => {
    const filtroMenuModal = new PopUp('[data-button="filtro"]', '[data-modal="filtroLoja"]').init();
    const productsLoja = new ProductsLoja('[data-content-shop="products"]', '[data-input="filterLojaProducts"]', '[data-modal="filtroLoja"]').init();
});