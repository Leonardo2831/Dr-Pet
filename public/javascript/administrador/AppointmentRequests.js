import Fetch from '../utils/Fetch.js';
import { clickOutside } from '../utils/clickOutside.js';

export default class AppointmentRequests {
    constructor(selectorContent) {
        this.content = document.querySelector(selectorContent);
        this.section = document.getElementById('section-agendamentos');
        this.fetchEmail = new Fetch('administrador/agendamentos/status', '[data-modal-info="adm"]');
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

    getCardData(card) {
        if (!card) return null;
        return {
            id: card.getAttribute('data-appointment-id'),
            clientName: card.getAttribute('data-client-name') || 'Cliente',
            email: card.getAttribute('data-email') || '',
            telefone: card.getAttribute('data-phone') || '',
            petName: card.getAttribute('data-pet') || 'Pet',
            service: card.getAttribute('data-service') || 'Serviço',
            date: card.getAttribute('data-date') || '',
            hour: card.getAttribute('data-hour') || '',
            buscarResidencia: card.getAttribute('data-translado') === 'true',
            isPending: card.getAttribute('data-pending') === 'true'
        };
    }

    updateCounters() {
        if (!this.content) return;
        const cards = this.content.querySelectorAll('[data-appointment-card]');
        const total = cards.length;
        const pending = this.content.querySelectorAll('[data-appointment-card][data-pending="true"]').length;
        const accepted = total - pending;

        if (this.statTotal) this.statTotal.textContent = total;
        if (this.statPending) this.statPending.textContent = pending;
        if (this.statAccepted) this.statAccepted.textContent = accepted;
        if (this.statRejected) this.statRejected.textContent = 0;
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
            const pendingCards = Array.from(this.content.querySelectorAll('[data-appointment-card][data-pending="true"]'));
            const pendingCount = pendingCards.length;
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
            pendingCards.forEach(c => {
                const email = (c.getAttribute('data-email') || '').trim().toLowerCase();
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

        if (this.btnSendEmail) {
            this.btnSendEmail.disabled = true;
            this.btnSendEmail.classList.add('opacity-70', 'cursor-wait');
        }

        try {
            if (this.currentAction === 'accept_all') {
                const pendingCards = Array.from(this.content.querySelectorAll('[data-appointment-card][data-pending="true"]'));
                const payload = {
                    action: 'accept_all',
                    status: 'accepted',
                    ids: pendingCards.map(c => c.getAttribute('data-appointment-id')),
                    destinatarios: this.emailTags,
                    assunto: subject,
                    mensagemHtml: messageHtml,
                    mensagemTexto: messageText,
                    totalNotificados: this.emailTags.length
                };

                await this.fetchEmail.post(payload);
            } else if (this.currentSchedule) {
                const payload = {
                    id: this.currentSchedule.id,
                    status: this.currentAction,
                    action: this.currentAction,
                    destinatario: {
                        email: email,
                        nome: this.currentSchedule.clientName || 'Cliente'
                    },
                    assunto: subject,
                    mensagemHtml: messageHtml,
                    mensagemTexto: messageText,
                    agendamento: {
                        id: this.currentSchedule.id,
                        pet: this.currentSchedule.petName,
                        servico: this.currentSchedule.service,
                        data: this.currentSchedule.date,
                        horario: this.currentSchedule.hour,
                        buscarResidencia: Boolean(this.currentSchedule.buscarResidencia)
                    }
                };

                await this.fetchEmail.post(payload);
            }

            this.closeEmailModal();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao processar envio de e-mail e agendamento:', error);
            this.closeEmailModal();
            window.location.reload();
        } finally {
            if (this.btnSendEmail) {
                this.btnSendEmail.disabled = false;
                this.btnSendEmail.classList.remove('opacity-70', 'cursor-wait');
            }
        }
    }

    render() {
        if (!this.content) return;

        // Atualizar Contadores
        this.updateCounters();

        const cards = this.content.querySelectorAll('[data-appointment-card]');
        const emptyState = this.content.querySelector('[data-appointment-empty]');
        let visibleCount = 0;

        cards.forEach(card => {
            const isPending = card.getAttribute('data-pending') === 'true';

            let matchesFilter = true;
            if (this.currentFilter === 'pending') {
                matchesFilter = isPending;
            } else if (this.currentFilter === 'accepted') {
                matchesFilter = !isPending;
            } else if (this.currentFilter === 'rejected') {
                matchesFilter = false;
            }

            let matchesSearch = true;
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const name = (card.getAttribute('data-client-name') || '').toLowerCase();
                const email = (card.getAttribute('data-email') || '').toLowerCase();
                const pet = (card.getAttribute('data-pet') || '').toLowerCase();
                const service = (card.getAttribute('data-service') || '').toLowerCase();
                matchesSearch = name.includes(query) || email.includes(query) || pet.includes(query) || service.includes(query);
            }

            const visible = matchesFilter && matchesSearch;
            card.classList.toggle('hidden', !visible);
            if (visible) visibleCount++;
        });

        if (emptyState) {
            emptyState.classList.toggle('hidden', visibleCount > 0);
        }
    }

    bindCardEvents() {
        if (!this.content) return;
        const cards = this.content.querySelectorAll('[data-appointment-card]');
        cards.forEach(card => {
            const schedule = this.getCardData(card);

            const btnAccept = card.querySelector('[data-action="accept"]');
            if (btnAccept) {
                btnAccept.onclick = () => this.openEmailModal(schedule, 'accepted');
            }

            const btnReject = card.querySelector('[data-action="reject"]');
            if (btnReject) {
                btnReject.onclick = () => this.openEmailModal(schedule, 'rejected');
            }

            const btnRenotify = card.querySelector('[data-action="renotify"]');
            if (btnRenotify) {
                btnRenotify.onclick = () => {
                    const currentStatus = card.getAttribute('data-pending') === 'true' ? 'pending' : 'accepted';
                    this.openEmailModal(schedule, currentStatus);
                };
            }
        });
    }

    loadAppointments() {
        this.updateCounters();
        this.bindCardEvents();
    }

    addEvents() {
        // Ação em lote: Aceitar todos os pendentes
        if (this.btnAcceptAll) {
            this.btnAcceptAll.addEventListener('click', () => {
                const pendingCards = this.content.querySelectorAll('[data-appointment-card][data-pending="true"]');
                if (pendingCards.length === 0) {
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
