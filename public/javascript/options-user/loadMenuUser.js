import Storage from "../utils/Storage.js";
import Fetch from "../utils/Fetch.js";
import UserInfosChange from "./UserInfosChange.js";
import structAddress from "./components/structEndereço.js";
import structPet from "./components/structPets.js";

export default async function loadMenuUser(){
    const userId = Storage.get('user-id');
    const fetchUser = new Fetch('usuarios', '[data-modal-info-menu="user"]');
    await fetchUser.get(userId).then((userData) => {
        const nameUser = document.querySelector('[data-info="nameUser"]');
        const infoDataUser = {
            email: document.querySelector('[data-info="email"]'),
            phone: document.querySelector('[data-info="telefone"]'),
            password: document.querySelector('[data-info="senha"]')
        }

        if(!userData) return;
        if(userData.userName) nameUser.textContent = userData.userName;
        if(userData.email) infoDataUser.email.textContent = userData.email;
        if(userData.phone) infoDataUser.phone.textContent = `(${userData.phone.substring(0, 2)}) ${userData.phone.substring(2, 7)}-${userData.phone.substring(7)}`;
        if(userData.password) infoDataUser.password.textContent = '*'.repeat(10);

        if(userData.avatar) {
            const avatarImg = document.querySelector('[data-input="avatarUser"]');
            if(avatarImg) {
                const imgElement = avatarImg.closest('figure').querySelector('img:first-of-type');
                if (imgElement) imgElement.src = userData.avatar;
            }
        }

        const addressContainer = document.querySelector('#address-container');
        userData.address.forEach((address) => {
            const addressElement = structAddress(address, userData, fetchUser);
            addressContainer.appendChild(addressElement);
        });

        const petsContainer = document.querySelector('#pet-container');
        userData.pets.forEach((pet)=> {
            const petElement = structPet(pet, userData, fetchUser);
            petsContainer.appendChild(petElement);
        });

        const userInfosChange = new UserInfosChange(
            '[data-button="saveEmail"]',
            '[data-button="saveTelefone"]',
            '[data-button="saveSenha"]',
            '[data-input="editEmail"]',
            '[data-input="editTelefone"]',
            '[data-input="editSenha"]',
            userData,
            fetchUser
        ).init();
    });
}