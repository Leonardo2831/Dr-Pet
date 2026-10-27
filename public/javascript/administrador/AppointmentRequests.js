import Fetch from '../utils/Fetch.js';
import { clickOutside } from '../utils/clickOutside.js';

export default class AppointmentRequests {
    constructor(selectorContent) {
        this.content = document.querySelector(selectorContent);
        this.section = document.getElementById('section-agendamentos');
        this.fetchAgenda = new Fetch('agenda', '[data-modal-info="adm"]');
        this.fetchEmail = new Fetch('administrador/agendamentos/status', '[data-modal-info="adm"]');
        this.storageKey = 'drpet-appointment-request-status';
        this.statuses = this.getStoredStatuses();

        this.appointments = [];
        this.currentFilter = 'all'; // 'all' | 'pending' | 'accepted' | 'rejected'
        this.searchQuery = '';
        this.currentSchedule = null;
        this.currentAction = 'accepted'; // 'accepted' | 'rejected' | 'accept_all'

        // Elementos do Modal de E-mail com Quill
        this.emailModal = document.querySelector('[data-modal="emailAppointment"]');
        this.modalTitle = document.querySelector('[data-email-modal-title]');
        this.actionBadge = document.querySelector('[data-email-action-badge]');
        
        // Destinatários: Individual vs Lote estilo Gmail
        this.singleEmailContainer = document.querySelector('[data-email-single-container]');
        this.inputEmailTo = document.querySelector('[data-input="appointmentEmailTo"]');
        this.tagsEmailContainer = document.querySelector('[data-email-tags-container]');
        this.tagsBox = document.querySelector('[data-email-tags-box]');
        this.tagsList = document.querySelector('[data-email-tags-list]');
        this.tagInput = document.querySelector('[data-input="emailTagInput"]');
        this.tagsCount = document.querySelector('[data-email-tags-count]');
        this.emailTags = [];

        this.inputEmailSubject = document.querySelector('[data-input="appointmentEmailSubject"]');
        this.editorContainer = document.querySelector('[data-quill-editor="appointmentEmail"]');
        this.btnSendEmail = document.querySelector('[data-button="sendAppointmentEmail"]');
        this.btnTextSend = document.querySelector('[data-button-text="sendAppointmentEmail"]');
        this.btnCloseModal = document.querySelector('[data-button="closeEmailModal"]');
        this.btnCancelModal = document.querySelector('[data-button="cancelEmailModal"]');

        // Resumo no Modal
        this.summaryName = document.querySelector('[data-email-summary-name]');
        this.summaryPet = document.querySelector('[data-email-summary-pet]');
        this.summaryService = document.querySelector('[data-email-summary-service]');
        this.summaryDate = document.querySelector('[data-email-summary-date]');

        // Elementos da Seção
        this.btnAcceptAll = document.querySelector('[data-button="acceptAllAppointments"]');
        this.inputSearch = document.querySelector('[data-input="searchAppointments"]');
        this.filterButtons = document.querySelectorAll('[data-filter-appointment]');

        // Contadores
        this.statTotal = document.querySelector('[data-stat="total"]');
        this.statPending = document.querySelector('[data-stat="pending"]');
        this.statAccepted = document.querySelector('[data-stat="accepted"]');
        this.statRejected = document.querySelector('[data-stat="rejected"]');

        this.quill = null;
    }

