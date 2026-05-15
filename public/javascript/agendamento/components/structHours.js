export default function structHours(hour, infoHour, period){
    const button = document.createElement('button');
    const span = document.createElement('span');
    button.setAttribute('type', 'button');
    button.classList.add('button-hour');
    button.setAttribute('data-time-hour', hour);
    span.textContent = hour;

    button.addEventListener('click', () => {
        const buttonActive = document.querySelector('.button-hour.active');
        if(buttonActive){
            buttonActive.classList.remove('active');
        }
        button.classList.add('active');
        infoHour.textContent = `${button.getAttribute('data-time-hour')} ${period}`;
        infoHour.setAttribute('data-time-schedule', button.getAttribute('data-time-hour'));
    });
    
    button.appendChild(span);

    return button;
}