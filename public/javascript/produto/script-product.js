import LoadProduct from "./LoadProduct.js";

document.addEventListener("DOMContentLoaded", () => {
    const loadProduct = new LoadProduct('[data-content="thumbsSlideProduct"]', '[data-content="galeryImagesSlideProduct"]', '[data-product="title"]', '[data-product="description"]', '[data-product="price"]', '[data-content="slide-products"]', '[data-button="contact"]').init();
});