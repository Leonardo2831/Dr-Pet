export default function structSlide(imageObject){
    const figure = document.createElement('figure');
    figure.className = "swiper-slide flex items-center justify-center";

    const img = document.createElement('img');
    img.src = imageObject.image;
    img.alt = imageObject.alt;
    img.className = "w-full object-contain max-h-[500px] lg:max-h-[600px]";
    figure.appendChild(img);

    return figure;
}