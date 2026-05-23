import Fetch from "../../Fetch.js";
import Storage from "../../Storage.js";
import PopUp from "../../Pop-up.js";

// estado compartilhado entre todos os pets (escopo do módulo)
let selectedPet = null;
let petListenersReady = false;

function setupPetPopupListeners(userData, fetchUser) {
    // garante que os listeners do popup sejam registrados UMA vez só
    if (petListenersReady) return;
    petListenersReady = true;

    const popup = document.querySelector('[data-popup="options-pet"]');

    // Editar
    document.querySelector('[data-button="editPet"]').addEventListener('click', (event) => {
        event.stopPropagation();
        if (!selectedPet) return;

        const modal = document.querySelector('[data-modal="addPet"]');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        document.querySelector('[data-input="petName"]').value = selectedPet.name;
        document.querySelector('[data-input="petRace"]').value = selectedPet.race;
        document.querySelector('[data-input="petDescription"]').value = selectedPet.descriptionPet;
        document.querySelector('[data-input="petGender"]').value = selectedPet.gender;
        document.querySelector('[data-button="savePet"]').dataset.editId = selectedPet.id;

        // fecha o popup ao abrir o modal
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    });

    // Excluir
    document.querySelector('[data-button="deletePet"]').addEventListener('click', async (event) => {
        event.stopPropagation();
        if (!selectedPet) return;

        const userId = Storage.getValueStorage('user-id').replace(/[^0-9]/g, '');
        userData.pets = userData.pets.filter(p => p.id !== selectedPet.id);
        await fetchUser.put(userId, userData);

        document.querySelector(`[data-id="${selectedPet.id}"]`)?.remove();

        popup.classList.add('hidden');
        popup.classList.remove('flex');
        selectedPet = null;
    });

    // fecha o popup ao clicar fora
    document.addEventListener('click', (event) => {
        if (popup && !popup.contains(event.target)) {
            popup.classList.add('hidden');
            popup.classList.remove('flex');
        }
    });
}

export default function structPet(object, userData, fetchUser) {
    // registra os listeners do popup (só roda de fato na primeira chamada)
    setupPetPopupListeners(userData, fetchUser);

    const div = document.createElement('div');
    div.className = "flex flex-row items-center justify-between gap-3 p-4 sm:p-6 lg:px-10 lg:py-[30px] border-b border-gray-200/50";
    div.setAttribute('data-id', object.id);

    div.innerHTML = `
        <div class="flex flex-row items-center gap-4 sm:gap-5 lg:gap-8">
            <div class="w-12 sm:w-16 lg:w-[81px] flex justify-center items-center flex-shrink-0">
                <img src="../images/icons/options/pets/dog.svg" alt="Ícone Pet"
                    class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-auto object-contain" />
            </div>
            <div class="flex flex-col gap-2 sm:gap-3 lg:gap-[15px]">
                <span class="text-xl sm:text-2xl lg:text-[32px] font-bold text-gray-800 leading-tight lg:leading-10">
                    ${object.name}
                </span>
                <div class="flex flex-col gap-1 sm:gap-1.5 lg:gap-[10px]">
                    <span class="text-base sm:text-lg lg:text-[22px] font-medium text-gray-700 leading-snug lg:leading-[27px]">
                        ${object.race}
                    </span>
                    <span class="text-base sm:text-lg lg:text-[22px] font-normal text-gray-700 leading-snug lg:leading-[27px]">
                        ${object.descriptionPet}
                    </span>
                </div>
            </div>
        </div>
        <button data-button="options-pet"
            class="flex flex-col gap-1 sm:gap-1.5 items-center justify-center p-2 sm:p-3 outline-none focus:ring-2 focus:ring-green-400 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Opções do Pet">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
        </button>
    `;

    // único listener por-pet: marca qual pet foi selecionado e abre o popup
    div.querySelector('[data-button="options-pet"]').addEventListener('click', (event) => {
        selectedPet = object;
        event.stopPropagation();

        const popup = document.querySelector('[data-popup="options-pet"]');
        popup.classList.remove('hidden');
        popup.classList.add('flex');
        popup.style.top = `${event.pageY + 8}px`;
        popup.style.left = `${event.pageX - popup.offsetWidth}px`;
    });

    return div;
}