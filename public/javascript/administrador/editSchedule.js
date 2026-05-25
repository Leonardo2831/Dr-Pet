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
    const selectServico = form.querySelector('[name="servico"]');
    const inputEndereco = form.querySelector('[name="endereco"]');
    const textareaDescricao = form.querySelector('[name="descricao"]');
    const checkboxBuscar = form.querySelector('[name="buscarResidencia"]');
    const submitBtn = form.querySelector('[type="submit"]');

    const inputs = [inputNome, inputTelefone, inputNomePet, inputEndereco, selectServico];
    inputs.forEach(input => {
        if(input) input.addEventListener('input', () => input.classList.remove('error'));
    });

    // Pega os preços para caso o admin altere o tipo de serviço
    const fetchPrecos = new Fetch('precos', '[data-modal-info="adm"]');
    let infosServiceAbout = null;

    try {
        infosServiceAbout = await fetchPrecos.get() || null;
        const schedule = await fetchItem.get(id);
        
        if (schedule) {
            inputNome.value = schedule.user?.username || '';
            inputTelefone.value = schedule.user?.phone || '';
            inputEndereco.value = schedule.user?.endereco || '';
            inputNomePet.value = schedule.petAgendado?.name || '';
            
            if (schedule.service) {
                selectServico.value = schedule.service.name || 'banho-tosa';
                textareaDescricao.value = schedule.service.observations || '';
            }
            
            checkboxBuscar.checked = schedule.buscarResidencia || false;
        }
    } catch (error) {
        console.error("Erro ao carregar dados do agendamento:", error);
    }

    form.onsubmit = async (event) => {
        event.preventDefault();

        const selectedService = selectServico.value;
        const serviceInfo = infosServiceAbout[selectedService] || { time: '1h', price: 0 };

        const updatedData = {
            user: {
                username: inputNome.value.trim(),
                phone: inputTelefone.value.trim(),
                endereco: inputEndereco.value.trim()
            },
            petAgendado: {
                name: inputNomePet.value.trim()
            },
            service: {
                name: selectedService,
                observations: textareaDescricao.value.trim(),
                duration: serviceInfo.time,
                preco: serviceInfo.price
            },
            buscarResidencia: checkboxBuscar.checked
        };

        let hasError = false;
        if (!updatedData.user.username) { inputNome.classList.add('error'); hasError = true; }
        if (!updatedData.user.phone) { inputTelefone.classList.add('error'); hasError = true; }
        if (!updatedData.petAgendado.name) { inputNomePet.classList.add('error'); hasError = true; }
        if (!updatedData.user.endereco) { inputEndereco.classList.add('error'); hasError = true; }

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