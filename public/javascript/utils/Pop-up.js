import { clickOutside } from './clickOutside.js';

export default class PopUp {
    constructor(selectorButton, selectorModal, selectorClose){
        this.button = document.querySelector(selectorButton);
        this.modal = document.querySelector(selectorModal);
        if (selectorClose) {
            this.closeButton = document.querySelector(selectorClose);
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal(){
        if (!this.modal) return;
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
        if (this.modal._cleanupClickOutside) {
            this.modal._cleanupClickOutside();
        }
    }

    openModal(event){
        event.preventDefault();
        
        if (!this.modal) return;
        this.modal.classList.add('flex');
        this.modal.classList.remove('hidden');
        clickOutside(this.modal, 'click', this.closeModal);
    }

    addEventButton(){
        if (this.button) {
            this.button.addEventListener('click', this.openModal);
        }
        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.closeModal);
        }
        if (this.modal) {
            this.modal.addEventListener('click', (event) => {
                if (event.target === this.modal) {
                    this.closeModal();
                }
            });
        }
    }

    init(){
        if(this.button && this.modal){
            this.addEventButton();
        }

        return this;
    }
}