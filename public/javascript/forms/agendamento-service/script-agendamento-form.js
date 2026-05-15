import checkInputRadioParams from "./checkInputRadioParams.js";
import Storage from "../../Storage.js";

document.addEventListener('DOMContentLoaded', () => {
    checkInputRadioParams();
    const form = document.querySelector('form');
    const fetchSchedule = new Fetch('schedule', '[data-modal-info="formSchedule"]');
    const infosSchedule = Storage.get('scheduleData');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

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

        const resposta = await fetchSchedule.post(novoAgendamento);

        if (resposta.ok) {
            window.location.href = 'agenda.html';
        } else console.error('Erro ao salvar:', erro);

    });
});