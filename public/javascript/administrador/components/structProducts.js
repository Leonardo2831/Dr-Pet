import Fetch from '../../Fetch.js';

export default function structProducts(object){
    const tr = document.createElement('tr');
    tr.className = "animate-fadeItem border-b-[3px] border-gray-100 *:text-lg *:leading-[32px] *:text-gray-700 transition-colors";
    tr.setAttribute('data-id', object.id);

    tr.innerHTML = `
        <td class="max-w-0 truncate w-[25%]">${object.name}</td>
        <td class="capitalize">${object.category}</td>
        <td>${Number(object.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="max-w-0 truncate w-[25%]">${object.shortDescription}</td>
        <td class="max-w-0 truncate w-[25%]">${object.longDescription}</td>
        <td class="py-5 text-center">
            <button class="hover:opacity-80 transition-opacity mx-auto flex">
                <img src="../images/icons/administrador/edit-blue.svg" alt="Editar" class="w-6 h-6 md:w-[35px] md:h-[38px]">
            </button>
        </td>
        <td class="py-5 text-center">
            <button data-button="deleteProduct" class="p-4 hover:opacity-80 transition-opacity mx-auto flex">
                <img src="../images/icons/administrador/delete-product.svg" alt="Excluir" class="w-6 h-6 md:w-[37px] md:h-[38px]">
            </button>
        </td>
    `;

    tr.querySelector('[data-button="deleteProduct"]').addEventListener('click', () => {
        const fetchAPI = new Fetch('produtos', '[data-modal-info="adm"]');
        fetchAPI.delete(object.id);
        tr.remove();
    });

    return tr;
}