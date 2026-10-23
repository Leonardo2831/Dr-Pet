import Storage from "../../utils/Storage.js";

export default async function schedule(form) {
    if (!form) return;
    const infosSchedule = Storage.get('scheduleData');
    const modalInfo = document.querySelector('[data-modal-info="formSchedule"]');

    function showFeedback(message, isError = false) {
        if (!modalInfo) return;
        modalInfo.textContent = message;
        modalInfo.className = `z-[1000] animate-fadeItem fixed bottom-8 left-1/2 -translate-x-1/2 p-4 text-center font-semibold text-lg rounded-[10px] shadow-lg ${
            isError ? 'bg-red-500 text-white' : 'bg-green-600 text-white'
        }`;
        modalInfo.classList.remove('hidden', 'opacity-0');

        setTimeout(() => {
            modalInfo.classList.add('opacity-0');
            setTimeout(() => modalInfo.classList.add('hidden'), 300);
        }, 2500);
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (!infosSchedule || !infosSchedule.date || !infosSchedule.hour) {
            showFeedback('Dados do agendamento incompletos. Volte e selecione um serviço, data e horário.', true);
            console.error('scheduleData ausente ou incompleto:', infosSchedule);
            return;
        }

        const formDataObject = new FormData(form);
        const novoAgendamento = {
            fk_service: infosSchedule.service,
            date: infosSchedule.date,
            hour: infosSchedule.hour,
            petNome: formDataObject.get('nomePet'),
            fk_pet: formDataObject.get('petId') || null,
            observation: formDataObject.get('descricao') || '',
            endereco: formDataObject.get('endereco') || '',
            buscarResidencia: formDataObject.get('buscarResidencia') === 'on'
        };

        try {
            const resposta = await fetch('/agenda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoAgendamento)
            });

            const data = await resposta.json().catch(() => ({}));

            if (resposta.ok) {
                showFeedback('Agendamento realizado com sucesso!', false);
                Storage.delete('scheduleData');
                setTimeout(() => {
                    window.location.href = '/agenda';
                }, 1200);
            } else {
                showFeedback(data.erro || 'Houve um erro ao realizar o agendamento.', true);
                console.error('Erro ao salvar agendamento:', data);
            }
        } catch (erro) {
            showFeedback('Erro de conexão ao salvar agendamento.', true);
            console.error('Erro na requisição:', erro);
        }
    });
}