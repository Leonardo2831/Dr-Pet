import Fetch from '../Fetch.js';
import Storage from '../Storage.js';
import structMenuUser from './components/structMenuUser.js';
import PopUp from '../Pop-up.js';
export default class MenuUserLoading{
    constructor(selectorMenuUserContent){
        this.menuUserContent = document.querySelector(selectorMenuUserContent);

        this.fetchJson = new Fetch('usuarios', '[data-modal-info-menu="user"]');
    }

    addEventLogout(){
        this.menuUserContent.querySelector('[data-button="logout"]').addEventListener('click', () => {
            Storage.removeItemStorage('user-id');
            window.location.href = '../login.html';
        });
    }

    lodingContent(){
        const idUser = Storage.getValueStorage('user-id');

        if(idUser){
            this.fetchJson.get(idUser).then((user) => {
                this.menuUserContent.innerHTML = structMenuUser(user);
                this.addEventLogout();
            });
        } else {
            this.menuUserContent.innerHTML = structMenuUser();
        }

        new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
    }

    init(){
        console.log(this.menuUserContent);
        
        if(this.menuUserContent){
            this.lodingContent();
        }

        return this;
    }
}