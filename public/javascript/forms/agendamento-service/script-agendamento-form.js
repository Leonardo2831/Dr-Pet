import checkInputRadioParams from "./checkInputRadioParams.js";
import Storage from "../../Storage.js";
import Fetch from "../../Fetch.js";

document.addEventListener('DOMContentLoaded', () => {
    checkInputRadioParams();
    const form = document.querySelector('form');
    const fetchSchedule = new Fetch('agenda', '[data-modal-info="formSchedule"]');
    const infosSchedule = Storage.get('scheduleData');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (!infosSchedule || !infosSchedule.date || !infosSchedule.hour) {
            console.error('scheduleData ausente ou incompleto:', infosSchedule);
            return;
        }

        const formDataObject = new FormData(form);
        const novoAgendamento = {
            user: {
                username: formDataObject.get('nome'),
                phone: formDataObject.get('telefone')
            },
            petAgendado: {
                name: formDataObject.get('nomePet')
            },
            service: {
                name: infosSchedule.service,
                observations: formDataObject.get('descricao')
            },
            date: infosSchedule.date,
            hour: infosSchedule.hour,
            buscarResidencia: formDataObject.get('buscarResidencia') === 'on'
        };

        try {
            const resposta = await fetchSchedule.post(novoAgendamento);

            if (resposta && resposta.ok) {
                Storage.delete('scheduleData');
                window.location.href = 'agenda.html';
            } else {
                console.error('Erro ao salvar: resposta inválida', resposta);
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
        }
    });
});