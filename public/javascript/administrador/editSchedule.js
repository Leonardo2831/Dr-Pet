import Fetch from '../utils/Fetch.js';
import Hours from '../agendamento/Hours.js';
import { clickOutside } from '../utils/clickOutside.js';
import toContactWhatsapp from '../utils/toContactWhatsapp.js';
import formatPhone, { applyPhoneMask } from '../utils/formatPhone.js';

let editQuill = null;

function formatDateBR(dateStr) {
    if (!dateStr) return "Data não informada";
    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
    if (!dateStr.includes("-")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function normalizeDateInput(val) {
    if (!val) return "";
    let str = String(val).trim();
    if (str.includes("T")) str = str.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split("/");
        return `${y}-${m}-${d}`;
    }
    try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    } catch (_) {}
    return str;
}

export default async function editSchedule(modal, id, scheduleObj = null) {
    if (!modal) return;

    const fetchEditar = new Fetch('administrador/agenda/editar', '[data-modal-info="adm"]');
    const fetchDados = new Fetch(`administrador/agenda/${id}`, '[data-modal-info="adm"]');

    const form = modal.querySelector('[data-form="editSchedule"]');
    const buttonClose = modal.querySelector('[data-button="closeFormEditSchedule"]');
    const submitBtn = form.querySelector('[type="submit"]');
    const submitBtnText = modal.querySelector('[data-button-text="saveEditSchedule"]');
    const loadingOverlay = modal.querySelector('[data-loading-edit]');

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.classList.remove('flex');
        }
    };

    buttonClose.onclick = closeModal;
    if (form) clickOutside(form, 'click', closeModal);

    const inputNome = form.querySelector('[name="nome"]');
    const inputTelefone = form.querySelector('[name="telefone"]');
    const inputNomePet = form.querySelector('[name="nomePet"]');
    const selectServico = form.querySelector('[name="servico"]');
    const inputEndereco = form.querySelector('[name="endereco"]');
    const textareaDescricao = form.querySelector('[name="descricao"]');
    const checkboxBuscar = form.querySelector('[name="buscarResidencia"]');
    const inputDate = form.querySelector('[name="data"]');
    const textareaMotivo = form.querySelector('[name="motivoAtualizacao"]');
    const inputEmail = modal.querySelector('[data-input="editScheduleEmail"]');
    const inputSubject = modal.querySelector('[data-input="editScheduleSubject"]');
    const editorContainer = modal.querySelector('[data-quill-editor="editScheduleEmail"]');
    const infoHourElement = modal.querySelector('[data-schedule-time="edit-agenda"]');

    if (inputTelefone) {
        formatPhone(inputTelefone);
    }

    const inputs = [inputNome, inputTelefone, inputNomePet, inputEndereco, selectServico, inputDate, textareaMotivo, inputEmail];
    inputs.forEach(input => {
        if (input) input.addEventListener('input', () => input.classList.remove('error'));
    });

    const minDate = new Date().toLocaleDateString('en-CA');
    if (inputDate) inputDate.setAttribute('min', minDate);

    const hours = new Hours('[data-content="edit-hours-morning"]', '[data-content="edit-hours-afternoon"]', '[data-schedule-time="edit-agenda"]');
    hours.setIgnoredAppointment(id);
    hours.loadServerData();

    hours.setServiceSelectorCallback(() => {
        return selectServico ? selectServico.value : null;
    });

    if (selectServico) {
        selectServico.onchange = () => {
            if (hours.currentDay) {
                hours.renderHours();
            }
            updateQuillTemplate();
        };
    }

    if (inputDate) {
        inputDate.onchange = (e) => {
            hours.loadByDay(e.target.value);
            updateQuillTemplate();
        };
    }

    const hourContainers = [
        modal.querySelector('[data-content="edit-hours-morning"]'),
        modal.querySelector('[data-content="edit-hours-afternoon"]')
    ];

    hourContainers.forEach(container => {
        if (container) {
            container.onclick = (e) => {
                if (e.target.closest('.button-hour')) {
                    infoHourElement.classList.remove('text-red-500');
                    infoHourElement.classList.add('text-green-600');
                    setTimeout(updateQuillTemplate, 100);
                }
            };
        }
    });

    // Inicializa Quill se necessário
    if (window.Quill && editorContainer && !editQuill) {
        editQuill = new Quill(editorContainer, {
            theme: 'snow',
            placeholder: 'Mensagem que o cliente receberá com os detalhes do agendamento atualizado...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean']
                ]
            }
        });
        const maxQuillLength = 800;
        editQuill.on('text-change', () => {
            if (editQuill.getLength() > maxQuillLength) {
                editQuill.deleteText(maxQuillLength, editQuill.getLength());
            }
        });
    }

    function updateQuillTemplate() {
        if (!editQuill) return;

        const nome = inputNome && inputNome.value.trim() ? inputNome.value.trim() : 'Cliente';
        const pet = inputNomePet && inputNomePet.value.trim() ? inputNomePet.value.trim() : 'seu pet';
        const dataStr = inputDate && inputDate.value ? formatDateBR(inputDate.value) : 'Data a definir';
        const horaStr = infoHourElement ? (infoHourElement.getAttribute('data-time-schedule') || infoHourElement.textContent.trim()) : '';
        const servicoNome = selectServico && selectServico.selectedOptions[0] && selectServico.value
            ? selectServico.selectedOptions[0].textContent.trim()
            : 'Serviço Veterinário';
        const buscarStr = checkboxBuscar && checkboxBuscar.checked ? 'Sim (Translado na residência pela Dr.Pet)' : 'Atendimento presencial na clínica';
        const motivo = textareaMotivo && textareaMotivo.value.trim() ? textareaMotivo.value.trim() : '';

        let html = `
            <p>Olá, <strong>${nome}</strong>!</p>
            <p>Informamos que o agendamento para o pet <strong>${pet}</strong> na <strong>Dr.Pet</strong> foi <strong>atualizado</strong>.</p>
        `;

        if (motivo) {
            html += `<p><strong>Motivo da alteração:</strong> ${motivo}</p>`;
        }

        html += `
            <p><strong>Detalhes Atualizados do Atendimento:</strong></p>
            <ul>
                <li><strong>Serviço:</strong> ${servicoNome}</li>
                <li><strong>Data:</strong> ${dataStr}</li>
                <li><strong>Horário:</strong> ${horaStr || 'Horário combinado'}</li>
                <li><strong>Pet:</strong> ${pet}</li>
                <li><strong>Transporte:</strong> ${buscarStr}</li>
            </ul>
            <p>Caso tenha qualquer dúvida ou necessite de novo ajuste, entre em contato conosco respondendo a esta mensagem ou via WhatsApp.</p>
            <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
        `;

        editQuill.root.innerHTML = html.trim();
    }

    if (inputNome) inputNome.oninput = updateQuillTemplate;
    if (inputNomePet) inputNomePet.oninput = updateQuillTemplate;
    if (checkboxBuscar) checkboxBuscar.onchange = updateQuillTemplate;
    if (textareaMotivo) textareaMotivo.oninput = updateQuillTemplate;

    function populateFields(schedule) {
        if (!schedule) return;

        const clientName = schedule.nome || schedule.user?.username || schedule.usuario?.nome || schedule.agenda?.nome || '';
        const rawPhone = schedule.telefone || schedule.user?.phone || schedule.usuario?.telefone || schedule.agenda?.telefone || '';
        const address = schedule.endereco || schedule.user?.endereco || schedule.agenda?.endereco || '';
        const petName = schedule.nomePet || schedule.petAgendado?.name || schedule.agenda?.nomePet || '';
        const email = schedule.email || schedule.usuario?.email || schedule.user?.email || '';
        const observation = schedule.observation || schedule.service?.observations || schedule.agenda?.observation || '';
        const buscar = Boolean(schedule.buscarResidencia ?? schedule.agenda?.buscarResidencia);

        if (inputNome) inputNome.value = clientName;
        if (inputTelefone) inputTelefone.value = applyPhoneMask(rawPhone);
        if (inputEndereco) inputEndereco.value = address;
        if (inputNomePet) inputNomePet.value = petName;
        if (inputEmail) inputEmail.value = email;
        if (textareaDescricao) textareaDescricao.value = observation;
        if (checkboxBuscar) checkboxBuscar.checked = buscar;
        if (textareaMotivo) textareaMotivo.value = '';

        // Seleciona o serviço antigo (por ID ou por nome)
        const servicoId = schedule.fk_service || schedule.service?.id || schedule.agenda?.fk_service || '';
        const servicoNome = (schedule.service?.nome || schedule.service?.name || schedule.service_infos?.nome || '').toLowerCase().trim();
        if (selectServico) {
            if (servicoId && Array.from(selectServico.options).some(opt => String(opt.value) === String(servicoId))) {
                selectServico.value = String(servicoId);
            } else if (servicoNome) {
                const matchedOpt = Array.from(selectServico.options).find(
                    opt => opt.textContent.trim().toLowerCase() === servicoNome
                );
                if (matchedOpt) selectServico.value = matchedOpt.value;
            }
        }

        // Data e Horário antigos
        const dateClean = normalizeDateInput(schedule.date || schedule.dateAgendamento || schedule.agenda?.dateAgendamento);
        const hourRaw = schedule.hour || schedule.hourAgendamento || schedule.agenda?.hourAgendamento || '';
        const hourClean = hourRaw ? String(hourRaw).slice(0, 5) : '';

        if (dateClean && inputDate) {
            inputDate.value = dateClean;
            try {
                hours.loadByDay(dateClean);
            } catch (e) {
                console.error("Erro ao renderizar horários do dia:", e);
            }
        }

        if (hourClean) {
            if (infoHourElement) {
                infoHourElement.textContent = hourClean;
                infoHourElement.setAttribute('data-time-schedule', hourClean);
                infoHourElement.classList.remove('text-red-500');
                infoHourElement.classList.add('text-green-600');
            }
            setTimeout(() => {
                const btnHour = modal.querySelector(`.button-hour[data-time-hour="${hourClean}"]`);
                if (btnHour) {
                    btnHour.click();
                } else if (infoHourElement) {
                    infoHourElement.textContent = hourClean;
                    infoHourElement.setAttribute('data-time-schedule', hourClean);
                    infoHourElement.classList.add('text-green-600');
                }
                updateQuillTemplate();
            }, 150);
        }

        if (inputSubject) {
            inputSubject.value = `Dr.Pet - Seu agendamento foi atualizado (${petName || 'Pet'})`;
        }

        updateQuillTemplate();
    }

    // 1. Tenta preencher imediatamente com o objeto passado ou dos dados iniciais na memória
    let schedule = scheduleObj;
    if (!schedule && window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
        schedule = window.initialAgendamentos.find((a) => String(a.id) === String(id));
    }

    if (schedule) {
        populateFields(schedule);
    }

    // 2. Caso algum dado esteja faltando ou não estivesse na memória, busca do backend
    if (!schedule || (!schedule.email && !schedule.usuario?.email)) {
        try {
            const remoteSchedule = await fetchDados.get();
            if (remoteSchedule && !remoteSchedule.erro) {
                populateFields(remoteSchedule);
            }
        } catch (error) {
            console.error("Erro ao buscar dados complementares do agendamento:", error);
        }
    }

    form.onsubmit = async (event) => {
        event.preventDefault();

        const selectedServiceId = selectServico ? selectServico.value : '';
        const selectedHour = infoHourElement ? (infoHourElement.getAttribute('data-time-schedule') || infoHourElement.textContent.trim()) : '';
        const destEmail = inputEmail ? inputEmail.value.trim() : '';
        const destPhone = inputTelefone ? inputTelefone.value.trim() : '';
        const subject = inputSubject ? inputSubject.value.trim() : 'Dr.Pet - Agendamento Atualizado';
        const messageHtml = editQuill ? editQuill.root.innerHTML : '';
        const messageText = editQuill ? editQuill.getText().trim() : '';

        let hasError = false;
        if (!inputNome.value.trim()) { inputNome.classList.add('error'); hasError = true; }
        if (!destPhone) { inputTelefone.classList.add('error'); hasError = true; }
        if (!inputNomePet.value.trim()) { inputNomePet.classList.add('error'); hasError = true; }
        if (!inputEndereco.value.trim()) { inputEndereco.classList.add('error'); hasError = true; }
        if (!inputDate.value) { inputDate.classList.add('error'); hasError = true; }
        if (!selectedHour || selectedHour === 'Nenhum horário selecionado') {
            infoHourElement.textContent = 'Selecione um horário';
            infoHourElement.classList.remove('text-green-600');
            infoHourElement.classList.add('text-red-500');
            hasError = true;
        }

        if (hasError) return;

        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('flex');
        }

        submitBtn.disabled = true;
        if (submitBtnText) submitBtnText.textContent = "Salvando e notificando...";

        try {
            const updatedData = {
                id: Number(id) || id,
                nome: inputNome.value.trim(),
                telefone: destPhone,
                email: destEmail,
                to: destEmail,
                nomePet: inputNomePet.value.trim(),
                serviceId: selectedServiceId,
                date: inputDate.value,
                hour: selectedHour,
                endereco: inputEndereco.value.trim(),
                descricao: textareaDescricao ? textareaDescricao.value.trim() : '',
                buscarResidencia: checkboxBuscar ? checkboxBuscar.checked : false,
                motivoAtualizacao: textareaMotivo ? textareaMotivo.value.trim() : '',
                subject: subject,
                assunto: subject,
                mensagemHtml: messageHtml,
                html: messageHtml,
                mensagemTexto: messageText
            };

            await fetchEditar.post({ ...updatedData, payload: updatedData });

            // Abre WhatsApp com todas as informações atualizadas
            toContactWhatsapp(destPhone, messageHtml || messageText);

            closeModal();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Erro ao atualizar o agendamento:", error);
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                loadingOverlay.classList.remove('flex');
            }
            submitBtn.disabled = false;
            if (submitBtnText) submitBtnText.textContent = "Salvar Alterações e Notificar";
        }
    };
}
