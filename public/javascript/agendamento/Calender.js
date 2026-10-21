export default class Calender {
    constructor(selectorMonthInfo, selectorYearInfo, selectorBtnNext, selectorBtnPrev, selectorContainerCalender, selectorInfoDaySchedule, onDayClick = null) {
        this.monthInfo = document.querySelector(selectorMonthInfo);
        this.yearInfo = document.querySelector(selectorYearInfo);
        this.btnNext = document.querySelector(selectorBtnNext);
        this.btnPrev = document.querySelector(selectorBtnPrev);
        this.calenderContent = document.querySelector(selectorContainerCalender);
        this.infoDaySchedule = document.querySelector(selectorInfoDaySchedule);
        this.onDayClick = onDayClick;

        this.date = new Date();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        
        this.months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        this.daysWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        this.prevMonth = this.prevMonth.bind(this);
        this.nextMonth = this.nextMonth.bind(this);
    }

    prevMonth() {
        this.date.setMonth(this.month - 1);
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.renderCalendar();
    }

    nextMonth() {
        this.date.setMonth(this.month + 1);
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.renderCalendar();
    }

    addEvents() {
        if (this.btnNext) this.btnNext.addEventListener('click', this.nextMonth);
        if (this.btnPrev) this.btnPrev.addEventListener('click', this.prevMonth);
    }

    spaceDaysEndMonth(firstDay, daysInMonth) {
        const totalDiasRenderizados = firstDay + daysInMonth;
        const diasFaltantes = 42 - totalDiasRenderizados;

        for (let i = 1; i <= diasFaltantes; i++) {
            const spaceCalender = document.createElement('div');
            this.calenderContent.appendChild(spaceCalender);
        }
    }

    formatScheduleInfos(dayCalender, date) {
        if (!dayCalender) return;
        const activeDays = this.calenderContent.querySelectorAll('.agenda-day.active');
        activeDays.forEach(day => day.classList.remove('active'));
        dayCalender.classList.add('active');

        const optionsStyleDate = {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        };

        const dateSelected = date.toLocaleDateString('pt-BR', optionsStyleDate);
        if (this.infoDaySchedule) {
            this.infoDaySchedule.textContent = dateSelected.charAt(0).toUpperCase() + dateSelected.slice(1);
            this.infoDaySchedule.setAttribute('data-day-schedule', dayCalender.dataset.day);

            // Reinicia a animação animate-fadeTop para criar transição suave
            this.infoDaySchedule.classList.remove('animate-fadeItem');
            void this.infoDaySchedule.offsetWidth;
            this.infoDaySchedule.classList.add('animate-fadeItem');

            const parentContainer = this.infoDaySchedule.parentElement;
            if (parentContainer) {
                parentContainer.classList.remove('animate-fadeItem');
                void parentContainer.offsetWidth;
                parentContainer.classList.add('animate-fadeItem');
            }
        }
    }

    renderDaysOfCalendar(daysInMonth) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCalender = document.createElement('button');
            dayCalender.setAttribute('type', 'button');
            dayCalender.classList.add('agenda-day', 'animate-fadeTop');

            const currentIterationDate = new Date(this.year, this.month, i);
            currentIterationDate.setHours(0, 0, 0, 0);

            if (i === today.getDate() && this.month === today.getMonth() && this.year === today.getFullYear()) {
                dayCalender.classList.add('today');
            }

            if (currentIterationDate.getDay() === 0) {
                dayCalender.classList.add('inactive');
                dayCalender.disabled = true;
            }

            dayCalender.textContent = i;

            if (currentIterationDate.getTime() < today.getTime()) {
                dayCalender.classList.add('beforeNow');
                dayCalender.disabled = true;
                this.calenderContent.appendChild(dayCalender);
                continue;
            }

            if (dayCalender.classList.contains('beforeNow') || dayCalender.classList.contains('inactive')) {
                this.calenderContent.appendChild(dayCalender);
                continue;
            }            
            
            const [year, month, day] = currentIterationDate.toISOString().split('T')[0].split('-');
            dayCalender.setAttribute('data-day', `${year}-${month}-${day}`);

            dayCalender.addEventListener('click', () => {
                this.formatScheduleInfos(dayCalender, currentIterationDate);
                if (this.onDayClick) this.onDayClick(dayCalender.dataset.day);
            });

            this.calenderContent.appendChild(dayCalender);
        }
    }

    spaceDaysInitMonth(firstDay) {
        for (let i = firstDay; i > 0; i--) {
            const spaceCalender = document.createElement('div');
            this.calenderContent.appendChild(spaceCalender);
        }
    }

    renderTitleDays() {
        this.calenderContent.innerHTML = '';
        this.daysWeek.forEach(day => {
            const span = document.createElement('span');
            span.classList.add('agenda-day-title', 'animate-fadeTop');
            span.textContent = day;
            this.calenderContent.appendChild(span);
        });
    }

    renderMonthAndYear() {
        if (this.monthInfo) this.monthInfo.textContent = this.months[this.month];
        if (this.yearInfo) this.yearInfo.textContent = this.year;
    }

    renderCalendar() {
        this.renderTitleDays();
        this.renderMonthAndYear();

        const firstDay = new Date(this.year, this.month, 1).getDay();
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

        this.spaceDaysInitMonth(firstDay);
        this.renderDaysOfCalendar(daysInMonth);
        this.spaceDaysEndMonth(firstDay, daysInMonth);
    }

    attachEventsToExistingDays() {
        if (!this.calenderContent) return;
        const days = this.calenderContent.querySelectorAll('.agenda-day:not(.inactive):not(.beforeNow)');
        
        days.forEach(dayBtn => {
            dayBtn.addEventListener('click', () => {
                const dayString = dayBtn.getAttribute('data-day');
                if (dayString) {
                    const [y, m, d] = dayString.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    this.formatScheduleInfos(dayBtn, dateObj);
                    if (this.onDayClick) this.onDayClick(dayString);
                }
            });
        });
    }

    init() {
        if (this.calenderContent && this.btnNext && this.btnPrev) {
            this.addEvents();
            
            // Se já existem botões renderizados pelo EJS, apenas anexa eventos
            const existingDays = this.calenderContent.querySelectorAll('.agenda-day');
            if (existingDays.length > 0) {
                this.attachEventsToExistingDays();
                const todayBtn = this.calenderContent.querySelector('.agenda-day.today') 
                              || this.calenderContent.querySelector('.agenda-day.active');
                if (todayBtn) {
                    this.formatScheduleInfos(todayBtn, new Date());
                }
            } else {
                this.renderCalendar();
                this.formatScheduleInfos(this.calenderContent.querySelector('.agenda-day.today'), new Date());
            }
        }
        return this;
    }
}