import Fetch from "../Fetch.js";
import structAgenda from "./components/structAgenda.js";

export default class Agenda {
    constructor(selectorContentSchedule, selectorInputDate, selectorSelectService, selectorButtonSearchSchedule){
        this.contentSchedule = document.querySelector(selectorContentSchedule);
        this.inputDate = document.querySelector(selectorInputDate);

        this.selectService = document.querySelector(selectorSelectService);
        this.buttonSearchSchedule = document.querySelector(selectorButtonSearchSchedule);

        this.fetchJson = new Fetch('agenda', '[data-modal-info="adm"]');
        // salvando dados do get para não ter que ficar fazendo get toda vez que buscar
        this.schedules = null;

        this.filterSchedule = this.filterSchedule.bind(this);
    }

    createStructSchedule(scheduleObject){
        const div = structAgenda(scheduleObject);
        this.contentSchedule.appendChild(div);
    }

    scheduleInit(){
        this.schedules.forEach((scheduleObject) => {
            this.createStructSchedule(scheduleObject);
        });
    }

    inputsInit(){
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        this.inputDate.value = `${year}-${month}-${day}`;
    }

    filterSchedule(){
        this.contentSchedule.innerHTML = "";
        
        if(this.inputDate.value && this.selectService.value){
            this.schedules.forEach((scheduleObject) => {
                if((scheduleObject.date == this.inputDate.value) && (scheduleObject.service.name.toLowerCase() == this.selectService.value.toLowerCase())){
                    this.createStructSchedule(scheduleObject);
                }
            });
        } else {
            this.scheduleInit();
        }

        if(!this.contentSchedule.children.length){
            const alert = document.createElement('p');
            alert.className = 'animate-fadeItem text-lg font-semibold text-gray-700 text-center';
            alert.textContent = "Não há nenhum horário para esse dia e este serviço";
            this.contentSchedule.appendChild(alert);
        }
    }

    addEvents(){
        this.buttonSearchSchedule.addEventListener('click', this.filterSchedule);
    }

    getSchedules(){
        this.fetchJson.get().then((schedules) => {
            if(Array.isArray(schedules)) {
                this.schedules = schedules;
                this.scheduleInit();
            }
        });
    }

    init(){
        if(this.contentSchedule && this.inputDate && this.selectService && this.buttonSearchSchedule){
            this.inputsInit();
            this.getSchedules();
            this.addEvents();
        }

        return this;
    }
}