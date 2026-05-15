import Fetch from '../Fetch.js';
import structHours from './components/structHours.js';

export default class Hours{
    constructor(selectorContentHoursMorning, selectorContentHoursAfternoon){
        this.contentHoursMorning = document.querySelector(selectorContentHoursMorning);
        this.contentHoursAfternoon = document.querySelector(selectorContentHoursAfternoon);

        this.currentDay = null;

        this.agenda = null;
        this.fetchAgenda = new Fetch('agenda', '[data-modal-info="agenda"]');
        this.allHours = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
    }

    renderHours(){
        this.contentHoursMorning.innerHTML = '';
        this.contentHoursAfternoon.innerHTML = '';

        const agendaByDay = this.agenda.filter(hour => {
            return hour.date === this.currentDay;
        });

        const agendaHours = agendaByDay.map(day => day.hour);

        this.allHours.forEach(hour => {
            const isOccupied = agendaHours.includes(hour);
            const btn = isOccupied ? "" : structHours(hour);
            if(btn && hour < "12:00"){
                this.contentHoursMorning.appendChild(btn);
            } else if(btn) {
                this.contentHoursAfternoon.appendChild(btn);
            }
        });
        
        
    }

    loadByDay(date){
        this.currentDay = date;
        this.renderHours();
    }

    async getAgenda(){
        this.agenda = await this.fetchAgenda.get();
        this.renderHours();
    }

    init(){
        if(this.contentHoursMorning && this.contentHoursAfternoon){
            this.getAgenda();
        }

        return this;
    }
}