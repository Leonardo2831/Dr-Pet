import checkInputRadioParams from "./checkInputRadioParams.js";
import formatPhone from "../../utils/formatPhone.js";
import CheckLogin from "../../utils/checkLogin.js";
import Storage from "../../utils/Storage.js";
import Fetch from "../../utils/Fetch.js";
import fillForm from "./fillForm.js";
import schedule from "./schedule.js";

checkInputRadioParams();
formatPhone('[data-input="formatPhone"]');
new CheckLogin('[data-modal="loginRequired"]').init();

const form = document.querySelector('form');
const fetchPrice = new Fetch('service-infos', '[data-modal-info="formSchedule"]');
const infosSchedule = Storage.get('scheduleData');
const infosServiceAbout = await fetchPrice.get() || null;

fillForm(form);
schedule(form, infosSchedule, infosServiceAbout);