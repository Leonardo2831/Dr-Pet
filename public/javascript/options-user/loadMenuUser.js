import Storage from "../Storage.js";
import Fetch from "../Fetch.js";
import UserInfosChange from "./UserInfosChange.js";
import structAddress from "./components/structEndereço.js";

export default async function loadMenuUser(){
    const userId = Storage.getValueStorage('user-id');
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
        if(userData.phone) infoDataUser.phone.textContent = userData.phone;
        if(userData.password) infoDataUser.password.textContent = '*'.repeat(userData.password.length);

        const addressContainer = document.querySelector('#address-container');
        userData.address.forEach((address) => {
            const addressElement = structAddress(address, userData, fetchUser);
            addressContainer.appendChild(addressElement);
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