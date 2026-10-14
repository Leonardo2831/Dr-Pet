import ChangeAvatar from "./ChangeAvatar.js";
import loadMenuUser from "./loadMenuUser.js";
import CheckLogin from "../utils/CheckLogin.js";
import PopUp from "../utils/Pop-up.js";

document.addEventListener('DOMContentLoaded', () => {
    new ChangeAvatar('[data-input="avatarUser"]').init();
    new CheckLogin('[data-modal="loginRequired"]').init();
    new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();

    loadMenuUser();
});