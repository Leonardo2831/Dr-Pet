import Storage from './Storage.js';

export default class CheckLogin {
    constructor(selectorModal = '[data-modal="loginRequired"]') {
        this.selectorModal = selectorModal;
        this.modal = document.querySelector(selectorModal);

        this.handleClick = this.handleClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    isLogged() {
        // Estado de sessão renderizado pelo servidor no <body> (header.ejs)
        const loggedAttr = document.body?.dataset?.userLogged;
        if (loggedAttr === 'true') return true;
        if (loggedAttr === 'false') return false;

        // Fallback: se existir o link de logout no menu, o usuário está com sessão ativa
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
        if (!this.modal) {
            this.modal = document.querySelector(this.selectorModal || '[data-modal="loginRequired"]');
        }
        if (!this.modal) return;

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        const content = this.modal.querySelector('[data-login-content]');
        const overlay = this.modal.querySelector('[data-login-overlay]');

        requestAnimationFrame(() => {
            if (overlay) {
                overlay.classList.remove('opacity-0');
                overlay.classList.add('opacity-100');
            }
            if (content) {
                content.classList.remove('opacity-0', 'scale-95');
                content.classList.add('opacity-100', 'scale-100');
            }
        });
    }

    closeModal() {
        if (!this.modal) return;
        const content = this.modal.querySelector('[data-login-content]');
        const overlay = this.modal.querySelector('[data-login-overlay]');

        if (overlay) {
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0');
        }
        if (content) {
            content.classList.remove('opacity-100', 'scale-100');
            content.classList.add('opacity-0', 'scale-95');
        }

        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
        }, 250);
    }

    handleClick(event) {
        if (this.isLogged()) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.openModal();
    }

    addEventListeners() {
        if (CheckLogin._listenersAttached) return;
        CheckLogin._listenersAttached = true;

        // Delegação global: captura qualquer clique em [data-login] ou nos cards de serviço .service-card
        document.addEventListener('click', (event) => {
            // Ignora se o clique veio de dentro do próprio modal
            if (event.target.closest('[data-modal="loginRequired"]')) {
                return;
            }

            const trigger = event.target.closest('[data-login], .service-card');
            if (trigger) {
                this.handleClick(event);
            }
        });

        // Fechar ao clicar no botão de fechar
        document.addEventListener('click', (event) => {
            const closeBtn = event.target.closest('[data-login-close]');
            if (closeBtn) {
                event.preventDefault();
                event.stopPropagation();
                this.closeModal();
            }
        });

        // Click outside: fecha ao clicar no overlay/backdrop fora do card de conteúdo
        document.addEventListener('click', (event) => {
            if (!this.modal || this.modal.classList.contains('hidden')) {
                return;
            }

            const content = this.modal.querySelector('[data-login-content]');
            if (this.modal.contains(event.target) && content && !content.contains(event.target)) {
                event.preventDefault();
                this.closeModal();
            }
        });

        // Tecla ESC para fechar
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    init() {
        if (!this.isLogged()) {
            Storage.delete('user-id');
        }

        this.addEventListeners();
        return this;
    }
}