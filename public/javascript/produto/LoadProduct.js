import Fetch from '../utils/Fetch.js';
import getParamsURL from "../utils/getParamsURL.js";
import structProduct from './components/structProduct.js';
import structSlide from './components/structSlide.js';
import structThumb from './components/structThumb.js';
import slideProduto from "./slide-produto-about.js";

export default class LoadProduct{
    constructor(selectorContentThumbsSlide, selectorContentGaleryImagesSlide,
        selectorTitle, selectorDescription, selectorPrice, selectorContentSlideProducts, selectorButtonContact
    ){
        this.contentThumbsSlide = document.querySelector(selectorContentThumbsSlide);
        this.contentGaleryImagesSlide = document.querySelector(selectorContentGaleryImagesSlide);
        this.title = document.querySelector(selectorTitle);
        this.description = document.querySelector(selectorDescription);
        this.price = document.querySelector(selectorPrice);
        this.contentSlideProducts = document.querySelector(selectorContentSlideProducts);
        this.buttonContact = document.querySelector(selectorButtonContact);

        this.product = null;
        this.allProducts = null;
        this.fetchProduct = new Fetch('produtos', '[data-modal-info="product"]');
        
        this.toContact = this.toContact.bind(this);
    }

    toContact(){
        const phone = "5519993592253"; 
        const text = encodeURIComponent(`Olá, gostaria de saber mais sobre o ${this.product.name}`);
        const url = `https://wa.me/${phone}?text=${text}`;
    
        window.open(url, '_blank');
    }

    addEventButton(){
        this.buttonContact.addEventListener('click', this.toContact);
    }

    renderSlide(){
        this.allProducts.forEach(product => {
            this.contentSlideProducts.appendChild(structProduct(product));
        });
    }

    renderInfoProduct(){
        if(this.title && this.description && this.price){
            this.title.textContent = this.product.name;
            this.description.innerHTML = this.product.longDescription || '';
            // Estilos para headers
            const h1s = this.description.querySelectorAll('h1');
            h1s.forEach(h1 => {
                h1.className = "text-2xl md:text-3xl font-bold text-gray-800 mb-3 mt-4";
            });
            const h2s = this.description.querySelectorAll('h2');
            h2s.forEach(h2 => {
                h2.className = "text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-4";
            });
            const h3s = this.description.querySelectorAll('h3');
            h3s.forEach(h3 => {
                h3.className = "text-lg md:text-xl font-medium text-gray-800 mb-3 mt-4";
            });
            // Estilos para listas
            const uls = this.description.querySelectorAll('ul');
            uls.forEach(ul => {
                ul.className = "list-disc list-inside flex flex-col gap-3 md:gap-[15px] py-5 md:py-6 border-y border-green-300 *:text-gray-800 *:font-normal *:text-base *:md:text-lg *:ml-5";
            });
            const ols = this.description.querySelectorAll('ol');
            ols.forEach(ol => {
                ol.className = "list-decimal list-inside flex flex-col gap-3 md:gap-[15px] py-5 md:py-6 border-y border-green-300 *:text-gray-800 *:font-normal *:text-base *:md:text-lg *:ml-5";
            });
            // Estilos para strong (bold)
            const strongs = this.description.querySelectorAll('strong');
            strongs.forEach(strong => {
                strong.className = "font-bold text-gray-800";
            });
            // Estilos para em (italic)
            const ems = this.description.querySelectorAll('em');
            ems.forEach(em => {
                em.className = "italic text-gray-800";
            });
            // Estilos para u (underline)
            const us = this.description.querySelectorAll('u');
            us.forEach(u => {
                u.className = "underline text-gray-800";
            });
            // Estilos para s/strike (strikethrough)
            const strikes = this.description.querySelectorAll('s, strike');
            strikes.forEach(strike => {
                strike.className = "line-through text-gray-600";
            });
            // Estilos para links
            const links = this.description.querySelectorAll('a');
            links.forEach(a => {
                a.className = "text-green-600 hover:text-green-800 underline";
            });

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

    async getAllProducts(){
        this.allProducts = await this.fetchProduct.get();
        this.renderSlide();
    }

    async getProduct(){
        const id = getParamsURL('id');
        this.product = await  this.fetchProduct.get(id);
        
        this.renderProduct();
        this.renderInfoProduct();
        this.getAllProducts();
        this.addEventButton();
    }

    init(){
        if(this.contentThumbsSlide && this.contentGaleryImagesSlide){
            this.getProduct();
        }
        
        return this;
    }
}