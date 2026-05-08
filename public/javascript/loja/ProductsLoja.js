import Fetch from "../Fetch.js";
import structProduct from "./components/structProductLoja.js";
import slidesLojaConfig from "./slidesLojaConfig.js";

export default class ProductsLoja {
    constructor(selectorContentProductsSlides, selectorInputFilter, selectorModalTypeFilter) {
        this.contentProductsSlides = document.querySelector(selectorContentProductsSlides);
        this.inputFilter = document.querySelector(selectorInputFilter);
        this.modalTypeFilter = document.querySelector(selectorModalTypeFilter);

        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');
        this.products = null;
    }

    addEvents(){

    }

    initProductsShop(){
        this.contentProductsSlides.innerHTML = "";

        this.products.forEach((product, index) => {
            if(index === 0 || (index + 1) % 10 === 0){
                const div = document.createElement('div');
                div.className = "swiper-wrapper animate-fadeItem";
                this.contentProductsSlides.appendChild(div);
            }
            this.contentProductsSlides?.children[this.contentProductsSlides.children.length - 1]?.appendChild(structProduct(product));
        });

        slidesLojaConfig();
    }

    getProducts(){
        this.fetchJson.get().then((products) => {
            if(Array.isArray(products)) {
                this.products = products;
                this.initProductsShop();
            }
        });
    }

    init(){
        if(this.contentProductsSlides && this.inputFilter && this.modalTypeFilter){
            this.getProducts();
            this.addEvents();
        }

        return this;
    }
}