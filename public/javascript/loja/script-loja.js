
import PopUp from './../utils/Pop-up.js';
import ProductsLoja from './ProductsLoja.js';
import CheckLogin from '../utils/checkLogin.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
    const filtroMenuModal = new PopUp('[data-button="filtro"]', '[data-modal="filtroLoja"]').init();
    const productsLoja = new ProductsLoja('[data-content-shop="products"]', '[data-input="filterLojaProducts"]', '[data-modal="filtroLoja"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
});