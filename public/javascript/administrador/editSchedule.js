import Fetch from '../utils/Fetch.js';

export default async function editSchedule(modal, id) {
    const fetchItem = new Fetch('agenda', '[data-modal-info="adm"]');
    
    const form = modal.querySelector('[data-form="editSchedule"]');
    const buttonClose = modal.querySelector('[data-button="closeFormEditSchedule"]');

    buttonClose.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };
    
    const inputNome = form.querySelector('[name="nome"]');
    const inputTelefone = form.querySelector('[name="telefone"]');
    const inputNomePet = form.querySelector('[name="nomePet"]');
    const inputEndereco = form.querySelector('[name="endereco"]');
    const textareaDescricao = form.querySelector('[name="descricao"]');
    const checkboxBuscar = form.querySelector('[name="buscarResidencia"]');
    const submitBtn = form.querySelector('[type="submit"]');

    const inputs = [inputNome, inputTelefone, inputNomePet, inputEndereco];
    inputs.forEach(input => {
        input.addEventListener('input', () => input.classList.remove('error'));
    });

    try {
        const schedule = await fetchItem.get(id);
        
        if (schedule) {
            inputNome.value = schedule.nome || '';
            inputTelefone.value = schedule.telefone || '';
            inputNomePet.value = schedule.nomePet || '';
            inputEndereco.value = schedule.endereco || '';
            textareaDescricao.value = schedule.descricao || '';
            checkboxBuscar.checked = schedule.buscarResidencia || false;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do agendamento:", error);
    }

    form.onsubmit = async (event) => {
        event.preventDefault();

        const updatedData = {
            nome: inputNome.value.trim(),
            telefone: inputTelefone.value.trim(),
            nomePet: inputNomePet.value.trim(),
            endereco: inputEndereco.value.trim(),
            descricao: textareaDescricao.value.trim(),
            buscarResidencia: checkboxBuscar.checked
        };

        let hasError = false;
        if (!updatedData.nome) { inputNome.classList.add('error'); hasError = true; }
        if (!updatedData.telefone) { inputTelefone.classList.add('error'); hasError = true; }
        if (!updatedData.nomePet) { inputNomePet.classList.add('error'); hasError = true; }
        if (!updatedData.endereco) { inputEndereco.classList.add('error'); hasError = true; }

        if (hasError) return;

        try {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            await fetchItem.patch(id, updatedData);

            modal.classList.add('hidden');
            modal.classList.remove('flex');
            
        } catch (error) {
            console.error("Erro ao atualizar o agendamento:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    };
}