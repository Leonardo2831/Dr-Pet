export default function toggleShowPassword(){
    const buttons = document.querySelectorAll('[data-toggle-password]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const inputId = button.getAttribute('data-toggle-password');
            const senhaInput = document.getElementById(inputId);

            if (senhaInput.type === 'password') {
                senhaInput.type = 'text';
            } else {
                senhaInput.type = 'password';
            }
        });
    });
}