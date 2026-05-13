export default function structThumb(imageObject){
    const figure = document.createElement('figure');
    figure.className = "swiper-slide !w-[100px] !h-[100px] rounded-[10px] cursor-pointer shadow-[0_4px_4px_rgba(0,0,0,0.25)] bg-white overflow-hidden transition-all duration-300 opacity-60 hover:opacity-100 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:shadow-md [&.swiper-slide-thumb-active]:ring-2 [&.swiper-slide-thumb-active]:ring-green-400";
    
    const img = document.createElement('img');
    img.src = imageObject.image;
    img.alt = imageObject.alt;
    img.className = "w-full h-full object-contain p-2";
    figure.appendChild(img);

    return figure;
}