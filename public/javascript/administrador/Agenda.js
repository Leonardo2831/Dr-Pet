import Fetch from "../utils/Fetch.js";
import structAgenda from "./components/structAgenda.js";

export default class Agenda {
    constructor(selectorContentSchedule, selectorInputDate, selectorSelectService, selectorButtonSearchSchedule) {
        this.contentSchedule = document.querySelector(selectorContentSchedule);
        this.inputDate = document.querySelector(selectorInputDate);
        this.selectService = document.querySelector(selectorSelectService);
        this.buttonSearchSchedule = document.querySelector(selectorButtonSearchSchedule);

        this.fetchJson = new Fetch('administrador/agenda/dados', '[data-modal-info="adm"]');
        this.schedules = null;

        this.filterSchedule = this.filterSchedule.bind(this);
    }

    static openModal(modal, functionItem, id, scheduleObj) {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        functionItem(modal, id, scheduleObj);
    }

    normalizeDate(val) {
        if (!val) return "";
        let str = String(val).trim();
        if (str.includes("T")) str = str.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split("/");
            return `${y}-${m}-${d}`;
        }
        try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            }
        } catch (_) {}
        return str;
    }

    verifyIfHasSchedule() {
        if (!this.contentSchedule) return;
        if (!this.contentSchedule.children.length) {
            const alert = document.createElement('p');
            alert.className = 'animate-fadeItem text-lg font-semibold text-gray-700 text-center col-span-full py-8';
            alert.textContent = "Não há nenhum agendamento para este dia e serviço selecionados.";
            this.contentSchedule.appendChild(alert);
        }
    }

    createStructSchedule(scheduleObject) {
        if (!this.contentSchedule) return;
        const div = structAgenda(scheduleObject);
        this.contentSchedule.appendChild(div);
    }

    inputInit() {
        if (!this.inputDate) return;
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.inputDate.value = `${year}-${month}-${day}`;
    }

    async loadSchedules() {
        if (window.initialAgendamentos && Array.isArray(window.initialAgendamentos) && window.initialAgendamentos.length > 0) {
            this.schedules = window.initialAgendamentos;
            return this.schedules;
        }

        try {
            const schedules = await this.fetchJson.get();
            if (Array.isArray(schedules) && schedules.length > 0) {
                this.schedules = schedules;
            } else {
                this.schedules = window.initialAgendamentos || [];
            }
        } catch (e) {
            this.schedules = window.initialAgendamentos || [];
        }
        return this.schedules;
    }

    async filterSchedule() {
        if (!this.contentSchedule) return;

        if (!this.schedules) {
            await this.loadSchedules();
        }

        if (this.inputDate && !this.inputDate.value) {
            this.inputInit();
        }

        this.contentSchedule.innerHTML = "";

        const selectedDate = this.inputDate ? this.normalizeDate(this.inputDate.value) : "";
        const selectedService = this.selectService ? this.selectService.value : 'all';

        if (Array.isArray(this.schedules)) {
            this.schedules.forEach((scheduleObject) => {
                const itemDate = this.normalizeDate(scheduleObject.date || scheduleObject.dateAgendamento);
                
                // Filtra pelo dia selecionado (dia de hoje por padrão)
                const matchDate = selectedDate ? (itemDate === selectedDate) : true;

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
            this.buttonSearchSchedule.addEventListener('click', () => {
                this.filterSchedule();
            });
        }

        if (this.inputDate) {
            this.inputDate.addEventListener('change', () => {
                this.filterSchedule();
            });
        }

        if (this.selectService) {
            this.selectService.addEventListener('change', () => {
                this.filterSchedule();
            });
        }
    }

    init() {
        if (this.contentSchedule) {
            this.inputInit(); // Inicia com o dia de hoje

            if (window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
                this.schedules = window.initialAgendamentos;
            }

            this.addEvents();
            this.filterSchedule();
        }

        return this;
    }
}