import checkInputRadioParams from "./checkInputRadioParams.js";
import Storage from "../../utils/Storage.js";
import Fetch from "../../utils/Fetch.js";
import formatPhone from "../../utils/formatPhone.js";
import CheckLogin from "../../utils/checkLogin.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');
new CheckLogin('[data-modal="loginRequired"]').init();

const form = document.querySelector('form');
const fetchSchedule = new Fetch('agenda', '[data-modal-info="formSchedule"]');
const fetchPrice = new Fetch('service-infos', '[data-modal-info="formSchedule"]');
const infosSchedule = Storage.get('scheduleData');

let infosServiceAbout = await fetchPrice.get() || null;

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
            phone: formDataObject.get('telefone'),
            endereco: formDataObject.get('endereco')
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