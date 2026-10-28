import cancelSchedule from "../cancelSchedule.js";
import editSchedule from "../editSchedule.js";
import Agenda from "../Agenda.js";


export default function structAgenda(object) {
    const serviceNames = {
        'banho-tosa': 'Banho e Tosa',
        'banho e tosa': 'Banho e Tosa',
        'vacinacao': 'Vacinação',
        'vacinação': 'Vacinação',
        'cirurgia': 'Cirurgia'
    };

    const div = document.createElement('div');
    div.className = "flex flex-col justify-between max-w-[670px] w-full px-5 sm:px-[30px] py-5 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]";
    div.setAttribute('data-id', object.id);

    const [year, month, day] = object.date ? object.date.split('-') : ['', '', ''];
    const formatDate = (day && month && year) ? `${day}/${month}/${year}` : (object.date || '');

    const today = new Date();
    const yearToday = today.getFullYear();
    const monthToday = String(today.getMonth() + 1).padStart(2, '0');
    const dayToday = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yearToday}-${monthToday}-${dayToday}`;

    const isFutureOrToday = (object.date || '') >= formattedToday;

    const rawService = (object.service && (object.service.name || object.service.nome)) || '';
    const serviceKey = rawService.toLowerCase().trim();
    const serviceName = serviceNames[serviceKey] || rawService || 'Serviço Veterinário';

    const clientName = (object.user && (object.user.username || object.user.nome)) || object.nome || 'Cliente';
    const petName = (object.petAgendado && object.petAgendado.name) || object.nomePet || 'Pet';
    const hour = object.hour ? object.hour.slice(0, 5) : '';
    const observations = (object.service && object.service.observations) || object.observation || '';
    const buscarResidencia = Boolean(object.buscarResidencia);

    div.innerHTML = `
        <div class="flex flex-row justify-between items-start ${isFutureOrToday ? 'pb-5' : ''} w-full">
            <div class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <span class="font-semibold text-base md:text-lg text-gray-800">
                        ${clientName} - <span class="whitespace-nowrap">${formatDate}</span>
                    </span>
                    <span class="font-medium text-base text-gray-700">
                        Pet: ${petName}
                    </span>
                </div>
                <div class="flex flex-col">
                    <span class="font-normal text-base text-gray-700">
                        <span class="font-medium">Serviço:</span> ${serviceName}
                    </span>
                    ${
                        observations ? 
                        `<span class="font-normal text-base text-gray-700">
                            <span class="font-medium">Descrição:</span> ${observations}
                        </span>` : ""
                    }
                    <span class="font-normal text-base text-gray-700">
                        <span class="font-medium">Buscar em casa:</span> ${buscarResidencia ? "Sim" : "Não"}
                    </span>
                </div>
            </div>
            <span class="font-medium text-lg md:text-[22px] leading-[27px] text-green-600">
                ${hour}
            </span>
        </div>

        ${
            isFutureOrToday ? `
            <div class="flex flex-row flex-wrap items-center justify-between pt-5 border-t border-green-500 w-full gap-5">
                <button type="button" data-button="cancelSchedule" class="flex flex-row justify-center items-center gap-2 md:gap-[10px] py-[10px] px-2 md:px-5 bg-red-alert rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] flex-1 basis-[150px] hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-red-alert/50 transition-all">
                    <span class="font-semibold text-sm md:text-base leading-[20px] uppercase text-gray-50">Cancelar</span>
                    <img src="../images/icons/administrador/cancel.svg" alt="Cancelar" class="w-4 h-4 md:w-5 md:h-5">
                </button>
                <button type="button" data-button="editSchedule" class="flex flex-row justify-center items-center gap-2 md:gap-[10px] py-[10px] px-2 md:px-5 bg-green-500 rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] flex-1 basis-[150px] hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all">
                    <span class="font-semibold text-sm md:text-base leading-[20px] uppercase text-gray-100">Editar</span>
                    <img src="../images/icons/administrador/edit-gray.svg" alt="Editar" class="w-4 h-4 md:w-5 md:h-5">
                </button>
            </div>
            ` : ''
        }
    `;

    if (isFutureOrToday) {
        div.querySelector('[data-button="editSchedule"]').addEventListener('click', () => {
            Agenda.openModal(document.querySelector('[data-modal="editSchedule"]'), editSchedule, object.id);
        });

        div.querySelector('[data-button="cancelSchedule"]').addEventListener('click', () => {
            Agenda.openModal(document.querySelector('[data-modal="cancelSchedule"]'), cancelSchedule, object.id);
        });
    }

    return div;
}