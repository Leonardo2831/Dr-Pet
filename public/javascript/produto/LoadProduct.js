import showdown from 'https://esm.sh/showdown';

import Fetch from '../Fetch.js';
import getParamsURL from "../getParamsURL.js";
import structSlide from './components/structSlide.js';
import structThumb from './components/structThumb.js';
import slideProduto from "./slide-produto-about.js";

export default class LoadProduct{
    constructor(selectorContentThumbsSlide, selectorContentGaleryImagesSlide,
        selectorTitle, selectorDescription, selectorPrice
    ){
        this.contentThumbsSlide = document.querySelector(selectorContentThumbsSlide);
        this.contentGaleryImagesSlide = document.querySelector(selectorContentGaleryImagesSlide);
        this.title = document.querySelector(selectorTitle);
        this.description = document.querySelector(selectorDescription);
        this.price = document.querySelector(selectorPrice);

        this.converterMarkdown = new showdown.Converter();
        this.product = null;
        this.fetchProduct = new Fetch('produtos', '[data-modal-info="product"]');
    }

    renderInfoProduct(){
        if(this.title && this.description && this.price){
            this.title.textContent = this.product.name;
            const longDescription = this.product.longDescription || '';
            const isHtml = /<[^>]+>/.test(longDescription);
            this.description.innerHTML = isHtml
                ? longDescription
                : this.converterMarkdown.makeHtml(longDescription);
            const uls = this.description.querySelectorAll('ul');
            if(uls.length) {
                uls.forEach(ul => {
                    ul.className = "flex flex-col gap-3 md:gap-[15px] py-6 md:py-[30px] border-y border-green-300 *:text-gray-800 *:font-normal *:text-base *:md:text-[22px] *:md:leading-[27px]";
                });
            }
            const strongs = this.description.querySelectorAll('strong');
            if(strongs.length) {
                strongs.forEach(strong => {
                    strong.className = "font-medium text-gray-800";
                });
            }

            this.price.textContent = 'R$ ' + parseFloat(this.product.price).toFixed(2).replace('.', ',');
        }
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
        this.product = await  this.fetchProduct.get(id);
        
        this.renderProduct();
        this.renderInfoProduct();
    }

    init(){
        if(this.contentThumbsSlide && this.contentGaleryImagesSlide){
            this.getProduct();
        }
        
        return this;
    }
}