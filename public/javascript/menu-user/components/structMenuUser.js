export default function structMenuUser(user = null){
    const isInPages = window.location.pathname.includes('/public/pages/');
    const basePath = isInPages ? '' : 'public/pages/';
    const imagePath = isInPages ? '../images/icons/' : 'public/images/icons/';

    if(user){
        return `
            <div class="flex flex-col w-[730px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] rounded-b-[10px] overflow-hidden">
                <div class="flex items-center w-full gap-[30px] p-[30px] bg-gray-100">
                    <img src="${user.avatar || imagePath + 'options/user-default.svg'}" alt="User Avatar" class="w-[60px] h-[60px] lg:w-20 lg:h-20 object-cover rounded-full" />
                    <span class="font-semibold text-2xl text-gray-800 lg:text-3xl">
                        ${user.userName || "Minha Conta"}
                    </span>
                </div>

                <a href="${basePath}option-user.html" class="flex items-center w-full gap-[20px] p-[30px] bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer border-b border-gray-200">
                    <img src="${imagePath}/menu-user/settings.svg" alt="Opções" class="w-10 h-10 lg:w-12 lg:h-12" />
                    <span class="font-medium text-xl text-gray-800 lg:text-2xl">
                        Opções
                    </span>
                </a>

                ${user.typeUser !== 'comum' ? `
                    <a href="${basePath}administrador.html" class="flex items-center w-full gap-[20px] p-[30px] bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer border-b border-gray-200">
                        <img src="${imagePath}/menu-user/admin-panel-settings.svg" alt="Painel de aministração" class="w-10 h-10 lg:w-12 lg:h-12" />
                        <span class="font-medium text-xl text-gray-800 lg:text-2xl">
                            Painel de administrador
                        </span>
                    </a>
                ` : ''}

                <button data-button="logout" class="flex items-center w-full gap-[20px] p-[30px] bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                    <img src="${imagePath}/menu-user/logout.svg" alt="Sair" class="w-10 h-10 lg:w-12 lg:h-12" />
                    <span class="font-medium text-xl text-gray-800 lg:text-2xl">
                        Sair
                    </span>
                </button>
            </div>
        `;
    } else {
        return `
            <a href="${basePath}cadastrar.html" 
                class="flex items-center justify-center gap-[10px] py-6 px-9 w-full text-blue-link font-medium text-[22px] leading-[27px] hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap">
                Criar uma conta
            </a>
            <a href="${basePath}login.html"
                class="flex items-center justify-center gap-[10px] py-6 px-9 w-full text-gray-950 font-medium text-[22px] leading-[27px] hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap">
                Entrar
            </a>
        `;
    }
}