import PopUp from './../utils/Pop-up.js';
import Calender from './Calender.js';
import Hours from './Hours.js';
import selectAgenda from './selectAgenda.js';
import sendDataSchedule from './sendDataSchedule.js';
import CheckLogin from '../utils/checkLogin.js';

const menuMobileHeader = new PopUp('[data-button="menuUserMobile"]', '[data-menu="header"]').init();
new CheckLogin('[data-modal="loginRequired"]').init();
const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();
selectAgenda(selectService);
const hours = new Hours('[data-content="hours-morning"]', '[data-content="hours-afternoon"]', '[data-schedule-time="agenda"]').init();
const calender = new Calender('[data-calender-title="month"]', '[data-calender-title="year"]', '[data-button="next-month"]', '[data-button="prev-month"]', '[data-container="calender-days"]', '[data-schedule-date="agenda"]', (date) => hours.loadByDay(date)).init();
sendDataSchedule();