import formatPrice from '../utils/formatPrice.js';

function formatTime(input) {
    if (!input) return;
    const digits = input.value.replace(/\D/g, '');
    if (!digits) {
        input.value = '';
        return;
    }
    input.value = digits + ' min';

    // define onde cursor vai estar antes de " min"
    const cursorPosition = digits.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
}

export default function adminPrecosAgenda() {
    // Inputs da Atualização de Serviço
    const inputPriceAtualizar = document.getElementById('preco-input');
    const inputTimeAtualizar = document.getElementById('tempo-input');

    // Inputs do Cadastro de Novo Serviço
    const inputPriceNovo = document.getElementById('novo-servico-preco');
    const inputTimeNovo = document.getElementById('novo-servico-duracao');

    if (inputPriceAtualizar) {
        inputPriceAtualizar.addEventListener('input', () => formatPrice(inputPriceAtualizar));
    }
    if (inputTimeAtualizar) {
        inputTimeAtualizar.addEventListener('input', () => formatTime(inputTimeAtualizar));
    }

    if (inputPriceNovo) {
        inputPriceNovo.addEventListener('input', () => formatPrice(inputPriceNovo));
    }
    if (inputTimeNovo) {
        inputTimeNovo.addEventListener('input', () => formatTime(inputTimeNovo));
    }
}