import Fetch from '../utils/Fetch.js';
import Hours from '../agendamento/Hours.js';

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
    const inputDate = form.querySelector('[name="data"]');
    const infoHourElement = modal.querySelector('[data-schedule-time="edit-agenda"]');
    const submitBtn = form.querySelector('[type="submit"]');

    const inputs = [inputNome, inputTelefone, inputNomePet, inputEndereco, selectServico, inputDate];
    inputs.forEach(input => {
        if(input) input.addEventListener('input', () => input.classList.remove('error'));
    });

    const minDate = new Date().toLocaleDateString('en-CA');
    if(inputDate) inputDate.setAttribute('min', minDate);

    const hours = new Hours('[data-content="edit-hours-morning"]', '[data-content="edit-hours-afternoon"]', '[data-schedule-time="edit-agenda"]');
    
    if(inputDate) {
        inputDate.addEventListener('change', (e) => {
            hours.loadByDay(e.target.value);
        });
    }

    // Limpa o erro do horário quando o usuário seleciona um botão de hora
    const hourContainers = [
        modal.querySelector('[data-content="edit-hours-morning"]'),
        modal.querySelector('[data-content="edit-hours-afternoon"]')
    ];

    hourContainers.forEach(container => {
        if (container) {
            container.addEventListener('click', (e) => {
                if (e.target.closest('.button-hour')) {
                    infoHourElement.classList.remove('text-red-500');
                    infoHourElement.classList.add('text-green-600');
                }
            });
        }
    });

    // Pega os preços para caso o admin altere o tipo de serviço
    const fetchPrecos = new Fetch('precos', '[data-modal-info="adm"]');
    let infosServiceAbout = null;

    try {
        await hours.getAgenda();
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

            if(schedule.date) {
                if(inputDate) inputDate.value = schedule.date;
                hours.loadByDay(schedule.date);
                
                setTimeout(() => {
                    const btnHour = modal.querySelector(`.button-hour[data-time-hour="${schedule.hour}"]`);
                    if(btnHour) btnHour.click();
                }, 150);
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados do agendamento:", error);
    }

    form.onsubmit = async (event) => {
        event.preventDefault();

        const selectedService = selectServico.value;
        const serviceInfo = infosServiceAbout[selectedService];
        const selectedHour = infoHourElement.getAttribute('data-time-schedule');

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
            buscarResidencia: checkboxBuscar.checked,
            date: inputDate.value,
            hour: selectedHour
        };

        let hasError = false;
        if (!updatedData.user.username) { inputNome.classList.add('error'); hasError = true; }
        if (!updatedData.user.phone) { inputTelefone.classList.add('error'); hasError = true; }
        if (!updatedData.petAgendado.name) { inputNomePet.classList.add('error'); hasError = true; }
        if (!updatedData.user.endereco) { inputEndereco.classList.add('error'); hasError = true; }
        if (!updatedData.date) { 
            inputDate.classList.add('error'); hasError = true; 
        }
        if (!updatedData.hour) { 
            infoHourElement.textContent = 'Nenhum horário selecionado';
            infoHourElement.classList.remove('text-green-600');
            infoHourElement.classList.add('text-red-500');
            hasError = true; 
        }

        if (hasError) return;

        try {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            await fetchItem.patch(id, updatedData);

            const serviceNames = {
                'banho-tosa': 'Banho e Tosa',
                'vacinacao': 'Vacinação',
                'cirurgia': 'Cirurgia'
            };

            const phoneDigits = updatedData.user.phone.replace(/\D/g, '');
            const whatsappPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;

            const [year, month, day] = updatedData.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            const serviceFriendlyName = serviceNames[updatedData.service.name] || updatedData.service.name;

            const message = [
                `*Dr.Pet - Agendamento alterado*`,
                ``,
                `Olá, *${updatedData.user.username}*! Seu agendamento foi atualizado com sucesso.`,
                ``,
                `*Detalhes do agendamento:*`,
                `Pet: *${updatedData.petAgendado.name}*`,
                `Serviço: *${serviceFriendlyName}*`,
                `Data: *${formattedDate}*`,
                `Horário: *${updatedData.hour}*`,
                `Endereço: *${updatedData.user.endereco}*`,
                `Buscar em residência: *${updatedData.buscarResidencia ? 'Sim' : 'Não'}*`,
                updatedData.service.observations ? `📝 Observações: ${updatedData.service.observations}` : '',
                ``,
                `Qualquer dúvida, entre em contato conosco! 😊`
            ].filter(Boolean).join('\n');

            const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

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