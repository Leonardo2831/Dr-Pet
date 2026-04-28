function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    if (activeButton) {
        activeButton.setAttribute('aria-expanded', 'false');
        activeButton = null;
    }
}

function openModal(button, event) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    modal.style.top  = `${event.pageY + 8}px`;
    modal.style.left = `${event.pageX - modal.offsetWidth}px`;

    activeButton = button;
    button.setAttribute('aria-expanded', 'true');
}

export default function menuOptionsPets(){
    const buttons = document.querySelectorAll('[data-button="options-pet"]');
    const modal   = document.querySelector('[data-popup="options-pet"]');

    if (!modal || buttons.length === 0) return;

    let activeButton = null;

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            if (activeButton === button) {
                closeModal();
                return;
            }

            openModal(button, event);
        });
    });

    document.addEventListener('click', (event) => {
        if (!modal.contains(event.target)) {
            closeModal();
        }
    });
}