import formatPhone from "../../utils/formatPhone.js";
import toggleShowPassword from "../toggleShowPassword.js";

document.addEventListener('DOMContentLoaded', () => {
    toggleShowPassword();
    formatPhone('[data-input="formatPhone"]');
});