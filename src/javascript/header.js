import { Select } from "./components.js";

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
    headerMenuNav.classList.toggle(classOpenMobile);

    if(menuSemLogin && menuSemLogin.classList.contains(classOpenSemLogin)){
        menuSemLogin.classList.remove(classOpenSemLogin);
    }
}

if(buttonMenuMobile){
    buttonMenuMobile.addEventListener('click', openMenuMobile);
}

// abrir menu conta sem login
function openMenuContaSemLogin(){
    menuSemLogin.classList.toggle(classOpenSemLogin);

    if(headerMenuNav && headerMenuNav.classList.contains(classOpenMobile)){
        headerMenuNav.classList.remove(classOpenMobile)
    }
}

if(userButton){
    userButton.addEventListener('click', openMenuContaSemLogin);
}