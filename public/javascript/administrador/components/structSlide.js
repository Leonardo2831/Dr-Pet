import Fetch from "../../utils/Fetch.js";
import CheckFunction from "../../utils/CheckFunction.js";

const confirm = new CheckFunction();

export default function structSlide(object) {
    const figure = document.createElement('figure');
    figure.className = "animate-fadeLeft relative w-[280px] h-[148px] rounded-[10px] shrink-0 bg-cover bg-center bg-no-repeat";
    
    const slideId = object.id;
    figure.setAttribute('data-content-slides', slideId);
    figure.setAttribute('aria-label', object.alt || object.altImage || 'Slide image');
    figure.style.backgroundImage = `url('/administrador/slide-home/imagem/${slideId}')`;

    figure.innerHTML = `
        <div class="absolute inset-0 bg-black/25 rounded-[10px]"></div>
        <button type="button" data-id="${slideId}" class="delete-slide-btn delete-btn absolute -top-[12px] -right-[12px] flex items-center justify-center p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors z-10 shadow-sm cursor-pointer">
            <img src="../images/icons/administrador/delete-slide.svg" alt="Remover slide" class="w-5 h-5 pointer-events-none">
        </button>
    `;

    const button = figure.querySelector('.delete-slide-btn');
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        confirm.open(() => {
            const fetchAPI = new Fetch('administrador/slide-home', '[data-modal-info="adm"]');
            
            fetchAPI.delete(slideId).then((response) => {
                if (!response || response.ok) {
                    figure.remove();
                }
            }).catch(err => {
                console.error('Erro ao deletar slide:', err);
            });
        });
    });

    return figure;
}
