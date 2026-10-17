import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/+esm';
import structProduct from "./components/structProductLoja.js";
import slidesLojaConfig from "./slidesLojaConfig.js";

export default class ProductsLoja {
    constructor(selectorContentProductsSlides, selectorInputFilter, selectorModalTypeFilter) {
        this.contentProductsSlides = document.querySelector(selectorContentProductsSlides);
        this.inputFilter = document.querySelector(selectorInputFilter);
        this.modalTypeFilter = document.querySelector(selectorModalTypeFilter);

        this.products = null;
        this.fuse = null;
        this.swiper = null;

        this.filterProducts = this.filterProducts.bind(this);
    }

    loadProductsFromDOM() {
        const slides = this.contentProductsSlides?.querySelectorAll('.swiper-slide') || [];
        if (slides.length > 0) {
            this.products = Array.from(slides).map(slide => {
                const id = slide.getAttribute('data-id') || slide.dataset.id;
                const category = slide.getAttribute('data-category') || slide.dataset.category || '';
                const titleEl = slide.querySelector('h3');
                const descEl = slide.querySelector('p');
                const priceEl = slide.querySelector('span');
                const imgEl = slide.querySelector('img');

                return {
                    id,
                    name: titleEl?.textContent?.trim() || '',
                    category: category,
                    shortDescription: descEl?.textContent?.trim() || '',
                    price: priceEl?.textContent?.replace(/[^0-9,.]/g, '') || '',
                    imageMain: {
                        image: imgEl?.src || '',
                        alt: imgEl?.alt || ''
                    }
                };
            });
            this.initSearch();
        }
    }

    filterProducts(){
        if (!this.products) return;

        const activeOption = this.modalTypeFilter.querySelector('.activeOption');
        const category = activeOption?.dataset.filter || 'all';
        const searchText = this.inputFilter.value.trim();

        let filtered = [];

        if (searchText && this.fuse) {
            const fuseResult = this.fuse.search(searchText);
            filtered = fuseResult.map(res => res.item);
        } else {
            filtered = [...this.products];
        }

        if (category !== 'all') {
            filtered = filtered.filter((product) => 
                product.category && product.category.toLowerCase() === category.toLowerCase()
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
        if (!products) return;
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
        if (!this.products) return;

        const configSearch = {
            keys: ['name', 'category', 'shortDescription'],
            threshold: 0.5
        };

        this.fuse = new Fuse(this.products, configSearch);
    }

    init(){
        if(this.contentProductsSlides && this.inputFilter && this.modalTypeFilter){
            this.loadProductsFromDOM();
            this.swiper = slidesLojaConfig(this.swiper);
            this.addEvents();
        }

        return this;
    }
}