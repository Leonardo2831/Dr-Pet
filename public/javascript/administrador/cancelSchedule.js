import Fetch from '../utils/Fetch.js';

export default function cancelSchedule(modal, id) {
    const fetchItem = new Fetch('agenda', '[data-modal-info="adm"]');
    
    const textarea = modal.querySelector('[data-textarea="cancelSchedule"]');
    const buttonSend = modal.querySelector('[data-button="sendCancelSchedule"]');
    const buttonClose = modal.querySelector('[data-button="closeCancelSchedule"]');

    buttonClose.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    const removeError = () => textarea.classList.remove('error');
    textarea.addEventListener('click', removeError);
    textarea.addEventListener('input', removeError);

    const newButtonSend = buttonSend.cloneNode(true);
    buttonSend.parentNode.replaceChild(newButtonSend, buttonSend);

    newButtonSend.addEventListener('click', async () => {
        const message = textarea.value.trim();

        if (!message) {
            textarea.classList.add('error');
            return;
        }

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
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
        }
    });
}