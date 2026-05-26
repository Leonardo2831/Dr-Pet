import Storage from './Storage.js';
import { clickOutside } from './clickOutside.js';

export default class CheckLogin {
    constructor(selectorModal) {
        this.modal = document.querySelector(selectorModal);
        this.loginElements = document.querySelectorAll('[data-login]');

        this.handleClick = this.handleClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    isLogged() {
        return !!Storage.get('user-id');
    }

    openModal() {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        requestAnimationFrame(() => {
            this.modal.querySelector('[data-login-content]')
                ?.classList.add('animate-fadeItem');
            this.modal.querySelector('[data-login-overlay]')
                ?.classList.add('animate-fadeItem');
        });

        const content = this.modal.querySelector('[data-login-content]');
        if (content) {
            clickOutside(content, 'click', this.closeModal);
        }
    }

    closeModal() {
        const content = this.modal.querySelector('[data-login-content]');
        const overlay = this.modal.querySelector('[data-login-overlay]');

        content?.classList.remove('animate-fadeItem');
        overlay?.classList.remove('animate-fadeItem');

        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
        }, 150);
    }

    handleClick(event) {
        if (this.isLogged()) return;

        event.preventDefault();
        event.stopPropagation();
        this.openModal();
    }

    addEventListeners() {
        this.loginElements.forEach(element => {
            element.addEventListener('click', this.handleClick);
        });

        // Botão de fechar do modal
        const closeButton = this.modal?.querySelector('[data-login-close]');
        if (closeButton) {
            closeButton.addEventListener('click', this.closeModal);
        }
    }

    init() {
        if (this.modal && this.loginElements.length > 0) {
            this.addEventListeners();
        }

        return this;
    }
}
