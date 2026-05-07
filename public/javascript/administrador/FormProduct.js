import { clickOutside } from "../clickOutside.js";

export default class FormProduct {
    constructor(selectorModal, selectorForm, selectorButtonClose, 
        selectorInputName, selectorSelectCategory, selectorInputPrice, selectorAreaShortDescription, selectorAreaLongDescription,
        selectorInputMainImage, selectorInputSlideImages, selectorInfoMainImage, selectorInfoSlideImages){
        this.modalProduct = document.querySelector(selectorModal);
        this.formProduct = document.querySelector(selectorForm);
        this.buttonCloseForm = document.querySelector(selectorButtonClose);

        this.inputName = document.querySelector(selectorInputName);
        this.selectCategory = document.querySelector(selectorSelectCategory);
        this.inputPrice = document.querySelector(selectorInputPrice);
        this.areaShortDescription = document.querySelector(selectorAreaShortDescription);
        this.areaLongDescription = document.querySelector(selectorAreaLongDescription);

        this.inputMainImage = document.querySelector(selectorInputMainImage);
        this.inputSlideImages = document.querySelector(selectorInputSlideImages);
        this.infoMainImage = document.querySelector(selectorInfoMainImage);
        this.infoSlidesImages = document.querySelector(selectorInfoSlideImages);
        
        this.openFormCreate = this.openFormCreate.bind(this);
        this.closeFormCreate = this.closeFormCreate.bind(this);
        this.showNameFileMain = this.showNameFileMain.bind(this);
        this.showCountFilesSlide = this.showCountFilesSlide.bind(this);
        this.formatInputPrice = this.formatInputPrice.bind(this);
    }

    formatInputPrice(){
        const valueInput = this.inputPrice.value.replace(/\D/g, '');;
        this.inputPrice.value = "R$ " + (Number(valueInput) / 100).toFixed(2);
    }

    showCountFilesSlide(){
        const count = this.inputSlideImages.files.length;
        if(count > 0){
            this.infoSlidesImages.textContent = `✔ ${count} imagem(ns) selecionada(s)`;
            this.infoSlidesImages.classList.remove('hidden');
        } else {
            this.infoSlidesImages.textContent = '';
            this.infoSlidesImages.classList.add('hidden');
        }
    }

    showNameFileMain(){
        if(this.inputMainImage.files.length > 0){
            this.infoMainImage.textContent = `✔ ${this.inputMainImage.files[0].name}`;
            this.infoMainImage.classList.remove('hidden');
        } else {
            this.infoMainImage.textContent = '';
            this.infoMainImage.classList.add('hidden');
        }
    }

    closeFormCreate(){
        if(!this.modalProduct) return;
        this.modalProduct.classList.add('hidden');
        this.modalProduct.classList.remove('flex');

        if(this.formProduct) {
            this.formProduct.reset();
        }
        if(this.infoMainImage) {
            this.infoMainImage.textContent = ''; 
            this.infoMainImage.classList.add('hidden'); 
        }
        if(this.infoSlidesImages) {
            this.infoSlidesImages.textContent = ''; 
            this.infoSlidesImages.classList.add('hidden'); 
        }
    }

    openFormCreate(){
        if(!this.modalProduct) return;
        this.modalProduct.classList.remove('hidden');
        this.modalProduct.classList.add('flex');
        
        if(this.formProduct) clickOutside(this.formProduct, 'click', this.closeFormCreate);
    }

    addEvents(){
        if(this.buttonCloseForm) this.buttonCloseForm.addEventListener('click', this.closeFormCreate);
        if(this.inputMainImage && this.infoMainImage) this.inputMainImage.addEventListener('change', this.showNameFileMain);
        if(this.inputSlideImages && this.infoSlidesImages) this.inputSlideImages.addEventListener('change', this.showCountFilesSlide);
        if(this.inputPrice) this.inputPrice.addEventListener('input', this.formatInputPrice);
    }

    init(){
        if(this.modalProduct && this.formProduct){
            this.addEvents();
        }

        return this;
    }
}