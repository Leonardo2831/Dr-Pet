import Storage from "../../utils/Storage.js";
import Fetch from "../../utils/Fetch.js";

export default function sendFormAgendar(form) {
    const formElement = form || document.querySelector('form');
    if (!formElement) return;

    const buttonSubmit = formElement.querySelector('button[type="submit"]');
    if (!buttonSubmit) return;

    buttonSubmit.addEventListener('click', async (event) => {
        event.preventDefault();

        if (formElement.checkValidity && !formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        const scheduleData = Storage.get('scheduleData') || {};

        const data = {
            nome: formElement.querySelector('#nome')?.value || '',
            telefone: formElement.querySelector('#telefone')?.value || '',
            endereco: formElement.querySelector('#endereco')?.value || '',
            nomePet: formElement.querySelector('#nomePet')?.value || '',
            descricao: formElement.querySelector('#descricao')?.value || '',
            buscarResidencia: formElement.querySelector('#buscarResidencia')?.checked || false,
            ...scheduleData
        };

        const action = formElement.getAttribute('action') || 'form-agendar/send';
        const endpoint = action.replace(/^\/+/, '');
        const fetchService = new Fetch(endpoint, '[data-modal-info="formSchedule"]');

        if (fetchService.modalInfo) {
            fetchService.modalInfo.classList.remove('hidden', 'opacity-0');
            setTimeout(() => {
                fetchService.modalInfo?.classList.add('hidden', 'opacity-0');
            }, 2000);
        }

        try {
            const response = await fetchService.post(data);
            return response;
        } catch (error) {
            console.error('Erro ao enviar formulário de agendamento:', error);
        }
    });
}
