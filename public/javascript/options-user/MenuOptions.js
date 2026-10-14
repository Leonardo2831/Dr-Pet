export default class MenuOptions {
    constructor(selectorButtons, selectorModal) {
        this.selectorButtons = selectorButtons;
        this.modal = document.querySelector(selectorModal);
        this.activeButton = null;

        if (!this.modal) return;

        this.bindEvents();
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');

        if (this.activeButton) {
            this.activeButton.setAttribute('aria-expanded', 'false');
            this.activeButton = null;
        }
    }

    openModal(button) {
        if (!this.modal) return;

        const card = button.closest('[data-id]');
        if (card && card.dataset.id) {
            this.modal.dataset.currentId = card.dataset.id;
        }

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        const rect = button.getBoundingClientRect();
        const popupWidth = this.modal.offsetWidth || 180;

        const top = rect.bottom + 6;
        let left = rect.right - popupWidth;

        if (left < 10) left = 10;

        this.modal.style.position = 'fixed';
        this.modal.style.top  = `${top}px`;
        this.modal.style.left = `${left}px`;

        this.activeButton = button;
        button.setAttribute('aria-expanded', 'true');
    }

    bindEvents() {
        document.addEventListener('click', (event) => {
            const button = event.target.closest(this.selectorButtons);
            if (button) {
                event.stopPropagation();
                if (this.activeButton === button) {
                    this.closeModal();
                    return;
                }
                this.openModal(button);
                return;
            }

            if (this.modal && !this.modal.contains(event.target)) {
                this.closeModal();
            }
        });

        window.addEventListener('resize', () => {
            if (this.activeButton) {
                this.closeModal();
            }
        });

        window.addEventListener('scroll', () => {
            if (this.activeButton) {
                this.closeModal();
            }
        }, { passive: true });
    }
}