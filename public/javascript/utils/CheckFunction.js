import { clickOutside } from "./clickOutside.js";

export default class CheckFunction {
    constructor() {
        this.modal      = document.querySelector('[data-confirm-modal]');
        this.card       = this.modal?.querySelector('[data-confirm-card]');
        this.messageEl  = this.modal?.querySelector('[data-confirm-message]');
        this.confirmBtn = this.modal?.querySelector('[data-confirm-btn="confirm"]');
        this.cancelBtn  = this.modal?.querySelector('[data-confirm-btn="cancel"]');
    }

    close() {
        this.card.classList.remove('scale-100', 'opacity-100');
        this.card.classList.add('scale-90', 'opacity-0');
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
        }, 200);
    }

    cleanup(handleConfirm, handleCancel) {
        this.confirmBtn.removeEventListener('click', handleConfirm);
        this.cancelBtn.removeEventListener('click', handleCancel);
    }

    /**
     * Abre o mini modal de confirmação
     * @param {Function} onConfirm - Função executada ao confirmar
     */
    open(onConfirm) {
        if (!this.modal) return;

        // Exibe o modal
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        // Animação de entrada
        requestAnimationFrame(() => {
            this.card.classList.remove('scale-90', 'opacity-0');
            this.card.classList.add('scale-100', 'opacity-100');
        });

        clickOutside(this.card, 'click', () => this.close());

        const handleConfirm = () => {
            this.close();
            this.cleanup(handleConfirm, handleCancel);
            onConfirm?.();
        };

        const handleCancel = () => {
            this.close();
            this.cleanup(handleConfirm, handleCancel);
        };

        this.confirmBtn.addEventListener('click', handleConfirm);
        this.cancelBtn.addEventListener('click', handleCancel);
    }
}