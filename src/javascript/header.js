import { Select } from "./components.js";

// criando um construtor de seleção
const selectItem = new Select;

const headerMenuMobile = selectItem.single('.js-mobileMenu');
const headerNav = selectItem.single('.js-headerNav');

function openMenuMobile(){
    const classOpen = 'openMenuMobile';

    headerNav.classList.toggle(classOpen);
}

headerMenuMobile.addEventListener('click', openMenuMobile);