import Fetch from '../utils/Fetch.js';
import structHours from './components/structHours.js';

export default class Hours{
    constructor(selectorContentHoursMorning, selectorContentHoursAfternoon, selectorInfoHour){
        this.contentHoursMorning = document.querySelector(selectorContentHoursMorning);
        this.contentHoursAfternoon = document.querySelector(selectorContentHoursAfternoon);
        this.infoHour = document.querySelector(selectorInfoHour);

        this.currentDay = null;
        this.ignoredAppointmentId = null;

        this.agenda = null;
        this.serviceInfos = null;
        this.fetchAgenda = new Fetch('agenda', '[data-modal-info="agenda"]');
        this.fetchServiceInfos = new Fetch('service-infos', '[data-modal-info="agenda"]');
        this.allHours = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
    }

    hourToMinutes(hourString) {
        const [hours, minutes] = hourString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToHour(minutesTotal) {
        const hours = String(Math.floor(minutesTotal / 60)).padStart(2, '0');
        const minutes = String(minutesTotal % 60).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    renderHours(){
        const grandParent = this.contentHoursMorning.parentElement.parentElement.parentElement;

        if (grandParent) {
            grandParent.classList.add('opacity-0');
            grandParent.classList.remove('animate-fadeTop');
        }

        this.infoHour.textContent = '';
        this.contentHoursMorning.innerHTML = '';
        this.contentHoursAfternoon.innerHTML = '';

        const agendaByDay = this.agenda.filter(hour => {
            return hour.date === this.currentDay && hour.id !== this.ignoredAppointmentId;
        });

        let occupiedSlots = new Set();

        agendaByDay.forEach(appointment => {
            const startHour = appointment.hour;
            const serviceName = appointment.service.name;
            const serviceInfo = this.serviceInfos ? this.serviceInfos[serviceName] : null;
            
            const duration = serviceInfo ? serviceInfo.time : 30; 

            const startMinutes = this.hourToMinutes(startHour);
            const endMinutes = startMinutes + duration;

            for (let time = startMinutes; time < endMinutes; time += 30) {
                occupiedSlots.add(this.minutesToHour(time));
            }
        });

        let selectedServiceName = null;
        if (this.getServiceName) {
            selectedServiceName = this.getServiceName();
        } else {
            const selectedServiceElem = document.querySelector('[data-filter-agenda].activeOption');
            selectedServiceName = selectedServiceElem ? selectedServiceElem.getAttribute('data-filter-agenda') : null;
        }

        const selectedServiceInfo = selectedServiceName && this.serviceInfos ? this.serviceInfos[selectedServiceName] : null;
        const selectedServiceDuration = selectedServiceInfo ? selectedServiceInfo.time : 30;

        this.allHours.forEach(hour => {
            let isOccupied = false;
            const slotStartMinute = this.hourToMinutes(hour);
            const slotEndMinute = slotStartMinute + selectedServiceDuration;

            for (let time = slotStartMinute; time < slotEndMinute; time += 30) {
                const timeStr = this.minutesToHour(time);
                if (!this.allHours.includes(timeStr) || occupiedSlots.has(timeStr)) {
                    isOccupied = true;
                    break;
                }
            }

            const info = this.infoHour || { textContent: '' };
            const period = hour < "12:00" ? "da manhã" : "da tarde";
            const btn = isOccupied ? "" : structHours(hour, info, period);

            if (btn) {
                if (hour < "12:00") {
                    this.contentHoursMorning.appendChild(btn);
                } else {
                    this.contentHoursAfternoon.appendChild(btn);
                }
            }
        });

        const emptyMessage = () => {
            const p = document.createElement('p');
            p.textContent = 'Não há vagas neste período para este serviço.';
            p.className = 'col-span-full text-base font-semibold text-gray-500 mt-2 animate-fadeTop';
            return p;
        };

        if (this.contentHoursMorning.children.length === 0) {
            this.contentHoursMorning.appendChild(emptyMessage());
        }

        if (this.contentHoursAfternoon.children.length === 0) {
            this.contentHoursAfternoon.appendChild(emptyMessage());
        }

        setTimeout(() => {
            if (grandParent) {
                grandParent.classList.remove('opacity-0');
                grandParent.classList.add('animate-fadeTop');
            }
        }, 50);
    }

    loadByDay(date){
        this.currentDay = date;
        this.renderHours();
    }

    setIgnoredAppointment(id){
        this.ignoredAppointmentId = id;
    }

    setServiceSelectorCallback(callback) {
        this.getServiceName = callback;
    }

    async getAgenda(){
        this.agenda = await this.fetchAgenda.get();
        this.serviceInfos = await this.fetchServiceInfos.get();
        this.loadByDay(document.querySelector('.agenda-day.today')?.getAttribute('data-day'));
    }

    init(){
        if(this.contentHoursMorning && this.contentHoursAfternoon){
            this.getAgenda();
        }

        return this;
    }
}