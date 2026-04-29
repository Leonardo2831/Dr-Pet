export default class MenuOptions {
    constructor(selectorButtons, selectorModal) {
        this.buttons = document.querySelectorAll(selectorButtons);
        this.modal = document.querySelector(selectorModal);
        this.activeButton = null;

        if (!this.modal || this.buttons.length === 0) return;

        this.bindEvents();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');

        if (this.activeButton) {
            this.activeButton.setAttribute('aria-expanded', 'false');
            this.activeButton = null;
        }
    }

    openModal(button, event) {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        this.modal.style.top  = `${event.pageY + 8}px`;
        this.modal.style.left = `${event.pageX - this.modal.offsetWidth}px`;

        this.activeButton = button;
        button.setAttribute('aria-expanded', 'true');
    }

    bindEvents() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();

                if (this.activeButton === button) {
                    this.closeModal();
                    return;
                }

                this.openModal(button, event);
            });
        });

        document.addEventListener('click', (event) => {
            if (!this.modal.contains(event.target)) {
                this.closeModal();
            }
        });
    }
}