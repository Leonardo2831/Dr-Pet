export default function structProduct(productObject){
    const a = document.createElement('a');
    a.className = "swiper-slide animate-fadeLeft !w-[160px] xs:!w-[180px] sm:!w-[220px] md:!w-[300px] lg:!w-[350px] h-auto cursor-pointer flex flex-col bg-white rounded-[10px] shadow transition-shadow group"
    a.setAttribute('data-id', productObject.id);
    a.setAttribute('href', `./produto.html?id=${productObject.id}`);

    a.innerHTML = `
        <figure class="relative aspect-square overflow-hidden shrink-0 rounded-t-[10px]">
            <img src="${productObject.imageMain.image}" alt="${productObject.imageMain.alt}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </figure>
        <div class="min-h-[200px] flex flex-col flex-grow justify-between gap-2 bg-gray-200 p-3 sm:p-4 md:p-6 rounded-b-[10px] group-hover:bg-gray-300 transition-colors">
            <article class="flex flex-col gap-1 sm:gap-2">
                <h3 class="text-gray-700 font-medium text-[14px] sm:text-[16px] md:text-[20px] leading-tight">
                    ${productObject.name}
                </h3>
                <p class="text-gray-700 font-normal text-base leading-relaxed line-clamp-2">
                    ${productObject.shortDescription}
                </p>
            </article>
            <span class="text-green-500 font-semibold uppercase text-[14px] sm:text-[16px] md:text-[20px] mt-1 sm:mt-0">
                R$ ${Number(productObject.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
    `;

    return a;
}