import Fetch from "../../Fetch.js";

export default function structSlide(object){
    const figure = document.createElement('figure');
    figure.className = "relative w-[280px] h-[148px] rounded-[10px] shrink-0 bg-cover bg-center bg-no-repeat";
    figure.setAttribute('data-content-slides', object.id);
    figure.setAttribute('aria-label', object.altImage || 'Slide image');
    figure.style.backgroundImage = `url('${object.image}')`;

    figure.innerHTML = `
        <div class="absolute inset-0 bg-black/25 rounded-[10px]"></div>
        <button type="button" class="absolute -top-[12px] -right-[12px] flex items-center justify-center p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors z-10 shadow-sm">
            <img src="../images/icons/administrador/delete-slide.svg" alt="Remover slide" class="w-5 h-5">
        </button>
    `;

    const button = figure.querySelector('button');
    button.addEventListener('click', () => {
        const fetch = new Fetch(`http://localhost:3000/api/slides/slides-home/${object.id}`);
        fetch.delete();
        figure.remove();
    });

    return figure;
}