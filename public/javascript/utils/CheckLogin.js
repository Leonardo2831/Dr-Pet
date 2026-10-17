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
        // Se existir o link de logout no menu, o usuário está com sessão ativa
        if (document.querySelector('a[href="/logout"]')) {
            return true;
        }

        // Se houver atributo data-user-logged no body
        if (document.body && document.body.dataset && document.body.dataset.userLogged === 'true') {
            return true;
        }

        return false;
    }

    openModal() {
        if (!this.modal) return;
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
        if (!this.modal) return;
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
            if (element._checkLoginAttached) return;
            element._checkLoginAttached = true;
            element.addEventListener('click', this.handleClick);
        });

        // Botão de fechar do modal
        const closeButton = this.modal?.querySelector('[data-login-close]');
        if (closeButton && !closeButton._checkLoginAttached) {
            closeButton._checkLoginAttached = true;
            closeButton.addEventListener('click', this.closeModal);
        }
    }

    init() {
        if (!this.isLogged()) {
            Storage.delete('user-id');
        }

        if (this.modal && this.loginElements.length > 0) {
            this.addEventListeners();
        }

        return this;
    }
}
