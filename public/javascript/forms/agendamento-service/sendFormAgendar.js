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

        if (!scheduleData.service || !scheduleData.date || !scheduleData.hour) {
            alert('Dados do agendamento incompletos no seu navegador. Por favor, volte para a página de serviços e selecione data, hora e serviço novamente.');
            return;
        }

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

        try {
            buttonSubmit.disabled = true;
            buttonSubmit.classList.add('opacity-70', 'cursor-wait');

            const response = await fetchService.post(data);

            // Limpa dados temporários salvos no navegador
            Storage.delete('scheduleData');

            let redirectUrl = '/';
            try {
                const resJson = await response.clone().json();
                if (resJson && resJson.redirect) {
                    redirectUrl = resJson.redirect;
                }
            } catch (_) {}

            // Aguarda o feedback visual de sucesso e redireciona para a home ('/')
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);

            return response;
        } catch (error) {
            buttonSubmit.disabled = false;
            buttonSubmit.classList.remove('opacity-70', 'cursor-wait');
            console.error('Erro ao enviar formulário de agendamento:', error);
        }
    });
}
