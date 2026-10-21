import getParamsURL from '../utils/getParamsURL.js';

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

function getServiceDefaultImg(slug) {
    if (slug === 'banho-tosa' || slug === 'vacinacao' || slug === 'cirurgia') {
        return `/images/services/${slug}.png`;
    }
    return '/images/services/banho-tosa.png';
}

// Carregar serviços embutidos pelo EJS no HTML
function loadServerServices() {
    try {
        const el = document.getElementById('server-servicos');
        if (el && el.textContent) {
            return JSON.parse(el.textContent);
        }
    } catch (error) {
        console.error("Erro ao obter dados de serviços do servidor:", error);
    }
    return [];
}

const serverServices = loadServerServices();
const servicesMap = {};

serverServices.forEach(s => {
    const serviceObj = {
        id: String(s.id),
        name: s.nome,
        time: Number(s.duracao) || 30,
        price: Number(s.preco) || 0,
        desc: s.descricao,
        slug: s.slug || String(s.id),
        img: s.has_imagem ? `/servicos/imagem/${s.id}` : getServiceDefaultImg(s.slug)
    };
    servicesMap[String(s.id)] = serviceObj;
    if (s.slug) {
        servicesMap[s.slug] = serviceObj;
    }
});

function changeValues(serviceKey) {
    const service = servicesMap[String(serviceKey)];
    const timeInfoService = document.querySelector('[data-time-service="completInfo"]');
    const priceInfoService = document.querySelector('[data-price-service="completInfo"]');
    const textInfo = document.querySelector('[data-textInfo="agenda-service"]');
    const imgInfo = document.querySelector('[data-imgInfo="agenda-service-image"]');
    const imgInfoService = document.querySelector('[data-imgInfo-service="completInfo"]');
    const textInfoService = document.querySelector('[data-textInfo-service="completInfo"]');

    if (!service) {
        if (timeInfoService) timeInfoService.textContent = "--";
        if (priceInfoService) priceInfoService.textContent = "R$ 0,00";
        if (textInfoService) textInfoService.textContent = "Nenhum";
        return;
    }

    if (textInfo) textInfo.textContent = service.name;
    if (imgInfo) {
        imgInfo.src = service.img;
        imgInfo.alt = service.name;
    }

    if (imgInfoService) {
        imgInfoService.src = service.img;
        imgInfoService.alt = service.name;
    }
    if (textInfoService) {
        textInfoService.textContent = service.name;
    }

    if (timeInfoService) {
        timeInfoService.textContent = formatarTempo(service.time);
    }
    if (priceInfoService) {
        priceInfoService.textContent = `R$ ${service.price.toFixed(2).replace('.', ',')}`;
    }

    // Animar elementos com fade ao trocar de serviço
    [textInfo, textInfoService, timeInfoService, priceInfoService].forEach(elem => {
        if (elem) {
            elem.classList.remove('animate-fadeTop');
            void elem.offsetWidth;
            elem.classList.add('animate-fadeTop');
        }
    });
}

export default async function selectAgenda(PopUpConfig, hoursInstance) {
    if (!PopUpConfig || !PopUpConfig.modal) return;
    const serviceOptions = PopUpConfig.modal.querySelectorAll('[data-filter-agenda]');

    // Se não houver opções de serviço (sistema em manutenção)
    if (serviceOptions.length === 0) {
        changeValues(null);
        return;
    }

    const parametroServico = getParamsURL('service');
    let itemActive = null;

    if (parametroServico) {
        itemActive = PopUpConfig.modal.querySelector(`[data-filter-agenda="${parametroServico}"]`);
        if (!itemActive && servicesMap[parametroServico]) {
            itemActive = PopUpConfig.modal.querySelector(`[data-filter-agenda="${servicesMap[parametroServico].id}"]`);
        }
    }

    if (!itemActive) {
        itemActive = PopUpConfig.modal.querySelector('.activeOption') || serviceOptions[0];
    }

    serviceOptions.forEach(opt => opt.classList.remove('activeOption'));
    if (itemActive) {
        itemActive.classList.add('activeOption');
        changeValues(itemActive.dataset.filterAgenda);
    }

    serviceOptions.forEach(option => {
        option.addEventListener('click', () => {
            serviceOptions.forEach(opt => opt.classList.remove('activeOption'));
            option.classList.add('activeOption');
            
            const serviceId = option.dataset.filterAgenda;
            changeValues(serviceId);

            if (PopUpConfig.closePopUp) {
                PopUpConfig.closePopUp();
            } else if (PopUpConfig.modal) {
                PopUpConfig.modal.classList.add('hidden');
            }

            if (hoursInstance && hoursInstance.currentDay) {
                hoursInstance.renderHours();
            }
        });
    });
}