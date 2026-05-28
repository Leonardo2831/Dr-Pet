import Fetch from "../utils/Fetch.js";
import structAgenda from "./components/structAgenda.js";

export default class Agenda {
    constructor(selectorContentSchedule, selectorInputDate, selectorSelectService, selectorButtonSearchSchedule) {
        this.contentSchedule = document.querySelector(selectorContentSchedule);
        this.inputDate = document.querySelector(selectorInputDate);

        this.selectService = document.querySelector(selectorSelectService);
        this.buttonSearchSchedule = document.querySelector(selectorButtonSearchSchedule);

        this.fetchJson = new Fetch('agenda', '[data-modal-info="adm"]');
        this.fetchPrecos = new Fetch('service-infos', '[data-modal-info="adm"]');


        this.schedules = null;

        this.filterSchedule = this.filterSchedule.bind(this);
        this.savePrices = this.savePrices.bind(this);
    }

    static openModal(modal, functionItem, id) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        functionItem(modal, id);
    }

    verifyIfHasSchedule() {
        if (!this.contentSchedule.children.length) {
            const alert = document.createElement('p');
            alert.className = 'animate-fadeItem text-lg font-semibold text-gray-700 text-center';
            alert.textContent = "Não há nenhum horário para esse dia e este serviço";
            this.contentSchedule.appendChild(alert);
        }
    }

    createStructSchedule(scheduleObject) {
        const div = structAgenda(scheduleObject);
        this.contentSchedule.appendChild(div);
    }

    scheduleInit() {
        this.contentSchedule.innerHTML = "";

        this.schedules.forEach((scheduleObject) => {
            if (scheduleObject.date == this.inputDate.value) {
                this.createStructSchedule(scheduleObject);
            }
        });

        this.verifyIfHasSchedule();
    }

    inputInit() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        this.inputDate.value = `${year}-${month}-${day}`;
    }

    filterSchedule() {
        if (!this.inputDate.value || this.inputDate.value < this.inputDate.min) {
            this.inputDate.classList.add('error');
            this.inputDate.addEventListener('click', () => {
                this.inputDate.classList.remove('error');
            });
            return;
        }

        this.contentSchedule.innerHTML = "";

        if (this.inputDate.value && this.selectService.value) {
            this.schedules.forEach((scheduleObject) => {
                const matchDate = scheduleObject.date == this.inputDate.value;
                const matchService = this.selectService.value === 'all' || scheduleObject.service.name.toLowerCase() == this.selectService.value.toLowerCase();

                if (matchDate && matchService) {
                    this.createStructSchedule(scheduleObject);
                }
            });
        } else {
            this.scheduleInit();
        }

        this.verifyIfHasSchedule();
    }

    addPriceFormEvent() {
        const form = document.getElementById('form-cadastrar-precos');
        if (form) {
            form.addEventListener('submit', this.savePrices);
        }
    }
    async savePrices(event) {
        event.preventDefault();

        const servicoSelecionado = document.getElementById('servico-select').value;
        const novoTempo = parseInt(document.getElementById('tempo-input').value, 10);
        const novoPreco = parseFloat(document.getElementById('preco-input').value);

        try {

            let precosAtuais = await this.fetchPrecos.get() || {};


            precosAtuais[servicoSelecionado] = {
                time: novoTempo,
                price: novoPreco
            };

            await fetch('http://localhost:3000/precos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(precosAtuais)
            });

            alert('Preço e tempo convertidos e salvos com sucesso!');

            document.getElementById('tempo-input').value = '';
            document.getElementById('preco-input').value = '';

        } catch (error) {
            console.error('Erro ao atualizar os dados de preço:', error);
            alert('Houve um erro ao atualizar os preços.');
        }
    }

    addEvents() {
        this.buttonSearchSchedule.addEventListener('click', this.filterSchedule);
    }

    getSchedules() {
        this.fetchJson.get().then((schedules) => {
            if (Array.isArray(schedules)) {
                this.schedules = schedules;
                this.scheduleInit();
            }
        });
    }

    init() {
        if (this.contentSchedule && this.inputDate && this.selectService && this.buttonSearchSchedule) {
            this.inputInit();
            this.getSchedules();
            this.addEvents();
            this.addPriceFormEvent();
        }

        return this;
    }
}