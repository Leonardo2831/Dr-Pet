import Fetch from '../Fetch.js';
import slidesHome from "./slides-home.js";

function createImage(objectImage){
    const figure = document.createElement('figure');
    figure.className = "swiper-slide w-full h-full";

    const img = document.createElement('img');
    img.className = "w-full h-full object-cover object-center";
    img.setAttribute('src', objectImage.image);
    img.setAttribute('alt', objectImage.altImage);
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
            images.forEach((imgObject) => {
                contentSlide.appendChild(createImage(imgObject));
            });
        }

        slidesHome();
    });
}