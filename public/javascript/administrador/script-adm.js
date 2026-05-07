import selectSectionAdm from "./select-section-adm.js";
import SlidesHome from "./SlidesHome.js";
import Agenda from "./Agenda.js";
import Products from "./Products.js";
import FormProduct from "./FormProduct.js";

document.addEventListener('DOMContentLoaded', () => {
    selectSectionAdm();
    const slidesConfig = new SlidesHome('[data-add-slide]', '[data-content-slides]').init();
    const scheduleConfig = new Agenda('[data-content-schedule]', '[data-input-date="adm"]', '[data-select="service"]', '[data-button="searchSchedule"]').init();
    const formProduct = new FormProduct('[data-modal="addProduct"]', '[data-form="addProduct"]', '[data-button="closeFormProduct"]', 
        '[data-input="product-name"]', '[data-select-new="productCategory"]', '[data-input="priceProduct"]', '[data-textarea="shortDescription"]', '[data-textarea="longDescription"]',
        '[data-input="imageMainProduct"]', '[data-input="imageSlideProduct"]', '[data-info="mainImage"]', '[data-info="slideImages"]', '[data-button="createProduct"]').init();
    const productsConfig = new Products('[data-content-products="table"]', '[data-button="addProduct"]', '[data-input="filterProduct"]', '[data-select="typeProduct"]', formProduct).init();
});