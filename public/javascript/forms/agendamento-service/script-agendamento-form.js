import checkInputRadioParams from "./checkInputRadioParams.js";
import formatPhone from "../../utils/formatPhone.js";
import fillForm from "./fillForm.js";
import schedule from "./schedule.js";
import setupQuickSelectors from "./setupQuickSelectors.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');
setupQuickSelectors();

const form = document.querySelector('form');
fillForm(form);
schedule(form);