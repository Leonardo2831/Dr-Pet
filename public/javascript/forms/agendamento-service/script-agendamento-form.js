import checkInputRadioParams from "./checkInputRadioParams.js";
import formatPhone from "../../utils/formatPhone.js";
import CheckLogin from "../../utils/checkLogin.js";
import fillForm from "./fillForm.js";
import schedule from "./schedule.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');
new CheckLogin('[data-modal="loginRequired"]').init();

const form = document.querySelector('form');
fillForm(form);
schedule(form);