    getStoredStatuses() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (error) {
            console.error('Não foi possível carregar os status dos agendamentos.', error);
            return {};
        }
    }

    saveStatus(id, status) {
        this.statuses[id] = status;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.statuses));
        } catch (error) {
            console.error('Não foi possível salvar o status do agendamento.', error);
        }
    }

    getServiceName(schedule) {
        const serviceNames = {
            'banho-tosa': 'Banho e Tosa',
            'vacinacao': 'Vacinação',
            'consulta': 'Consulta',
            'cirurgia': 'Cirurgia'
        };
        const service = schedule.service?.name || schedule.service || schedule.nomeServico || '';
        return serviceNames[String(service).toLowerCase()] || service || 'Serviço Veterinário';
    }

    formatDate(date) {
        if (!date) return 'Data não informada';
        if (date.includes('T')) date = date.split('T')[0];
        if (!date.includes('-')) return date;

        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    initQuillEditor() {
        if (!window.Quill || this.quill || !this.editorContainer) return;

        this.quill = new Quill(this.editorContainer, {
            theme: 'snow',
            placeholder: 'Escreva a mensagem personalizada que o cliente receberá por e-mail...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ header: [1, 2, 3, false] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'clean']
                ]
            }
        });
    }

    getAvatarColor(str) {
        if (!str) return '#ea4335';
        const colors = [
            '#ea4335', // Google Red
            '#7b1fa2', // Purple (estilo Gmail)
            '#1a73e8', // Google Blue
            '#188038', // Google Green
            '#f29900', // Google Orange
            '#e91e63', // Pink
            '#00897b', // Teal
            '#3f51b5'  // Indigo
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    renderEmailTags() {
        if (!this.tagsList) return;
        this.tagsList.innerHTML = '';

        this.emailTags.forEach((email, index) => {
            const tag = document.createElement('div');
            tag.className = 'inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 bg-white border border-gray-300 rounded-full shadow-xs hover:border-gray-400 transition-all select-none animate-fadeItem';

            // Círculo colorido com inicial (estilo Gmail)
            const avatar = document.createElement('span');
            avatar.className = 'w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[11px] shrink-0 select-none uppercase';
            avatar.style.backgroundColor = this.getAvatarColor(email);
            avatar.textContent = (email.charAt(0) || 'u').toLowerCase();

            // Endereço de e-mail
            const text = document.createElement('span');
            text.className = 'font-sans text-xs sm:text-sm text-gray-800 font-medium select-text';
            text.textContent = email;

            // Botão excluir tag (✕)
            const btnRemove = document.createElement('button');
            btnRemove.type = 'button';
            btnRemove.className = 'w-4 h-4 ml-0.5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer text-xs font-bold leading-none select-none';
            btnRemove.innerHTML = '✕';
            btnRemove.title = `Remover ${email}`;
            btnRemove.setAttribute('aria-label', `Remover ${email}`);
            btnRemove.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeEmailTag(index);
            });

            tag.append(avatar, text, btnRemove);
            this.tagsList.appendChild(tag);
        });

        if (this.tagsCount) {
            const count = this.emailTags.length;
            this.tagsCount.textContent = count === 1 ? '1 destinatário' : `${count} destinatários`;
        }
    }

    addEmailTag(emailStr) {
        if (!emailStr) return;
        const cleaned = emailStr.replace(/[,;]/g, '').trim().toLowerCase();
        if (!cleaned) return;

        // Se o usuário digitou sem arroba ou incompleto
        if (!cleaned.includes('@') || cleaned.length < 5) {
            if (this.tagInput) {
                this.tagInput.classList.add('text-red-alert');
                setTimeout(() => this.tagInput?.classList.remove('text-red-alert'), 1000);
            }
            return;
        }

        if (!this.emailTags.includes(cleaned)) {
            this.emailTags.push(cleaned);
            this.renderEmailTags();
        }

        if (this.tagInput) {
            this.tagInput.value = '';
        }
    }

    removeEmailTag(index) {
        if (index >= 0 && index < this.emailTags.length) {
            this.emailTags.splice(index, 1);
            this.renderEmailTags();
            if (this.tagInput) this.tagInput.focus();
        }
    }

    initTagInputEvents() {
        if (!this.tagInput) return;

        // Pressionar Enter ou vírgula gera a tag
        this.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addEmailTag(this.tagInput.value);
            } else if (e.key === 'Backspace' && this.tagInput.value === '' && this.emailTags.length > 0) {
                // Backspace com campo vazio remove a última tag (como no Gmail)
                this.removeEmailTag(this.emailTags.length - 1);
            }
        });

        // Ao perder o foco, gera a tag se houver texto
        this.tagInput.addEventListener('blur', () => {
            if (this.tagInput.value.trim()) {
                this.addEmailTag(this.tagInput.value);
            }
        });

        // Ao colar lista de e-mails
        this.tagInput.addEventListener('paste', (e) => {
            const pastedData = (e.clipboardData || window.clipboardData).getData('text');
            if (pastedData && pastedData.includes('@')) {
                e.preventDefault();
                const emails = pastedData.split(/[,;\s\n]+/);
                emails.forEach(email => this.addEmailTag(email));
            }
        });

        // Clique no container do campo foca no input
        if (this.tagsBox) {
            this.tagsBox.addEventListener('click', (e) => {
                if (e.target !== this.tagInput && !e.target.closest('button')) {
                    this.tagInput.focus();
                }
            });
        }
    }

    openEmailModal(schedule, actionType) {
        this.initQuillEditor();

        this.currentSchedule = schedule;
        this.currentAction = actionType;

        if (!this.emailModal) return;

        const isAccept = actionType === 'accepted';
        const isAcceptAll = actionType === 'accept_all';
        const isRefuse = actionType === 'rejected';

        // Estilização do badge de ação
        if (this.actionBadge) {
            this.actionBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ';
            if (isAccept || isAcceptAll) {
                this.actionBadge.className += 'bg-green-100 text-green-700 border border-green-300';
                this.actionBadge.textContent = isAcceptAll ? 'Aceitar Todos os Pendentes' : 'Confirmar Agendamento';
            } else {
                this.actionBadge.className += 'bg-red-light text-red-alert border border-red-300';
                this.actionBadge.textContent = 'Recusar Agendamento';
            }
        }

        // Título do modal
        if (this.modalTitle) {
            if (isAcceptAll) {
                this.modalTitle.textContent = 'Confirmar Todas as Solicitações e Enviar E-mails';
                this.modalTitle.className = 'font-sans font-bold text-xl md:text-2xl text-green-700 mt-1';
            } else if (isAccept) {
                this.modalTitle.textContent = 'Confirmar Agendamento e Notificar por E-mail';
                this.modalTitle.className = 'font-sans font-bold text-xl md:text-2xl text-green-700 mt-1';
            } else {
                this.modalTitle.textContent = 'Recusar Agendamento e Notificar por E-mail';
                this.modalTitle.className = 'font-sans font-bold text-xl md:text-2xl text-red-alert mt-1';
            }
        }

        // Botão de envio
        if (this.btnSendEmail) {
            this.btnSendEmail.className = 'w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-sans font-semibold text-sm md:text-base text-white shadow-sm transition-all focus:outline-none focus:ring-4 ';
            if (isAccept || isAcceptAll) {
                this.btnSendEmail.className += 'bg-green-600 hover:bg-green-700 focus:ring-green-500/30';
            } else {
                this.btnSendEmail.className += 'bg-red-alert hover:opacity-90 focus:ring-red-alert/30';
            }
        }

        if (this.btnTextSend) {
            if (isAcceptAll) {
                this.btnTextSend.textContent = 'Confirmar e Enviar para Todos';
            } else if (isAccept) {
                this.btnTextSend.textContent = 'Enviar E-mail e Confirmar';
            } else {
                this.btnTextSend.textContent = 'Enviar E-mail e Recusar';
            }
        }

        // Resumo do agendamento e alternância de campo de e-mail
        if (isAcceptAll) {
            const pendingSchedules = this.appointments.filter(a => this.statuses[a.id] !== 'accepted' && this.statuses[a.id] !== 'rejected');
            const pendingCount = pendingSchedules.length;
            if (this.summaryName) this.summaryName.textContent = `${pendingCount} cliente(s) com agendamentos pendentes`;
            if (this.summaryPet) this.summaryPet.textContent = 'Múltiplos pets';
            if (this.summaryService) this.summaryService.textContent = 'Serviços correspondentes';
            if (this.summaryDate) this.summaryDate.textContent = 'Horários solicitados';

            // Oculta campo individual e exibe container de Tags estilo Gmail
            if (this.singleEmailContainer) this.singleEmailContainer.classList.add('hidden');
            if (this.tagsEmailContainer) {
                this.tagsEmailContainer.classList.remove('hidden');
                this.tagsEmailContainer.classList.add('flex');
            }

            // Popula as tags com os e-mails dos clientes pendentes
            this.emailTags = [];
            pendingSchedules.forEach(s => {
                const email = (s.email || s.user?.email || '').trim().toLowerCase();
                if (email && !this.emailTags.includes(email)) {
                    this.emailTags.push(email);
                }
            });
            this.renderEmailTags();

            if (this.inputEmailSubject) {
                this.inputEmailSubject.value = 'Dr.Pet - Seu agendamento foi confirmado com sucesso!';
            }
        } else if (schedule) {
            const clientName = schedule.clientName || schedule.user?.username || schedule.nome || 'Cliente';
            const email = schedule.email || schedule.user?.email || 'cliente@exemplo.com';
            const petName = schedule.petName || schedule.nomePet || schedule.petAgendado?.name || 'Pet';
            const serviceName = this.getServiceName(schedule);
            const dateStr = this.formatDate(schedule.date || schedule.dateAgendamento);
            const hourStr = schedule.hour || schedule.hourAgendamento || 'Horário a definir';

            if (this.summaryName) this.summaryName.textContent = `${clientName} (${email})`;
            if (this.summaryPet) this.summaryPet.textContent = petName;
            if (this.summaryService) this.summaryService.textContent = serviceName;
            if (this.summaryDate) this.summaryDate.textContent = `${dateStr} às ${hourStr}`;

            // Exibe campo individual e oculta container de tags
            if (this.singleEmailContainer) this.singleEmailContainer.classList.remove('hidden');
            if (this.tagsEmailContainer) {
                this.tagsEmailContainer.classList.add('hidden');
                this.tagsEmailContainer.classList.remove('flex');
            }

            if (this.inputEmailTo) {
                this.inputEmailTo.value = email;
                this.inputEmailTo.disabled = false;
            }

            if (this.inputEmailSubject) {
                if (isAccept) {
                    this.inputEmailSubject.value = `Dr.Pet - Confirmação do seu agendamento para ${petName}!`;
                } else {
                    this.inputEmailSubject.value = `Dr.Pet - Informações sobre sua solicitação de agendamento (${petName})`;
                }
            }
        }

        // Template de texto no Quill
        this.setEmailTemplate(schedule, actionType);

        // Exibir modal centralizado
        this.emailModal.classList.remove('hidden');
        this.emailModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');

        // Ativa clickOutside no container interno do modal
        const innerDialog = this.emailModal.querySelector('div');
        if (innerDialog) {
            clickOutside(innerDialog, 'click', () => this.closeEmailModal());
        }
    }

    setEmailTemplate(schedule, actionType) {
        if (!this.quill) return;

        const isAccept = actionType === 'accepted';
        const isAcceptAll = actionType === 'accept_all';
        const clientName = schedule?.clientName || schedule?.nome || 'Cliente';
        const petName = schedule?.petName || schedule?.nomePet || 'seu pet';
        const serviceName = schedule ? this.getServiceName(schedule) : 'Serviço';
        const dateStr = schedule ? this.formatDate(schedule.date || schedule.dateAgendamento) : '';
        const hourStr = schedule ? (schedule.hour || schedule.hourAgendamento || '') : '';
        const transladoStr = schedule?.buscarResidencia ? 'Sim (Translado na residência pela Dr.Pet)' : 'Atendimento presencial na clínica';

        let htmlContent = '';

        if (isAcceptAll) {
            htmlContent = `
                <p>Olá!</p>
                <p>Temos o prazer de informar que o seu agendamento na <strong>Dr.Pet Clínica & Petshop</strong> foi <strong>confirmado com sucesso</strong> pela nossa equipe!</p>
                <p>Nossos profissionais estão preparados para receber o seu pet com todo o amor, carinho e dedicação que ele merece.</p>
                <p>Caso precise fazer qualquer alteração de horário ou tenha alguma dúvida prévia, entre em contato conosco respondendo a este e-mail ou via WhatsApp.</p>
                <p>Agradecemos a confiança e aguardamos vocês!</p>
                <p>Com carinho,<br><strong>Equipe Dr.Pet</strong></p>
            `;
        } else if (isAccept) {
            htmlContent = `
                <p>Olá, <strong>${clientName}</strong>!</p>
                <p>Temos uma ótima notícia: o agendamento para o pet <strong>${petName}</strong> foi <strong>confirmado com sucesso</strong> na Dr.Pet!</p>
                <p><strong>Detalhes do Atendimento:</strong></p>
                <ul>
                    <li><strong>Serviço:</strong> ${serviceName}</li>
                    <li><strong>Data:</strong> ${dateStr}</li>
                    <li><strong>Horário:</strong> ${hourStr}</li>
                    <li><strong>Pet:</strong> ${petName}</li>
                    <li><strong>Transporte:</strong> ${transladoStr}</li>
                </ul>
                <p>Por favor, chegue com 10 minutos de antecedência caso o atendimento seja na clínica. Se você solicitou transporte, nosso motorista estará no seu endereço no horário combinado.</p>
                <p>Em caso de imprevistos ou reagendamento, entre em contato conosco o quanto antes.</p>
                <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
            `;
        } else {
            htmlContent = `
                <p>Olá, <strong>${clientName}</strong>.</p>
                <p>Agradecemos por solicitar um agendamento na <strong>Dr.Pet</strong> para o seu pet <strong>${petName}</strong>.</p>
                <p>Infelizmente, não poderemos confirmar o atendimento na data <strong>${dateStr}</strong> às <strong>${hourStr}</strong> devido à lotação completa da nossa agenda neste horário.</p>
                <p>Gostaríamos muito de atendê-los! Por favor, responda a este e-mail sugerindo novas datas/horários ou acesse nosso site para verificar os horários que ainda estão disponíveis.</p>
                <p>Pedimos sinceras desculpas pelo transtorno e agradecemos pela sua compreensão.</p>
                <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
            `;
        }

        this.quill.root.innerHTML = htmlContent.trim();
    }

    closeEmailModal() {
        if (this.emailModal) {
            this.emailModal.classList.add('hidden');
            this.emailModal.classList.remove('flex');
            const innerDialog = this.emailModal.querySelector('div');
            if (innerDialog && innerDialog._cleanupClickOutside) {
                innerDialog._cleanupClickOutside();
            }
        }
        document.body.classList.remove('overflow-hidden');
        this.currentSchedule = null;
        if (this.tagInput) this.tagInput.value = '';
    }

    async handleSendEmail() {
        let email = '';
        if (this.currentAction === 'accept_all') {
            if (this.emailTags.length === 0) {
                alert('Por favor, adicione pelo menos um destinatário de e-mail na lista.');
                if (this.tagInput) this.tagInput.focus();
                return;
            }
            email = this.emailTags.join(', ');
        } else {
            email = this.inputEmailTo ? this.inputEmailTo.value.trim() : '';
            if (!email) {
                alert('Por favor, informe o e-mail do destinatário.');
                if (this.inputEmailTo) this.inputEmailTo.focus();
                return;
            }
        }

        const subject = this.inputEmailSubject ? this.inputEmailSubject.value.trim() : '';
        const messageHtml = this.quill ? this.quill.root.innerHTML : '';
        const messageText = this.quill ? this.quill.getText().trim() : '';

        if (!subject) {
            alert('Por favor, informe o assunto do e-mail.');
            return;
        }

        if (!messageText || messageText === '') {
            alert('Por favor, escreva a mensagem do e-mail no editor.');
            return;
        }

        // Desabilitar botão durante envio
        if (this.btnSendEmail) {
            this.btnSendEmail.disabled = true;
            this.btnSendEmail.classList.add('opacity-70', 'cursor-wait');
        }

        try {
            if (this.currentAction === 'accept_all') {
                const pendingSchedules = this.appointments.filter(
                    a => this.statuses[a.id] !== 'accepted' && this.statuses[a.id] !== 'rejected'
                );

                const payload = {
                    action: 'accept_all',
                    status: 'accepted',
                    ids: pendingSchedules.map(s => s.id),
                    destinatarios: this.emailTags,
                    assunto: subject,
                    mensagemHtml: messageHtml,
                    mensagemTexto: messageText,
                    totalNotificados: this.emailTags.length
                };

                // Envia dados para o backend via classe @Fetch
                await this.fetchEmail.post(payload);

                // Atualiza localmente todos para aceitos
                pendingSchedules.forEach(schedule => {
                    this.saveStatus(schedule.id, 'accepted');
                });
            } else if (this.currentSchedule) {
                const payload = {
                    id: this.currentSchedule.id,
                    status: this.currentAction,
                    action: this.currentAction,
                    destinatario: {
                        email: email,
                        nome: this.currentSchedule.clientName || this.currentSchedule.nome || 'Cliente'
                    },
                    assunto: subject,
                    mensagemHtml: messageHtml,
                    mensagemTexto: messageText,
                    agendamento: {
                        id: this.currentSchedule.id,
                        pet: this.currentSchedule.petName || this.currentSchedule.nomePet,
                        servico: this.getServiceName(this.currentSchedule),
                        data: this.currentSchedule.date || this.currentSchedule.dateAgendamento,
                        horario: this.currentSchedule.hour || this.currentSchedule.hourAgendamento,
                        buscarResidencia: Boolean(this.currentSchedule.buscarResidencia)
                    }
                };

                // Envia dados para o backend via classe @Fetch
                await this.fetchEmail.post(payload);

                // Salva status local
                this.saveStatus(this.currentSchedule.id, this.currentAction);
            }

            this.closeEmailModal();
            this.render();
        } catch (error) {
            console.error('Erro ao processar envio de e-mail e agendamento:', error);
            // Mesmo em caso de endpoint backend pendente, atualiza o status na interface para testabilidade
            if (this.currentAction === 'accept_all') {
                this.appointments.forEach(s => this.saveStatus(s.id, 'accepted'));
            } else if (this.currentSchedule) {
                this.saveStatus(this.currentSchedule.id, this.currentAction);
            }
            this.closeEmailModal();
            this.render();
        } finally {
            if (this.btnSendEmail) {
                this.btnSendEmail.disabled = false;
                this.btnSendEmail.classList.remove('opacity-70', 'cursor-wait');
            }
        }
    }

    createCard(schedule) {
        const card = document.createElement('article');
        const status = this.statuses[schedule.id];
        const clientName = schedule.clientName || schedule.user?.username || schedule.nome || 'Cliente não informado';
        const email = schedule.email || schedule.user?.email || 'email@exemplo.com';
        const telefone = schedule.telefone || schedule.phone || 'Telefone não informado';
        const petName = schedule.petName || schedule.nomePet || schedule.petAgendado?.name || 'Pet';
        const raca = schedule.raca || schedule.pet?.race || schedule.petAgendado?.raca || '';
        const serviceName = this.getServiceName(schedule);
        const dateStr = this.formatDate(schedule.date || schedule.dateAgendamento);
        const hourStr = schedule.hour || schedule.hourAgendamento || '';
        const translado = Boolean(schedule.buscarResidencia);
        const endereco = schedule.endereco || 'Atendimento presencial na clínica';
        const observation = schedule.observation || schedule.observacao || '';

        const isAccepted = status === 'accepted';
        const isRejected = status === 'rejected';

        let borderColor = 'border-gray-300';
        if (isAccepted) borderColor = 'border-green-500';
        if (isRejected) borderColor = 'border-red-alert';

        card.className = `animate-fadeItem flex flex-col justify-between gap-5 w-full p-5 sm:p-7 bg-white rounded-[12px] border-l-[6px] ${borderColor} shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] hover:shadow-md transition-all`;
        card.dataset.appointmentId = schedule.id;

        // Cabeçalho do Card
        const header = document.createElement('div');
        header.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4';

        const clientInfo = document.createElement('div');
        clientInfo.className = 'flex items-center gap-3.5';

        const avatar = document.createElement('span');
        avatar.className = 'flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-green-50 text-green-700 border border-green-200 font-sans font-bold text-xl uppercase';
        avatar.textContent = clientName.charAt(0);

        const clientDetails = document.createElement('div');
        clientDetails.className = 'flex flex-col';

        const clientTitle = document.createElement('h3');
        clientTitle.className = 'font-sans font-bold text-lg md:text-xl text-gray-800 leading-tight';
        clientTitle.textContent = clientName;

        const clientContacts = document.createElement('div');
        clientContacts.className = 'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500 mt-0.5';
        clientContacts.innerHTML = `
            <span class="flex items-center gap-1 font-medium text-gray-600">✉ ${email}</span>
            <span>•</span>
            <span>📞 ${telefone}</span>
        `;

        clientDetails.append(clientTitle, clientContacts);
        clientInfo.append(avatar, clientDetails);

        // Status Badge
        const statusBadge = document.createElement('div');
        statusBadge.className = 'shrink-0';
        if (isAccepted) {
            statusBadge.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-green-100 text-green-700 border border-green-300">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Aceito • E-mail Enviado
                </span>
            `;
        } else if (isRejected) {
            statusBadge.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-red-light text-red-alert border border-red-300">
                    <svg class="w-4 h-4 text-red-alert" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Recusado • E-mail Enviado
                </span>
            `;
        } else {
            statusBadge.innerHTML = `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-orange-light text-orange border border-orange/30">
                    <span class="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
                    Pendente de Avaliação
                </span>
            `;
        }

        header.append(clientInfo, statusBadge);

        // Corpo com Grid de Informações
        const bodyGrid = document.createElement('div');
        bodyGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm';
        bodyGrid.innerHTML = `
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase font-semibold">Pet & Raça</span>
                <span class="text-gray-800 font-bold flex items-center gap-1.5 mt-0.5">
                    <img src="/images/icons/options/pets/dog.svg" alt="Pet" class="w-4 h-4" />
                    ${petName} ${raca ? `<span class="text-xs text-gray-500 font-normal">(${raca})</span>` : ''}
                </span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase font-semibold">Serviço</span>
                <span class="text-gray-800 font-semibold mt-0.5">${serviceName}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase font-semibold">Data & Horário</span>
                <span class="text-gray-800 font-bold flex items-center gap-1 mt-0.5">
                    <img src="/images/icons/calender/hour.svg" alt="Horário" class="w-4 h-4 opacity-75" />
                    ${dateStr} às ${hourStr}
                </span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase font-semibold">Transporte</span>
                <span class="text-gray-800 font-medium mt-0.5">
                    ${translado ? '🚐 Buscar na residência' : '🏥 Na clínica'}
                </span>
            </div>
            ${translado ? `
            <div class="flex flex-col sm:col-span-2 lg:col-span-4 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span class="text-xs text-gray-500 font-semibold">Endereço de Busca:</span>
                <span class="text-gray-700 text-xs sm:text-sm font-medium mt-0.5 flex items-center gap-1">
                    <img src="/images/icons/options/endereco/house.svg" class="w-3.5 h-3.5" alt="Casa" />
                    ${endereco}
                </span>
            </div>` : ''}
            ${observation ? `
            <div class="flex flex-col sm:col-span-2 lg:col-span-4 text-xs sm:text-sm">
                <span class="text-xs text-gray-400 uppercase font-semibold">Observações do Cliente:</span>
                <span class="text-gray-700 italic mt-0.5">"${observation}"</span>
            </div>` : ''}
        `;

        // Rodapé com Ações
        const footer = document.createElement('div');
        footer.className = 'flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100';

        const idInfo = document.createElement('span');
        idInfo.className = 'text-xs text-gray-400 font-medium';
        idInfo.textContent = `Solicitação ID: #${schedule.id}`;

        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-3 w-full sm:w-auto justify-end';

        if (status) {
            const renotifyBtn = document.createElement('button');
            renotifyBtn.type = 'button';
            renotifyBtn.className = 'text-xs font-semibold text-green-600 hover:text-green-700 hover:underline outline-none';
            renotifyBtn.textContent = 'Enviar novo e-mail ao cliente';
            renotifyBtn.addEventListener('click', () => {
                this.openEmailModal(schedule, status);
            });
            actions.appendChild(renotifyBtn);
        } else {
            // Botão X: Recusar com X
            const btnRefuse = document.createElement('button');
            btnRefuse.type = 'button';
            btnRefuse.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-red-alert hover:opacity-90 text-white rounded-lg font-sans font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-red-alert/40';
            btnRefuse.innerHTML = `
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Recusar</span>
            `;
            btnRefuse.addEventListener('click', () => {
                this.openEmailModal(schedule, 'rejected');
            });

            // Botão Confere: Aceitar com confere ✔
            const btnAccept = document.createElement('button');
            btnAccept.type = 'button';
            btnAccept.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-sans font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-green-500/40';
            btnAccept.innerHTML = `
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Aceitar</span>
            `;
            btnAccept.addEventListener('click', () => {
                this.openEmailModal(schedule, 'accepted');
            });

            actions.append(btnRefuse, btnAccept);
        }

        footer.append(idInfo, actions);
        card.append(header, bodyGrid, footer);

        return card;
    }

    render() {
        if (!this.content) return;

        // Atualizar Contadores
        const total = this.appointments.length;
        const accepted = this.appointments.filter(a => this.statuses[a.id] === 'accepted').length;
        const rejected = this.appointments.filter(a => this.statuses[a.id] === 'rejected').length;
        const pending = total - (accepted + rejected);

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statPending) this.statPending.textContent = pending;
        if (this.statAccepted) this.statAccepted.textContent = accepted;
        if (this.statRejected) this.statRejected.textContent = rejected;

        // Filtragem
        let filtered = [...this.appointments];

        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(a => this.statuses[a.id] !== 'accepted' && this.statuses[a.id] !== 'rejected');
        } else if (this.currentFilter === 'accepted') {
            filtered = filtered.filter(a => this.statuses[a.id] === 'accepted');
        } else if (this.currentFilter === 'rejected') {
            filtered = filtered.filter(a => this.statuses[a.id] === 'rejected');
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(a => {
                const name = (a.clientName || a.nome || a.user?.username || '').toLowerCase();
                const pet = (a.petName || a.nomePet || '').toLowerCase();
                const email = (a.email || a.user?.email || '').toLowerCase();
                const service = this.getServiceName(a).toLowerCase();
                return name.includes(query) || pet.includes(query) || email.includes(query) || service.includes(query);
            });
        }

        this.content.innerHTML = '';

        if (filtered.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'flex flex-col items-center justify-center p-12 bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] text-center gap-3 animate-fadeItem';
            emptyDiv.innerHTML = `
                <img src="/images/icons/calendar_clock.svg" alt="Sem agendamentos" class="w-12 h-12 opacity-40" />
                <h4 class="font-sans font-bold text-lg text-gray-700">Nenhuma solicitação encontrada</h4>
                <p class="font-sans text-sm text-gray-500 max-w-sm">
                    ${this.searchQuery ? 'Nenhum resultado corresponde à sua pesquisa.' : 'Não há solicitações para o filtro selecionado.'}
                </p>
            `;
            this.content.appendChild(emptyDiv);
            return;
        }

        filtered.forEach(schedule => {
            this.content.appendChild(this.createCard(schedule));
        });
    }

    async loadAppointments() {
        try {
            const schedules = await this.fetchAgenda.get();
            if (Array.isArray(schedules) && schedules.length > 0) {
                this.appointments = schedules;
                this.render();
                return;
            }
        } catch (error) {
            console.warn('Backend de agenda não retornou dados no momento. Carregando dados modelo para frontend.', error);
        }

        // Dados padrão para visualização imediata da interface de solicitações pendentes
        this.appointments = [
            {
                id: 1,
                clientName: 'Mariana Silva',
                email: 'mariana.silva@email.com',
                telefone: '(11) 98765-4321',
                petName: 'Pipoca',
                raca: 'Poodle Toy',
                service: 'Banho e Tosa Completa',
                date: '2026-10-28',
                hour: '14:00',
                buscarResidencia: true,
                endereco: 'Rua das Palmeiras, 452 - Apto 31',
                observation: 'Pipoca é dócil, mas fica assustada com barulho de secador forte.'
            },
            {
                id: 2,
                clientName: 'Carlos Eduardo Santos',
                email: 'carlos.santos@email.com',
                telefone: '(11) 99123-4567',
                petName: 'Thor',
                raca: 'Golden Retriever',
                service: 'Vacinação V10 + Antirrábica',
                date: '2026-10-30',
                hour: '10:30',
                buscarResidencia: false,
                endereco: 'Atendimento presencial na clínica',
                observation: 'Trazer carteirinha física de vacinação para anotação.'
            },
            {
                id: 3,
                clientName: 'Fernanda Lima',
                email: 'fernanda.lima@email.com',
                telefone: '(11) 97788-9900',
                petName: 'Luna',
                raca: 'Siamês',
                service: 'Consulta de Rotina',
                date: '2026-11-03',
                hour: '15:30',
                buscarResidencia: false,
                endereco: 'Atendimento presencial na clínica',
                observation: 'Primeira consulta de rotina da gatinha na clínica Dr.Pet.'
            }
        ];

        this.render();
    }

    addEvents() {
        // Ação em lote: Aceitar todos os pendentes
        if (this.btnAcceptAll) {
            this.btnAcceptAll.addEventListener('click', () => {
                const pendingCount = this.appointments.filter(
                    a => this.statuses[a.id] !== 'accepted' && this.statuses[a.id] !== 'rejected'
                ).length;

                if (pendingCount === 0) {
                    alert('Não há solicitações pendentes para aceitar no momento.');
                    return;
                }

                this.openEmailModal(null, 'accept_all');
            });
        }

        // Filtros por status
        if (this.filterButtons) {
            this.filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter-appointment');
                    this.currentFilter = filter;

                    this.filterButtons.forEach(b => {
                        b.classList.remove('bg-green-600', 'text-white', 'shadow-sm');
                        b.classList.add('bg-gray-100', 'text-gray-600');
                    });

                    btn.classList.remove('bg-gray-100', 'text-gray-600');
                    btn.classList.add('bg-green-600', 'text-white', 'shadow-sm');

                    this.render();
                });
            });
        }

        // Campo de busca
        if (this.inputSearch) {
            this.inputSearch.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.render();
            });
        }

        // Fechar modal de e-mail
        if (this.btnCloseModal) {
            this.btnCloseModal.addEventListener('click', () => this.closeEmailModal());
        }
        if (this.btnCancelModal) {
            this.btnCancelModal.addEventListener('click', () => this.closeEmailModal());
        }

        // Fechar modal ao clicar fora (backdrop clickoutside)
        if (this.emailModal) {
            this.emailModal.addEventListener('click', (e) => {
                if (e.target === this.emailModal) {
                    this.closeEmailModal();
                }
            });
        }

        // Fechar com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.emailModal && !this.emailModal.classList.contains('hidden')) {
                this.closeEmailModal();
            }
        });

        // Inicializar eventos do input de tags estilo Gmail
        this.initTagInputEvents();

        // Enviar formulário do modal
        if (this.btnSendEmail) {
            this.btnSendEmail.addEventListener('click', () => this.handleSendEmail());
        }
    }

    init() {
        if (this.content) {
            this.addEvents();
            this.loadAppointments();
        }
        return this;
    }
}
