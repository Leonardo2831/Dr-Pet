export default function structHours(hour){
    const button = document.createElement('button');
    const span = document.createElement('span');
    button.setAttribute('type', 'button');
    button.classList.add('button-hour');
    span.textContent = hour;

    button.addEventListener('click', () => {
        const buttonActive = document.querySelector('.button-hour.active');
        if(buttonActive){
            buttonActive.classList.remove('active');
        }
        button.classList.add('active');
    });
    
    button.appendChild(span);

    return button;
}