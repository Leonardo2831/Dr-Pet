import LoadProduct from "./LoadProduct.js";

document.addEventListener("DOMContentLoaded", () => {
    const loadProduct = new LoadProduct('[data-content="thumbsSlideProduct"]', '[data-content="galeryImagesSlideProduct"]').init();
});