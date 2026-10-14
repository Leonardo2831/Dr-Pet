import PopUp from '../utils/Pop-up.js';

export default class MenuUserLoading {
    constructor(selectorMenuUserContent){
        this.menuUserContent = document.querySelector(selectorMenuUserContent);
    }

    init(){        
        if (this.menuUserContent) {
            new PopUp('[data-menuUser]', '[data-modal="menuUser"]').init();
        }
        return this;
    }
}
