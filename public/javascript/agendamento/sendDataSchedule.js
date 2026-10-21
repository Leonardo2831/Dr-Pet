import Storage from "../utils/Storage.js";

export default function sendDataSchedule(){
    const buttonSubmitInfosSchedule = document.querySelector('[data-button="submitInfosSchedule"]');
    if (!buttonSubmitInfosSchedule) return;

    buttonSubmitInfosSchedule.addEventListener('click', (event) => {
        if (buttonSubmitInfosSchedule.disabled || buttonSubmitInfosSchedule.hasAttribute('disabled')) {
            event.preventDefault();
            return;
        }

        const activeOption = document.querySelector('[data-filter-agenda].activeOption');
        const infoDateElem = document.querySelector('[data-schedule-date="agenda"]');
        const infoHourElem = document.querySelector('[data-schedule-time="agenda"]');

        const infoService = activeOption ? activeOption.getAttribute('data-filter-agenda') : null;
        const infoDate = infoDateElem ? infoDateElem.getAttribute('data-day-schedule') : null;
        const infoHour = infoHourElem ? infoHourElem.getAttribute('data-time-schedule') : null;

        if (infoService && infoDate && infoHour) {
            const data = {
                service: infoService,
                serviceName: activeOption.getAttribute('data-service-name') || activeOption.textContent.trim(),
                date: infoDate,
                hour: infoHour
            };
            Storage.set('scheduleData', data);
            window.open('/form-agendar', '_self');
        } else {
            const existingAlert = buttonSubmitInfosSchedule.parentElement.querySelector('.alert-schedule');
            if (existingAlert) return;

            const p = document.createElement('p');
            if (!infoService) {
                p.textContent = 'Não é possível agendar. Sistema em manutenção e sem serviços disponíveis.';
            } else {
                p.textContent = 'Por favor, selecione um serviço, um horário e uma data.';
            }
            p.className = 'alert-schedule animate-fadeTop text-red-500 text-sm md:text-base mb-3 font-semibold text-center';
            buttonSubmitInfosSchedule.insertAdjacentElement('beforebegin', p);

            setTimeout(() => {
                p.remove();
            }, 3500);
        }
    });
}