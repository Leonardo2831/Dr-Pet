export default class Calender{
    constructor(selectorMonthInfo, selectorYearInfo, selectorBtnNext, selectorBtnPrev, selectorContainerCalender, selectorInfoDaySchedule, onDayClick = null){
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

    prevMonth(){
        // salva novo valor de mês para data, voltando 1 mês
        this.date.setMonth(this.month - 1);
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.renderCalendar();
    }

    nextMonth(){
        this.date.setMonth(this.month + 1);
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.renderCalendar();
    }

    addEvents(){
        this.btnNext.addEventListener('click', this.nextMonth);
        this.btnPrev.addEventListener('click', this.prevMonth);
    }

    spaceDaysEndMonth(firstDay, daysInMonth){
        // como são 42 espaços no calendário, para não ficar desproporcional, a gente faz os calculos dos espaços iniciais, que seria o dia da semana do primeiro dia do mês, porém em númeração não nome, mais os dias do mês atual. Com este total, tiramos de 42 essa soma, tendo os dias faltantes.
        const totalDiasRenderizados = firstDay + daysInMonth;
        const diasFaltantes = 42 - totalDiasRenderizados;

        for(let i = 1; i <= diasFaltantes; i++){
            const spaceCalender = document.createElement('div');
            this.calenderContent.appendChild(spaceCalender);
        }
    }

    formatScheduleInfos(dayCalender, date){
        const activeDays = this.calenderContent.querySelectorAll('.agenda-day.active');
        activeDays.forEach(day => day.classList.remove('active'));
        dayCalender.classList.add('active');

        const optionsStyleDate = {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }

        const dateSelected = date.toLocaleDateString('pt-BR', optionsStyleDate);
        this.infoDaySchedule.textContent = dateSelected.charAt(0).toUpperCase() + dateSelected.slice(1);
        this.infoDaySchedule.setAttribute('data-day-schedule', dayCalender.dataset.day);
    }

    renderDaysOfCalendar(daysInMonth){
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for(let i = 1; i <= daysInMonth; i++){
            const dayCalender = document.createElement('button');
            dayCalender.classList.add('agenda-day', 'animate-fadeTop');

            const currentIterationDate = new Date(this.year, this.month, i);

            if(i === today.getDate() && this.month === today.getMonth() && this.year === today.getFullYear()){
                dayCalender.classList.add('today');
            }

            if(currentIterationDate.getDay() == 0){
                dayCalender.classList.add('inactive');
                dayCalender.disabled = true;
            }

            dayCalender.textContent = i;

            if(currentIterationDate.getTime() < today.getTime()){
                dayCalender.classList.add('beforeNow');
                dayCalender.disabled = true;
                this.calenderContent.appendChild(dayCalender);
                continue;
            }

            if(dayCalender.classList.contains('beforeNow') || dayCalender.classList.contains('inactive')) {
                this.calenderContent.appendChild(dayCalender);
                continue
            };            
            
            const [year, month, day] = currentIterationDate.toISOString().split('T')[0].split('-');
            dayCalender.setAttribute('data-day', `${year}-${month}-${day}`);

            dayCalender.addEventListener('click', () => {
                this.formatScheduleInfos(dayCalender, currentIterationDate);
                if(this.onDayClick) this.onDayClick(dayCalender.dataset.day);
            });

            this.calenderContent.appendChild(dayCalender);
        }
    }

    spaceDaysInitMonth(firstDay){
        for(let i = firstDay; i > 0; i--){
            const spaceCalender = document.createElement('div');
            this.calenderContent.appendChild(spaceCalender);
        }
    }

    renderTitleDays(){
        this.calenderContent.innerHTML = '';
        this.daysWeek.forEach(day => {
            const span = document.createElement('span');
            span.classList.add('agenda-day-title', 'animate-fadeTop');
            span.textContent = day;
            this.calenderContent.appendChild(span);
        });
    }

    renderMonthAndYear(){
        this.monthInfo.textContent = this.months[this.month];
        this.yearInfo.textContent = this.year;
    }

    renderCalendar(){
        this.renderTitleDays();
        this.renderMonthAndYear();

        // Pega qual dia da semana o mês começou de 0 a 6
        const firstDay = new Date(this.year, this.month, 1).getDay();
        // Passar o dia como 0 o computador entende que você quer o ultimo dia do mês passado, como soma 1 ao mês, pega o ultimo dia do mês atual
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

        this.spaceDaysInitMonth(firstDay);
        this.renderDaysOfCalendar(daysInMonth);
        this.spaceDaysEndMonth(firstDay, daysInMonth);
    }

    init(){
        if(this.monthInfo && this.yearInfo && this.btnNext && this.btnPrev){
            this.renderCalendar();
            this.addEvents();
            this.formatScheduleInfos(this.calenderContent.querySelector('.agenda-day.today'), new Date());
        }
        return this;
    }
}