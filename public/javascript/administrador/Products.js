import Fetch from "../Fetch.js";
import structProducts from './components/structProducts.js';

export default class Products{
    constructor(selectorContentProducts, selectorButtonNew, selectorInputSearchProduct, selectorSelectTypeProduct){
        this.contentProducts = document.querySelector(selectorContentProducts);
        this.buttonNew = document.querySelector(selectorButtonNew);
        this.inputSearchProduct = document.querySelector(selectorInputSearchProduct);
        this.selectTypeProduct = document.querySelector(selectorSelectTypeProduct);

        this.products = null;
        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');
    }

    createStructRowTable(productObject){
        const tr = structProducts(productObject);
        this.contentProducts.appendChild(tr);
    }

    filterProducts(){
        this.contentSchedule.innerHTML = "";
        
        if(this.inputDate.value && this.selectService.value){
            this.schedules.forEach((scheduleObject) => {
                const matchDate = scheduleObject.date == this.inputDate.value;
                const matchService = this.selectService.value === 'all' || scheduleObject.service.name.toLowerCase() == this.selectService.value.toLowerCase();
                
                if(matchDate && matchService){
                    this.createStructSchedule(scheduleObject);
                }
            });
        } else {
            this.scheduleInit();
        }

        if(!this.contentSchedule.children.length){
            const alert = document.createElement('p');
            alert.className = 'animate-fadeItem text-lg font-semibold text-gray-700 text-center';
            alert.textContent = "Não há nenhum horário para esse dia e este serviço";
            this.contentSchedule.appendChild(alert);
        }
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