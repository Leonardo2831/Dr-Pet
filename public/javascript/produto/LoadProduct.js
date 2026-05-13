import Fetch from '../Fetch.js';
import getParamsURL from "../getParamsURL.js";
import structSlide from './components/structSlide.js';
import structThumb from './components/structThumb.js';
import slideProduto from "./slide-produto-about.js";

export default class LoadProduct{
    constructor(selectorContentThumbsSlide, selectorContentGaleryImagesSlide){
        this.contentThumbsSlide = document.querySelector(selectorContentThumbsSlide);
        this.contentGaleryImagesSlide = document.querySelector(selectorContentGaleryImagesSlide);

        this.product = null;
        this.fetchProduct = new Fetch('produtos', '[data-modal-info="product"]');
    }

    renderProduct(){
        this.contentThumbsSlide.innerHTML = '';
        this.contentGaleryImagesSlide.innerHTML = '';

        this.product.imagesSlide.forEach((image, index) => {
            this.contentThumbsSlide.appendChild(structThumb(image, index));
            this.contentGaleryImagesSlide.appendChild(structSlide(image));
        });

        slideProduto();
    }

    async getProduct(){
        const id = getParamsURL('id');
        this.product = await this.fetchProduct.get(id);
        
        this.renderProduct();
    }

    init(){
        if(this.contentThumbsSlide && this.contentGaleryImagesSlide){
            this.getProduct();
        }
        
        return this;
    }
}