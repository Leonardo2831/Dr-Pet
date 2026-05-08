import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/+esm';
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
        this.fuse = null;
        this.swiper = null;

        this.filterProducts = this.filterProducts.bind(this);
    }

    filterProducts(){
        const activeOption = this.modalTypeFilter.querySelector('.activeOption');
        const category = activeOption?.dataset.filter || 'all';
        const searchText = this.inputFilter.value.trim();

        let filtered = [];

        if (searchText) {
            const fuseResult = this.fuse.search(searchText);
            filtered = fuseResult.map(res => res.item);
        } else {
            filtered = [...this.products];
        }

        if (category !== 'all') {
            filtered = filtered.filter((product) => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }

        this.initProductsShop(filtered);
    }

    createInfoEnter() {
        const p = document.createElement('p');
        p.className = 'animate-fadeItem absolute font-medium text-sm md:text-base text-gray-500 -top-7 xl:top-auto xl:-bottom-8 right-1';
        p.innerHTML = `Presione <b class="font-semibold text-gray-600">Enter</b> para Pesquisar`;

        return p;
    }

    addEvents(){
        this.inputFilter.addEventListener('input', () => {
            const textInput = this.inputFilter.value.trim();

            if (textInput) {
                const infoEnter = this.inputFilter.parentElement.querySelector('p');
                if (!infoEnter) this.inputFilter.after(this.createInfoEnter());
            } else {
                const infoEnter = this.inputFilter.parentElement.querySelector('p');
                if (infoEnter) infoEnter.remove();
            }
        });

        this.inputFilter.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.filterProducts();
            }
        });

        Array.from(this.modalTypeFilter.children).forEach((type) => {
            type.addEventListener('click', (event) => {
                Array.from(this.modalTypeFilter.children).forEach((type) => {
                    type.classList.remove('activeOption');
                });
                event.target.classList.add('activeOption');
                this.filterProducts();
            });
        });
    }

    // O igual define um valor padrão para o argumento caso não for definido
    initProductsShop(products = this.products){
        this.contentProductsSlides.innerHTML = "";

        if (products.length === 0) {
            const p = document.createElement('p');
            p.className = 'animate-fadeItem text-center font-medium text-lg md:text-2xl text-gray-500 py-10';
            p.textContent = 'Nenhum produto encontrado';
            this.contentProductsSlides.appendChild(p);
            return;
        }

        products.forEach((product, index) => {
            if(index === 0 || (index + 1) % 10 === 0){
                const div = document.createElement('div');
                div.className = "swiper-wrapper animate-fadeItem";
                this.contentProductsSlides.appendChild(div);
            }
            this.contentProductsSlides?.children[this.contentProductsSlides.children.length - 1]?.appendChild(structProduct(product));
        });

        this.swiper = slidesLojaConfig(this.swiper);
    }

    initSearch() {
        const configSearch = {
            keys: ['name', 'category'],
            threshold: 0.5
        };

        this.fuse = new Fuse(this.products, configSearch);
    }

    getProducts(){
        this.fetchJson.get().then((products) => {
            if(Array.isArray(products)) {
                this.products = products;
                this.initProductsShop();
                this.initSearch();
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