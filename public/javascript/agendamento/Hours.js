import structHours from './components/structHours.js';

export default class Hours {
    constructor(selectorContentHoursMorning, selectorContentHoursAfternoon, selectorInfoHour) {
        this.contentHoursMorning = document.querySelector(selectorContentHoursMorning);
        this.contentHoursAfternoon = document.querySelector(selectorContentHoursAfternoon);
        this.infoHour = document.querySelector(selectorInfoHour);

        this.currentDay = null;
        this.ignoredAppointmentId = null;

        this.agenda = [];
        this.serviceInfos = {};
        this.allHours = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
    }

    hourToMinutes(hourString) {
        if (!hourString) return 0;
        const [hours, minutes] = hourString.split(':').map(Number);
        return (hours || 0) * 60 + (minutes || 0);
    }

    minutesToHour(minutesTotal) {
        const hours = String(Math.floor(minutesTotal / 60)).padStart(2, '0');
        const minutes = String(minutesTotal % 60).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    loadServerData() {
        try {
            const agendaEl = document.getElementById('server-agenda');
            if (agendaEl && agendaEl.textContent) {
                this.agenda = JSON.parse(agendaEl.textContent) || [];
            }
        } catch (error) {
            console.error("Erro ao carregar dados da agenda:", error);
            this.agenda = [];
        }

        try {
            const servicosEl = document.getElementById('server-servicos');
            if (servicosEl && servicosEl.textContent) {
                const list = JSON.parse(servicosEl.textContent) || [];
                this.serviceInfos = {};
                list.forEach(s => {
                    const obj = {
                        id: String(s.id),
                        name: s.nome,
                        time: Number(s.duracao) || 30,
                        price: Number(s.preco) || 0
                    };
                    this.serviceInfos[String(s.id)] = obj;
                    if (s.slug) {
                        this.serviceInfos[s.slug] = obj;
                    }
                });
            }
        } catch (error) {
            console.error("Erro ao carregar dados dos serviços:", error);
            this.serviceInfos = {};
        }
    }

    renderHours() {
        if (!this.contentHoursMorning || !this.contentHoursAfternoon) return;

        const grandParent = this.contentHoursMorning.parentElement?.parentElement?.parentElement;

        if (grandParent) {
            grandParent.classList.add('opacity-0');
            grandParent.classList.remove('animate-fadeTop');
        }

        if (this.infoHour) this.infoHour.textContent = '';
        this.contentHoursMorning.innerHTML = '';
        this.contentHoursAfternoon.innerHTML = '';

        // Se não houver serviços cadastrados
        if (!this.serviceInfos || Object.keys(this.serviceInfos).length === 0) {
            const p = document.createElement('p');
            p.textContent = 'Agendamento indisponível: nenhum serviço cadastrado no momento.';
            p.className = 'col-span-full text-base font-semibold text-gray-500 mt-2';
            this.contentHoursMorning.appendChild(p);
            if (grandParent) {
                grandParent.classList.remove('opacity-0');
                grandParent.classList.add('animate-fadeTop');
            }
            return;
        }

        const agendaByDay = (this.agenda || []).filter(item => {
            return item.date === this.currentDay && item.id !== this.ignoredAppointmentId;
        });

        let occupiedSlots = new Set();

        agendaByDay.forEach(appointment => {
            const startHour = appointment.hour;
            const serviceKey = appointment.fk_service || (appointment.service ? appointment.service.name : null);
            const serviceInfo = this.serviceInfos ? this.serviceInfos[String(serviceKey)] : null;
            
            const duration = serviceInfo ? serviceInfo.time : 30; 

            const startMinutes = this.hourToMinutes(startHour);
            const endMinutes = startMinutes + duration;

            for (let time = startMinutes; time < endMinutes; time += 30) {
                occupiedSlots.add(this.minutesToHour(time));
            }
        });

        let selectedServiceKey = null;
        if (this.getServiceName) {
            selectedServiceKey = this.getServiceName();
        } else {
            const selectedServiceElem = document.querySelector('[data-filter-agenda].activeOption');
            selectedServiceKey = selectedServiceElem ? selectedServiceElem.getAttribute('data-filter-agenda') : null;
        }

        const selectedServiceInfo = selectedServiceKey && this.serviceInfos ? this.serviceInfos[String(selectedServiceKey)] : null;
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

    loadByDay(date) {
        this.currentDay = date;
        this.renderHours();
    }

    setIgnoredAppointment(id) {
        this.ignoredAppointmentId = id;
    }

    setServiceSelectorCallback(callback) {
        this.getServiceName = callback;
    }

    init() {
        this.loadServerData();

        if (this.contentHoursMorning && this.contentHoursAfternoon) {
            const activeDay = document.querySelector('.agenda-day.active')?.getAttribute('data-day') 
                           || document.querySelector('.agenda-day.today')?.getAttribute('data-day')
                           || document.querySelector('[data-schedule-date="agenda"]')?.getAttribute('data-day-schedule');
            
            if (activeDay) {
                this.loadByDay(activeDay);
            }
        }

        return this;
    }
}