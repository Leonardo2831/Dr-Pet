import Fetch from '../utils/Fetch.js';
import Storage from '../utils/Storage.js';
import structMenuUser from './components/structMenuUser.js';
import PopUp from '../utils/Pop-up.js';
export default class MenuUserLoading{
    constructor(selectorMenuUserContent){
        this.menuUserContent = document.querySelector(selectorMenuUserContent);

        this.fetchJson = new Fetch('usuarios', '[data-modal-info-menu="user"]');
    }

    addEventLogout(){
        this.menuUserContent.querySelector('[data-button="logout"]').addEventListener('click', () => {
            Storage.delete('user-id');
            const isInPages = window.location.pathname.includes('/public/pages/');
            window.location.href = isInPages ? './login.html' : 'public/pages/login.html';
        });
    }

    lodingContent(){
        const idUser = Storage.get('user-id');

        if(idUser){
            this.fetchJson.get(idUser).then((user) => {
                this.menuUserContent.innerHTML = structMenuUser(user);
                this.addEventLogout();

                if (user && user.avatar) {
                    const btn = document.querySelector('[data-menuUser]');
                    const btnImg = document.querySelector('[data-menuUser] img');
                    if (btn && btnImg) {
                        btnImg.src = user.avatar;
                        btnImg.classList.add('object-cover', 'rounded-full');
                        btnImg.classList.remove('w-6', 'md:w-5', 'lg:w-6', 'xl:w-[30px]', 'h-auto');
                        btnImg.classList.add('w-12', 'h-12', 'md:w-10', 'md:h-10', 'lg:w-12', 'lg:h-12', 'xl:w-14', 'xl:h-14');
                        btn.classList.remove('p-3', 'md:p-2', 'lg:p-2', 'xl:p-3');
                    }
                }
            });
        } else {
            this.menuUserContent.innerHTML = structMenuUser();
        }

        new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
    }

    init(){        
        if(this.menuUserContent){
            this.lodingContent();
        }

        return this;
    }
}