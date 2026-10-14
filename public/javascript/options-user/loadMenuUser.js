import UserInfosChange from "./UserInfosChange.js";
import MenuOptions from "./MenuOptions.js";

export default function loadMenuUser() {
    new MenuOptions('[data-button="options-pet"]', '[data-popup="options-pet"]');
    new MenuOptions('[data-button="options-address"]', '[data-popup="options-address"]');

    new UserInfosChange().init();
}