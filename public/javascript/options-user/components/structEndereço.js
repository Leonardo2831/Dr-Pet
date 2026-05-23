import PopUp from "../../Pop-up.js";
import Fetch from "../../Fetch.js";
import Storage from "../../Storage.js";

export default function structAddress(object, userData, fetchUser) {
    let currentAddressId = null;
    const div = document.createElement('div');
    div.className = "flex flex-row items-center justify-between gap-3 p-4 sm:p-6 lg:px-10 lg:py-[30px] border-b border-gray-200/50";
    div.setAttribute('data-id', object.id);

    div.innerHTML = `
        <div class="flex flex-row items-center gap-4 sm:gap-5 lg:gap-8">
            <div class="w-12 sm:w-16 lg:w-[81px] flex justify-center items-center flex-shrink-0">
                <img src="../images/icons/options/endereco/house.svg" alt="Ícone Casa"
                    class="w-8 h-8 sm:w-10 sm:h-10 lg:w-[49px] lg:h-auto object-contain" />
            </div>
            <div class="flex flex-col gap-2 sm:gap-3 lg:gap-[15px]">
                <span class="text-xl sm:text-2xl lg:text-[32px] font-bold text-gray-800 leading-tight lg:leading-[40px]">
                    ${object.rua} - ${object.numero}
                </span>
                <div class="flex flex-col gap-1 sm:gap-1.5 lg:gap-[10px]">
                    <span class="text-base sm:text-lg lg:text-[22px] font-normal text-gray-700 leading-snug lg:leading-[27px]">
                        CEP ${object.cep} - ${object.cidade} - ${object.estado}
                    </span>
                    <span class="text-base sm:text-lg lg:text-[22px] font-normal text-gray-700 leading-snug lg:leading-[27px]">
                        ${object.telefone}
                    </span>
                    <span class="text-base sm:text-lg lg:text-[22px] font-normal text-gray-700 leading-snug lg:leading-[27px]">
                        ${object.bairro}
                    </span>
                </div>
            </div>
        </div>
        <button data-button="options-address"
            class="flex flex-col gap-1 sm:gap-1.5 items-center justify-center p-2 sm:p-3 outline-none focus:ring-2 focus:ring-green-400 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Opções de Endereço">
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
            <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
        </button>
    `;

    div.querySelector('[data-button="options-address"]').addEventListener('click', (event) => {
        currentAddressId = object.id;
        event.stopPropagation();
        const popup = document.querySelector('[data-popup="options-address"]');
        popup.classList.remove('hidden');
        popup.classList.add('flex');
        popup.style.top = `${event.pageY + 8}px`;
        popup.style.left = `${event.pageX - popup.offsetWidth}px`;
    });

    document.addEventListener('click', (event) => {
        const popup = document.querySelector('[data-popup="options-address"]');
        if (!popup.contains(event.target)) {
            popup.classList.add('hidden');
            popup.classList.remove('flex');
        }
    });

    document.querySelector('[data-button="editAddress"]').addEventListener('click', async  () => {
        const modal = document.querySelector('[data-modal="addAddress"]');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.querySelector('[data-input="rua"]').value = object.rua;
        document.querySelector('[data-input="numero"]').value = object.numero;
        document.querySelector('[data-input="cep"]').value = object.cep;
        document.querySelector('[data-input="cidade"]').value = object.cidade;
        document.querySelector('[data-input="estado"]').value = object.estado;
        document.querySelector('[data-input="bairro"]').value = object.bairro;
        document.querySelector('[data-input="telefoneAddress"]').value = object.telefone;

        const address = userData.address.find(a => a.id === currentAddressId);

        document.querySelector('[data-button="saveAddress"]').dataset.editId = object.id;

        
    });

    document.querySelector('[data-button="deleteAddress"]').addEventListener('click', async () => {
        userData.address = userData.address.filter(a => a.id !== currentAddressId);

        const userId = Storage.getValueStorage('user-id');
        await fetchUser.put(userId, userData);

        div.remove();

    })

    return div;
}