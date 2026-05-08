export default function structAgenda(object){
    const div = document.createElement('div');
    div.className = "flex flex-col justify-between w-full px-5 sm:px-[30px] py-5 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]";
    div.setAttribute('data-id', object.id);

    const [year, month, day] = object.date.split('-');
    const formatDate = `${day}/${month}/${year}`;

    div.innerHTML = `
        <div class="flex flex-row justify-between items-start pb-5 w-full">
            <div class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <span class="font-semibold text-base md:text-lg text-gray-800">
                        ${object.user.username} - <span class="whitespace-nowrap">${formatDate}</span>
                    </span>
                    <span class="font-medium text-base text-gray-700">
                        Pet: ${object.petAgendado.name}
                    </span>
                </div>
                <div class="flex flex-col">
                    <span class="font-normal text-base text-gray-700">
                        <span class="font-medium">Serviço:</span> ${object.service.name}
                    </span>
                    ${
                        object.service.observations ? 
                        `<span class="font-normal text-base text-gray-700">
                            <span class="font-medium">Descrição:</span> ${object.service.observations}
                        </span>` : ""
                    }
                    <span class="font-normal text-base text-gray-700">
                        <span class="font-medium">Buscar em casa:</span> ${object.buscarResidencia ? "Sim" : "Não"}
                    </span>
                </div>
            </div>
            <span class="font-medium text-lg md:text-[22px] leading-[27px] text-green-600">
                ${object.hour}
            </span>
        </div>

        <div class="flex flex-row flex-wrap items-center justify-between pt-5 border-t border-green-500 w-full gap-5">
            <button type="button" class="flex flex-row justify-center items-center gap-2 md:gap-[10px] py-[10px] px-2 md:px-5 bg-red-alert rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] flex-1 basis-[150px] hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-red-alert/50 transition-all">
                <span class="font-semibold text-sm md:text-base leading-[20px] uppercase text-gray-50">Cancelar</span>
                <img src="../images/icons/administrador/cancel.svg" alt="Cancelar" class="w-4 h-4 md:w-5 md:h-5">
            </button>
            <button type="button" class="flex flex-row justify-center items-center gap-2 md:gap-[10px] py-[10px] px-2 md:px-5 bg-green-500 rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] flex-1 basis-[150px] hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all">
                <span class="font-semibold text-sm md:text-base leading-[20px] uppercase text-gray-100">Editar</span>
                <img src="../images/icons/administrador/edit-gray.svg" alt="Editar" class="w-4 h-4 md:w-5 md:h-5">
            </button>
        </div>
    `;

    return div;
}