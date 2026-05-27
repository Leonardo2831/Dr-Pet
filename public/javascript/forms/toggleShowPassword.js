export default function toggleShowPassword() {
    const buttons = document.querySelectorAll('[data-toggle-password]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const inputId = button.getAttribute('data-toggle-password');
            const senhaInput = document.getElementById(inputId);

            const img = button.querySelector('img');

            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
                if (img) {
                    img.src = '../images/icons/forms/visibility_on.svg';
                    img.alt = 'Ocultar senha';
                }
            } else {
                senhaInput.type = 'password';
                if (img) {
                    img.src = '../images/icons/forms/visibility_off.svg';
                    img.alt = 'Mostrar senha';
                }
            }
        });
    });
}