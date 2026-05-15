import Storage from "../Storage.js";

export default function sendDataSchedule(){
    const buttonSubmitInfosSchedule = document.querySelector('[data-button="submitInfosSchedule"]');

    buttonSubmitInfosSchedule.addEventListener('click', () => {
        const infoService = document.querySelector('[data-filter-agenda].activeOption').getAttribute('data-filter-agenda');
        const infoDate = document.querySelector('[data-schedule-date="agenda"]').getAttribute('data-day-schedule');
        const infoHour = document.querySelector('[data-schedule-time="agenda"]').getAttribute('data-time-schedule');
        if(infoService && infoDate && infoHour){
            const data = {
                service: infoService,
                date: infoDate,
                hour: infoHour
            };
            Storage.set('scheduleData', JSON.stringify(data));
            window.open('../pages/form-agendar.html', '_self');
        } else {
            if(buttonSubmitInfosSchedule.previousElementSibling) return;
            const p = document.createElement('p');
            p.textContent = 'Selecione serviço, um horário e uma data.';
            p.className = 'animate-fadeTop text-red-alert text-base mb-4 font-semibold';
            buttonSubmitInfosSchedule.insertAdjacentElement('beforebegin', p);
        }
    });
}