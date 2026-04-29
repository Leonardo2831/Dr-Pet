import MenuOptions from "./modal-menuOptions.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuOptionsPets = new MenuOptions('[data-button="options-pet"]', '[data-popup="options-pet"]');
    const menuOptionsAddress = new MenuOptions('[data-button="options-address"]', '[data-popup="options-address"]');
});