import Fetch from "../utils/Fetch.js";
import structAgenda from "./components/structAgenda.js";

export default class Agenda {
    constructor(selectorContentSchedule, selectorInputDate, selectorSelectService, selectorButtonSearchSchedule) {
        this.contentSchedule = document.querySelector(selectorContentSchedule);
        this.inputDate = document.querySelector(selectorInputDate);

        this.selectService = document.querySelector(selectorSelectService);
        this.buttonSearchSchedule = document.querySelector(selectorButtonSearchSchedule);

        this.fetchJson = new Fetch('agenda', '[data-modal-info="adm"]');

        this.schedules = null;

        this.filterSchedule = this.filterSchedule.bind(this);
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

    async filterSchedule() {
        if (!this.inputDate.value || this.inputDate.value < this.inputDate.min) {
            this.inputDate.classList.add('error');
            this.inputDate.addEventListener('click', () => {
                this.inputDate.classList.remove('error');
            });
            return;
        }

        if (!this.schedules) {
            const schedules = await this.fetchJson.get();
            if (Array.isArray(schedules)) {
                this.schedules = schedules;
            } else {
                this.schedules = [];
            }
        }

        this.contentSchedule.innerHTML = "";

        if (this.inputDate.value && this.selectService.value) {
            this.schedules.forEach((scheduleObject) => {
                const matchDate = scheduleObject.date == this.inputDate.value;
                const matchService = this.selectService.value === 'all' || (scheduleObject.service && scheduleObject.service.name && scheduleObject.service.name.toLowerCase() == this.selectService.value.toLowerCase());

                if (matchDate && matchService) {
                    this.createStructSchedule(scheduleObject);
                }
            });
        } else {
            this.scheduleInit();
        }

        this.verifyIfHasSchedule();
    }

    addEvents() {
        this.buttonSearchSchedule.addEventListener('click', this.filterSchedule);
    }

    getSchedules() {
        return this.fetchJson.get().then((schedules) => {
            if (Array.isArray(schedules)) {
                this.schedules = schedules;
                this.scheduleInit();
            }
            return schedules;
        });
    }

    init() {
        if (this.contentSchedule && this.inputDate && this.selectService && this.buttonSearchSchedule) {
            this.inputInit();
            this.addEvents();
        }

        return this;
    }
}