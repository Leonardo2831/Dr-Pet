import Fetch from '../utils/Fetch.js';
import { clickOutside } from '../utils/clickOutside.js';
import CheckFunction from '../utils/CheckFunction.js';

const confirm = new CheckFunction();
const fetchItem = new Fetch('agenda', '[data-modal-info="adm"]');

/**
 * @param {string} id
 * @param {string} message - texto digitado no textarea
 * @param {HTMLTextAreaElement} textarea
 * @param {Function} closeModal
 */
async function sendMessage(id, message, textarea, closeModal) {
    try {
        const schedule = await fetchItem.get(id);

        if (schedule && schedule.user && schedule.user.phone) {
            const phone = schedule.user.phone.replace(/[()\s\-a-zA-Z]/g, '');
                    
            if (phone.length < 10) {
                fetchItem.showModalError(new Error('Telefone inválido'), 'O número da pessoa cadastrada é inválido.');
                setTimeout(() => {
                    if (fetchItem.modalInfo) {
                        fetchItem.modalInfo.classList.remove(fetchItem.classModalErro, fetchItem.classModalSucess);
                    }
                }, 2500);
                return;
            }

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
        } else {
            fetchItem.showModalError(new Error('Telefone inexistente'), 'Nenhum telefone encontrado para este usuário.');
            setTimeout(() => {
                if (fetchItem.modalInfo) {
                    fetchItem.modalInfo.classList.remove(fetchItem.classModalErro, fetchItem.classModalSucess);
                }
            }, 2500);
            return;
        }

        await fetchItem.delete(id);

        textarea.value = '';
        closeModal();
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
    }
}

export default function cancelSchedule(modal, id) {
    const textarea = modal.querySelector('[data-textarea="cancelSchedule"]');
    const buttonSend = modal.querySelector('[data-button="sendCancelSchedule"]');
    const buttonClose = modal.querySelector('[data-button="closeCancelSchedule"]');

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    buttonClose.onclick = closeModal;
    
    const innerContainer = modal.querySelector('div');
    if (innerContainer) clickOutside(innerContainer, 'click', closeModal);

    const removeError = () => textarea.classList.remove('error');
    textarea.addEventListener('click', removeError);
    textarea.addEventListener('input', removeError);

    const newButtonSend = buttonSend.cloneNode(true);
    buttonSend.parentNode.replaceChild(newButtonSend, buttonSend);

    newButtonSend.addEventListener('click', () => {
        const message = textarea.value.trim();

        if (!message) {
            textarea.classList.add('error');
            return;
        }

        confirm.open(() => sendMessage(id, message, textarea, closeModal));
    });
}