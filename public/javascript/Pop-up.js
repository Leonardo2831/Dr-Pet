import { clickOutside } from './clickOutside.js';

export default class PopUp {
    constructor(selectorButton, selectorModal){
        this.button = document.querySelector(selectorButton);
        this.modal = document.querySelector(selectorModal);

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal(){
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
    }

    openModal(){
        this.modal.classList.add('flex');
        this.modal.classList.remove('hidden');
        clickOutside(this.modal, 'click', this.closeModal);
    }

    addEventButton(){
        this.button.addEventListener('click', this.openModal);
    }

    init(){
        if(this.button && this.modal){
            this.addEventButton();
        }

        return this;
    }
}