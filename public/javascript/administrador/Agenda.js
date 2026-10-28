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
            alert.className = 'animate-fadeItem text-lg font-semibold text-gray-700 text-center col-span-full py-8';
            alert.textContent = "Não há nenhum agendamento para este dia e serviço selecionados.";
            this.contentSchedule.appendChild(alert);
        }
    }

    createStructSchedule(scheduleObject) {
        const div = structAgenda(scheduleObject);
        this.contentSchedule.appendChild(div);
    }

    scheduleInit() {
        this.contentSchedule.innerHTML = "";

        if (Array.isArray(this.schedules)) {
            this.schedules.forEach((scheduleObject) => {
                if (scheduleObject.date == this.inputDate.value) {
                    this.createStructSchedule(scheduleObject);
                }
            });
        }

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
        if (!this.inputDate.value) {
            this.inputDate.classList.add('error');
            this.inputDate.addEventListener('click', () => {
                this.inputDate.classList.remove('error');
            }, { once: true });
            return;
        }

        if (!this.schedules) {
            if (window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
                this.schedules = window.initialAgendamentos;
            } else {
                try {
                    const schedules = await this.fetchJson.get();
                    if (Array.isArray(schedules)) {
                        this.schedules = schedules;
                    } else {
                        this.schedules = [];
                    }
                } catch (e) {
                    this.schedules = [];
                }
            }
        }

        this.contentSchedule.innerHTML = "";

        const selectedDate = this.inputDate.value;
        const selectedService = this.selectService ? this.selectService.value : 'all';

        if (Array.isArray(this.schedules)) {
            this.schedules.forEach((scheduleObject) => {
                const matchDate = scheduleObject.date == selectedDate;
                const serviceId = scheduleObject.service?.id || scheduleObject.fk_service;
                const serviceName = scheduleObject.service?.name || scheduleObject.service?.nome || '';

                const matchService = selectedService === 'all' || 
                    String(serviceId) === String(selectedService) ||
                    (serviceName && serviceName.toLowerCase() === selectedService.toLowerCase());

                if (matchDate && matchService) {
                    this.createStructSchedule(scheduleObject);
                }
            });
        }

        this.verifyIfHasSchedule();
    }

    addEvents() {
        if (this.buttonSearchSchedule) {
            this.buttonSearchSchedule.addEventListener('click', this.filterSchedule);
        }
        if (this.inputDate) {
            this.inputDate.addEventListener('change', this.filterSchedule);
        }
        if (this.selectService) {
            this.selectService.addEventListener('change', this.filterSchedule);
        }
    }

    getSchedules() {
        if (window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
            this.schedules = window.initialAgendamentos;
            this.scheduleInit();
            return Promise.resolve(this.schedules);
        }
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
            if (window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
                this.schedules = window.initialAgendamentos;
            }
            this.filterSchedule();
        }

        return this;
    }
}