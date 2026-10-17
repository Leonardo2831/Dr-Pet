
import PopUp from './../utils/Pop-up.js';
import ProductsLoja from './ProductsLoja.js';
import CheckLogin from '../utils/CheckLogin.js';

document.addEventListener('DOMContentLoaded', () => {
    new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    new PopUp('[data-button="filtro"]', '[data-modal="filtroLoja"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
    new ProductsLoja('[data-content-shop="products"]', '[data-input="filterLojaProducts"]', '[data-modal="filtroLoja"]').init();
});