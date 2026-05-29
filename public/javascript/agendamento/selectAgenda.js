import getParamsURL from '../utils/getParamsURL.js';
import Fetch from '../utils/Fetch.js';

function formatarTempo(minutos) {

    const numMinutos = parseInt(minutos, 10);
    if (!numMinutos || isNaN(numMinutos)) return "Indefinido";

    const horas = Math.floor(numMinutos / 60);
    const minutosRestantes = numMinutos % 60;

    if (horas > 0 && minutosRestantes > 0) {
        return `${horas}h ${minutosRestantes}min`;
    } else if (horas > 0) {
        return `${horas}h`;
    } else {
        return `${minutosRestantes}min`;
    }
}

const fetchPrecos = new Fetch('service-infos', '[data-modal-info="agenda"]');
let infosService = null;

try {
    infosService = await fetchPrecos.get();
} catch (error) {
    console.error("Erro ao pegar o valor dos dados", error);
}

function changeValuesService(value) {
    const timeInfoService = document.querySelector('[data-time-service="completInfo"]');
    const priceInfoService = document.querySelector('[data-price-service="completInfo"]');

    if (infosService && infosService[value]) {
        timeInfoService.textContent = formatarTempo(infosService[value].time);

        priceInfoService.textContent = `R$ ${infosService[value].price.toFixed(2).replace('.', ',')}`;
    } else {
        timeInfoService.textContent = "Erro";
        priceInfoService.textContent = 'R$ 0,00';
    }
}

async function changeValues(value) {
    const textInfo = document.querySelector('[data-textInfo="agenda-service"]');
    const imgInfo = document.querySelector('[data-imgInfo="agenda-service-image"]');

    imgInfo.src = `../images/services/${value}.png`;
    if (value === 'banho-tosa') {
        imgInfo.alt = 'Cachorro no serviço de Banho e Tosa';
        textInfo.textContent = 'Banho e Tosa';
    } else if (value === 'vacinacao') {
        imgInfo.alt = 'Cachorro no serviço de Vacinação';
        textInfo.textContent = 'Vacinação';
    } else if (value === 'cirurgia') {
        imgInfo.alt = 'Cachorro no serviço de Cirurgia';
        textInfo.textContent = 'Cirurgia';
    }

    const imgInfoService = document.querySelector('[data-imgInfo-service="completInfo"]');
    imgInfoService.src = imgInfo.src;
    imgInfoService.alt = imgInfo.alt;

    const textInfoService = document.querySelector('[data-textInfo-service="completInfo"]');
    textInfoService.textContent = textInfo.textContent;

    changeValuesService(value);
}

export default async function selectAgenda(PopUpConfig, hoursInstance) {
    const serviceOption = PopUpConfig.modal.querySelectorAll('[data-filter-agenda]');

    const parametroServico = getParamsURL('service') || 'banho-tosa';
    const itemActive = PopUpConfig.modal.querySelector(`[data-filter-agenda="${parametroServico}"]`);
    const itemLastActive = PopUpConfig.modal.querySelector('.activeOption');
    if (itemLastActive) itemLastActive.classList.remove('activeOption');
    if (itemActive) itemActive.classList.add('activeOption');

    await changeValues(parametroServico);

    serviceOption.forEach(option => {
        option.addEventListener('click', async () => {
            const activeOption = document.querySelector('.activeOption');
            if (activeOption) activeOption.classList.remove('activeOption');
            option.classList.add('activeOption');
            await changeValues(option.dataset.filterAgenda);
            
            if (hoursInstance && hoursInstance.currentDay) {
                hoursInstance.renderHours();
            }
        });
    });
}