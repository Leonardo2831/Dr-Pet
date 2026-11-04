import checkInputRadioParams from "./checkInputRadioParams.js";
import formatPhone from "../../utils/formatPhone.js";
import fillForm from "./fillForm.js";
import sendFormAgendar from "./sendFormAgendar.js";
import setupQuickSelectors from "./setupQuickSelectors.js";
import setupEnderecoCEP from "../../utils/enderecoCEP.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');
setupEnderecoCEP();
setupQuickSelectors();

const form = document.querySelector('form');
fillForm(form);
sendFormAgendar(form);