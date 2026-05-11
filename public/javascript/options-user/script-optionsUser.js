import MenuOptions from "./MenuOptions.js";
import PopUp from "../Pop-up.js"
import loadMenuUser from "./loadMenuUser.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuOptionsPets = new MenuOptions('[data-button="options-pet"]', '[data-popup="options-pet"]');
    const menuOptionsAddress = new MenuOptions('[data-button="options-address"]', '[data-popup="options-address"]');

    // Pop-ups infos user
    const popupEmail = new PopUp('[data-button="openEditEmail"]', '[data-modal="editEmail"]').init();
    const popupTelefone = new PopUp('[data-button="openEditTelefone"]', '[data-modal="editTelefone"]').init();
    const popupSenha = new PopUp('[data-button="openEditSenha"]', '[data-modal="editSenha"]').init();
    document.querySelector('[data-button="closeEditEmail"]').addEventListener('click', () => {
        popupEmail.closeModal();
    });
    document.querySelector('[data-button="closeEditTelefone"]').addEventListener('click', () => {
        popupTelefone.closeModal();
    });
    document.querySelector('[data-button="closeEditSenha"]').addEventListener('click', () => {
        popupSenha.closeModal();
    });

    loadMenuUser();
});