import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/+esm';
import Fetch from "../Fetch.js";
import structProducts from './components/structProducts.js';

export default class Products {
    constructor(selectorContentProducts, selectorButtonNew, selectorInputSearchProduct, selectorSelectTypeProduct, formProduct){
        this.contentProducts = document.querySelector(selectorContentProducts);
        this.buttonNew = document.querySelector(selectorButtonNew);
        this.inputSearchProduct = document.querySelector(selectorInputSearchProduct);
        this.selectTypeProduct = document.querySelector(selectorSelectTypeProduct);
        
        this.formProduct = formProduct;
        
        this.products = null;
        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');

        this.fuse = null;
    }

    createStructRowTable(productObject){
        const tr = structProducts(productObject);
        this.contentProducts.appendChild(tr);
    }

    filterProducts(){
        const textInput = this.inputSearchProduct.value.trim();
        const category = this.selectTypeProduct.value;

        let results = [];

        if (textInput) {
            const fuseResult = this.fuse.search(textInput);
            results = fuseResult.map(res => res.item);
        } else {
            // caso pesquisar sem texto no input mas com categoria definida
            results = [...this.products];
        }

        if (category !== 'all') {
            // filtra os produtos pela categoria
            results = results.filter((product) => product.category.toLowerCase() === category.toLowerCase());
        }

        this.contentProducts.innerHTML = '';
        results.forEach((product) => {
            this.createStructRowTable(product);
        });
    }

    createInfoEnter(){
        const p = document.createElement('p');
        p.className = 'animate-fadeItem absolute font-medium text-sm md:text-base text-gray-500 -top-7 xl:top-auto xl:-bottom-8 right-1';
        p.innerHTML = `Presione <b class="font-semibold text-gray-600">Enter</b> para Pesquisar`;

        return p;
    }

    addEvents(){
        this.inputSearchProduct.addEventListener('input', () => {
            const textInput = this.inputSearchProduct.value.trim();

            if(textInput){
                const infoEnter = this.inputSearchProduct.parentElement.querySelector('p');
                if(!infoEnter) this.inputSearchProduct.after(this.createInfoEnter());
            } else {
                const infoEnter = this.inputSearchProduct.parentElement.querySelector('p');
                if(infoEnter) infoEnter.remove();
            }
        });

        this.inputSearchProduct.addEventListener('keydown', (event) => {
            if(event.key === 'Enter'){
                event.preventDefault();
                this.filterProducts();
            }
        });

        this.selectTypeProduct.addEventListener('change', () => {
            this.filterProducts();
        });

        this.selectTypeProduct.addEventListener('keydown', (event) => {
            if(event.key === 'Enter'){
                event.preventDefault();
                this.filterProducts();
            }
        });

        if(this.formProduct){
            this.buttonNew.addEventListener('click', this.formProduct.openFormCreate);
        }
    };

    initSearch(){
        const configSearch = {
            keys: ['name', 'category'],
            threshold: 0.5
        };

        this.fuse = new Fuse(this.products, configSearch);

        this.addEvents();
    }

    initTable(){
        this.products.forEach((productObject) => {
            this.createStructRowTable(productObject);
        });
    }

    getProducts(){
        this.fetchJson.get().then((products) => {
            if(Array.isArray(products)){
                this.products = products;
                this.initTable();
                this.initSearch();
            }
        });
    }

    init(){
        if(this.contentProducts && this.buttonNew && this.inputSearchProduct && this.selectTypeProduct){
            this.getProducts();
        }

        return this;
    }
}