import checkInputRadioParams from "./checkInputRadioParams.js";
import Storage from "../../utils/Storage.js";
import Fetch from "../../utils/Fetch.js";
import formatPhone from "../../utils/formatPhone.js";

document.addEventListener('DOMContentLoaded', () => {
    checkInputRadioParams();
    formatPhone('[data-input="formatPhone"]');
    
    const form = document.querySelector('form');
    const fetchSchedule = new Fetch('agenda', '[data-modal-info="formSchedule"]');
    const infosSchedule = Storage.get('scheduleData');

    // tempo definido em horas
    const infosServiceAbout = {
        'banho-tosa': {
            time: 1.5,
            price: 90.00
        },
        'vacinacao': {
            time: 0.5,
            price: 50.00
        },
        'cirurgia': {
            time: 2,
            price: 400.00
        }
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (!infosSchedule || !infosSchedule.date || !infosSchedule.hour) {
            console.error('scheduleData ausente ou incompleto:', infosSchedule);
            return;
        }

        const serviceInfo = infosServiceAbout[infosSchedule.service];
        const formDataObject = new FormData(form);
        const novoAgendamento = {
            id: crypto.randomUUID(),
            user: {
                username: formDataObject.get('nome'),
                phone: formDataObject.get('telefone')
            },
            petAgendado: {
                name: formDataObject.get('nomePet')
            },
            service: {
                name: infosSchedule.service,
                observations: formDataObject.get('descricao'),
                duration: serviceInfo.time,
                preco: serviceInfo.price,
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