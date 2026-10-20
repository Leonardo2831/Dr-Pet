import ChangeAvatar from "./ChangeAvatar.js";
import loadMenuUser from "./loadMenuUser.js";
import PopUp from "../utils/Pop-up.js";

document.addEventListener('DOMContentLoaded', () => {
    new ChangeAvatar('[data-input="avatarUser"]').init();
    new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();

    loadMenuUser();
});