import getParamsURL from '../utils/getParamsURL.js';
import Fetch from '../utils/Fetch.js';

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

    const fetchPrecos = new Fetch('precos');
    const infosService = {};

    try {
        infosService = await fetchPrecos.get();
    } catch (error) {
        console.error("erro", error);
        infosService = {
            'banho-tosa': { time: '1h 30min', price: 90.00 },
            'vacinacao': { time: '30min', price: 50.00 },
            'cirurgia': { time: '2h', price: 400.00 }
        };
    }


    // teremos que fazer uma lógica no adm para fazer a mudança

    const timeInfoService = document.querySelector('[data-time-service="completInfo"]');
    const priceInfoService = document.querySelector('[data-price-service="completInfo"]');

    if (infosService[value]) {
        timeInfoService.textContent = infosService[value].time;
        priceInfoService.textContent = `R$ ${infosService[value].price.toFixed(2).replace('.', ',')}`;
    }
}

export default async function selectAgenda(PopUpConfig) {
    const serviceOption = PopUpConfig.modal.querySelectorAll('[data-filter-agenda]');

    const itemActive = PopUpConfig.modal.querySelector(`[data-filter-agenda="${getParamsURL('service') || 'banho-tosa'}"]`);
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
        });
    });
}