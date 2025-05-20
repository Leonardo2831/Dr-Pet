import { Select } from "./components.js";

const user = {
    name: 'Dr Pet',
};

// abrindo menu mobile
// criando um construtor de seleção
const selectItem = new Select;

const buttonMenuMobile = selectItem.single('.js-mobileMenu');
const headerMenuNav = selectItem.single('.js-headerNav');
const classOpenMobile = 'openMenuMobile';

const userButton = selectItem.single('.js-userButton');

const menuSemLogin = selectItem.single('.js-menuSemLogin');
const classOpenSemLogin = 'openSemLogin';

const menuLogin = selectItem.single('.js-menuLogin');
const classOpenLogin = 'openLogin';

function openMenuMobile(){

    if((menuSemLogin && menuSemLogin.classList.contains(classOpenSemLogin)) ||  (menuLogin && menuLogin.classList.contains(classOpenLogin))){
        menuSemLogin.classList.remove(classOpenSemLogin);
    }
    
    headerMenuNav.classList.toggle(classOpenMobile);

}

if(buttonMenuMobile){
    buttonMenuMobile.addEventListener('click', openMenuMobile);
}

// abrir menu conta sem login
function openMenuConta(){
    // se o usuário tiver uma conta
    if(headerMenuNav && headerMenuNav.classList.contains(classOpenMobile)){
        headerMenuNav.classList.remove(classOpenMobile);
    }

    if(user){
        menuLogin.classList.toggle(classOpenLogin);
    } else {
        menuSemLogin.classList.toggle(classOpenSemLogin);
    }
}

if(userButton){
    userButton.addEventListener('click', openMenuConta);
}