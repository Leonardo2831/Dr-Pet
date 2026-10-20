import checkInputRadioParams from "./checkInputRadioParams.js";
import formatPhone from "../../utils/formatPhone.js";
import fillForm from "./fillForm.js";
import schedule from "./schedule.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');

const form = document.querySelector('form');
fillForm(form);
schedule(form);