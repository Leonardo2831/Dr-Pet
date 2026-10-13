import Fetch from '../utils/Fetch.js';
import slidesHome from "./slides-home.js";

function createImage(objectImage){
    const figure = document.createElement('figure');
    figure.className = "swiper-slide w-full h-full";

    const img = document.createElement('img');
    img.className = "w-full h-full object-cover object-center";
    const imageSrc = objectImage.imageUrl || objectImage.image || `/slides-home/${objectImage.id}/image`;
    img.setAttribute('src', imageSrc);
    img.setAttribute('alt', objectImage.alt || objectImage.altImage || 'Slide');
    img.setAttribute('id', objectImage.id);
    figure.appendChild(img);

    return figure;
}

export default function initSlides(){
    const fetchJson = new Fetch('slides-home', '[data-modal-info="home"]');
    const contentSlide = document.querySelector('[data-content-imgs="slideHome"]');

    fetchJson.get().then((images) => {
        if(Array.isArray(images)) {
            contentSlide.innerHTML = "";
            images.sort((a, b) => (a.order || a.ordem || 0) - (b.order || b.ordem || 0));
            images.forEach((imgObject) => {
                contentSlide.appendChild(createImage(imgObject));
            });
        }

        slidesHome();
    });
}