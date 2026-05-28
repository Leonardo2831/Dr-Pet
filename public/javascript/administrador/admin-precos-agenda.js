import Fetch from '../utils/Fetch.js';
import formatPrice from '../utils/formatPrice.js';

function formatTime(input) {
    const digits = input.value.replace(/\D/g, '');
    if (!digits) {
        input.value = '';
        return;
    }
    input.value = digits + ' min';

    // defini onde cursor vai estar
    const cursorPosition = digits.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
}

export default function adminPrecosAgenda() {
    const form = document.getElementById('form-cadastrar-precos');
    const selectService = document.getElementById('servico-select');
    const inputTime = document.getElementById('tempo-input');
    const inputPrice = document.getElementById('preco-input');
    inputPrice.addEventListener('input', () => formatPrice(inputPrice));
    inputTime.addEventListener('input', () => formatTime(inputTime));

    form.addEventListener('submit', async (event) => {
        const servicoSelecionado = selectService.value;
        const novoTempo = Number(inputTime.value.replace(' min', ''));
        const novoPreco = Number(inputPrice.value.replace('R$', '').replace(',', '.').trim());

        const fetchPrecos = new Fetch('service-infos', '[data-modal-info-menu="user"]');

        event.preventDefault();
        let precosAtuais = await fetchPrecos.get();
        const existePrecosAtuais = !!precosAtuais && Object.keys(precosAtuais).length > 0;

        if (!precosAtuais) {
            precosAtuais = {};
        }

        const id = (precosAtuais[servicoSelecionado] && precosAtuais[servicoSelecionado].id) || crypto.randomUUID();

        precosAtuais[servicoSelecionado] = {
            id: id,
            time: novoTempo,
            price: novoPreco
        };

        if (existePrecosAtuais) {
            await fetchPrecos.put('', precosAtuais);
        } else {
            await fetchPrecos.post(precosAtuais);
        }

        inputTime.value = '';
        inputPrice.value = '';
    });
}