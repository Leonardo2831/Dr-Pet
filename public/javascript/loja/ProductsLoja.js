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
                                const imgEl = slide.querySelector('img');

                return {
                    id,
                    name: titleEl?.textContent?.trim() || '',
                    category: category,
                    shortDescription: descEl?.textContent?.trim() || '',
                    price: Number(slide.dataset.price) || 0,
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
            const fuseResult = this.fuse.search(this.normalize(searchText));
            filtered = fuseResult.map(res => res.item);
        } else {
            filtered = [...this.products];
        }

        if (category !== 'all') {
            filtered = filtered.filter((product) => 
                product.category && this.normalize(product.category) === this.normalize(category)
            );
        }

        this.initProductsShop(filtered);
    }

    normalize(text) {
        return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
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
        if (this.swiper) {
            this.swiper.destroy(true, true);
            this.swiper = null;
        }
        this.contentProductsSlides.innerHTML = "";

        if (products.length === 0) {
            const p = document.createElement('p');
            p.className = 'animate-fadeItem text-center font-medium text-lg md:text-2xl text-gray-500 py-10';
            p.textContent = 'Nenhum produto encontrado';
            this.contentProductsSlides.appendChild(p);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper animate-fadeItem';
        products.forEach((product) => wrapper.appendChild(structProduct(product)));
        this.contentProductsSlides.appendChild(wrapper);

        this.swiper = slidesLojaConfig(this.swiper);
    }

    initSearch() {
        if (!this.products) return;

        const configSearch = {
            keys: ['searchName', 'searchCategory', 'searchDescription'],
            threshold: 0.2
        };

        // campos sem acento/maiúsculas, só para a busca (a exibição usa os originais)
        this.products.forEach((p) => {
            p.searchName = this.normalize(p.name);
            p.searchCategory = this.normalize(p.category);
            p.searchDescription = this.normalize(p.shortDescription);
        });

        this.fuse = new Fuse(this.products, configSearch);
    }

    init(){
        if(this.contentProductsSlides && this.inputFilter && this.modalTypeFilter){
            this.loadProductsFromDOM();
            if (this.contentProductsSlides.querySelector('.swiper-wrapper')) {
                this.swiper = slidesLojaConfig(this.swiper);
            }
            this.addEvents();
        }

        return this;
    }
}