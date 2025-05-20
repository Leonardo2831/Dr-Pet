import { Select } from "./components.js";

// abrindo menu mobile
// criando um construtor de seleção
const selectItem = new Select;

const buttonMenuMobile = selectItem.single('.js-mobileMenu');
const headerMenuNav = selectItem.single('.js-headerNav');
const classOpenMobile = 'openMenuMobile';

const userButton = selectItem.single('.js-userButton');
const menuConta = selectItem.single('.js-menuConta');
const classOpenContaSemLogin = 'openMenuContaSemLogin';

function openMenuMobile(){
    headerMenuNav.classList.toggle(classOpenMobile);

    if(menuConta && menuConta.classList.contains(classOpenContaSemLogin)){
        menuConta.classList.remove(classOpenContaSemLogin);
    }
}

if(buttonMenuMobile){
    buttonMenuMobile.addEventListener('click', openMenuMobile);
}

// abrir menu conta sem login
function openMenuContaSemLogin(){
    menuConta.classList.toggle(classOpenContaSemLogin);

    if(headerMenuNav && headerMenuNav.classList.contains(classOpenMobile)){
        headerMenuNav.classList.remove(classOpenMobile)
    }
}

if(userButton){
    userButton.addEventListener('click', openMenuContaSemLogin);
}