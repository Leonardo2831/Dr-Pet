import Fetch from '../utils/Fetch.js';

export default class AppointmentRequests {
    constructor(selectorContent) {
        this.content = document.querySelector(selectorContent);
        this.fetchAgenda = new Fetch('agenda', '[data-modal-info="adm"]');
        this.storageKey = 'drpet-appointment-request-status';
        this.statuses = this.getStoredStatuses();
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
            vacinacao: 'Vacinação',
            consulta: 'Consulta',
            cirurgia: 'Cirurgia'
        };
        const service = schedule.service?.name || schedule.service || '';

        return serviceNames[String(service).toLowerCase()] || service || 'Serviço não informado';
    }

    formatDate(date) {
        if (!date || !date.includes('-')) return 'Data não informada';

        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }

    createTextElement(tag, className, text) {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = text;
        return element;
    }

    createActionButton(label, type, schedule, card, actions) {
        const button = document.createElement('button');
        const isAccept = type === 'accepted';

        button.type = 'button';
        button.textContent = label;
        button.className = [
            'flex-1 px-6 py-3 rounded-[5px]',
            'font-sans font-semibold text-base md:text-lg text-white shadow-sm',
            'focus:outline-none focus:ring-4 transition-all',
            isAccept
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500/50'
                : 'bg-red-alert hover:opacity-90 focus:ring-red-alert/50'
        ].join(' ');

        button.addEventListener('click', () => {
            this.saveStatus(schedule.id, type);
            this.renderStatus(actions, type);
            card.classList.remove('border-gray-200', 'border-green-400');
            card.style.borderTopColor = isAccept ? '' : '#800020';
            if (isAccept) card.classList.add('border-green-400');
        });

        return button;
    }

    renderStatus(actions, status) {
        actions.innerHTML = '';

        const isAccepted = status === 'accepted';
        const statusElement = this.createTextElement(
            'span',
            [
                'flex items-center justify-center w-full px-6 py-3 rounded-[5px]',
                'font-sans font-semibold text-base md:text-lg',
                isAccepted ? 'bg-green-light text-green-700' : 'bg-red-light text-red-alert'
            ].join(' '),
            isAccepted ? 'Agendamento aceito' : 'Agendamento recusado'
        );

        actions.appendChild(statusElement);
    }

    createCard(schedule) {
        const card = document.createElement('article');
        const status = this.statuses[schedule.id];
        const clientName = schedule.user?.username || schedule.user?.userName || schedule.clientName || 'Cliente não informado';
        const petName = schedule.petAgendado?.name || schedule.pet?.name;

        card.className = [
            'animate-fadeItem flex flex-col lg:flex-row md:items-center justify-between gap-6',
            'w-full px-5 py-6 md:px-9 bg-white rounded-[10px]',
            'border-t-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]',
            status === 'accepted'
                ? 'border-green-400'
                : 'border-gray-200'
        ].join(' ');
        card.dataset.appointmentId = schedule.id;
        if (status === 'rejected') card.style.borderTopColor = '#800020';

        const information = document.createElement('div');
        information.className = 'flex items-start gap-4 md:gap-6 min-w-0';

        const avatar = this.createTextElement(
            'span',
            'flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-green-light font-sans font-bold text-xl md:text-2xl text-green-700 uppercase',
            clientName.charAt(0)
        );

        const text = document.createElement('div');
        text.className = 'flex flex-col gap-2 min-w-0';
        text.appendChild(this.createTextElement(
            'h3',
            'font-sans font-bold text-lg md:text-2xl text-gray-800 break-words',
            clientName
        ));

        const service = document.createElement('p');
        service.className = 'font-sans text-base md:text-lg text-gray-700';
        service.appendChild(this.createTextElement('span', 'font-semibold text-green-700', 'Serviço: '));
        service.append(this.getServiceName(schedule));
        text.appendChild(service);

        const details = [this.formatDate(schedule.date), schedule.hour].filter(Boolean).join(' às ');
        text.appendChild(this.createTextElement(
            'p',
            'font-sans font-medium text-sm md:text-base text-gray-500',
            `${details}${petName ? ` • Pet: ${petName}` : ''}`
        ));

        information.append(avatar, text);

        const actions = document.createElement('div');
        actions.className = 'flex flex-col sm:flex-row lg:justify-end gap-3 w-full lg:w-auto shrink-0';

        if (status) {
            this.renderStatus(actions, status);
        } else {
            actions.append(
                this.createActionButton('Recusar', 'rejected', schedule, card, actions),
                this.createActionButton('Aceitar', 'accepted', schedule, card, actions)
            );
        }

        card.append(information, actions);
        return card;
    }

    renderEmptyState(message) {
        this.content.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center justify-center p-8 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]';
        wrapper.appendChild(this.createTextElement(
            'p',
            'font-sans font-semibold text-lg text-gray-600 text-center',
            message
        ));
        this.content.appendChild(wrapper);
    }

    render(schedules) {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            this.renderEmptyState('Nenhum agendamento encontrado.');
            return;
        }

        this.content.innerHTML = '';

        [...schedules]
            .sort((first, second) => `${first.date || ''} ${first.hour || ''}`.localeCompare(`${second.date || ''} ${second.hour || ''}`))
            .forEach(schedule => this.content.appendChild(this.createCard(schedule)));
    }

    addEvents() {
        if (!this.content) return;

        this.content.addEventListener('click', (event) => {
            const button = event.target.closest('[data-appointment-action], [data-button="acceptAppointment"], [data-button="refuseAppointment"]');
            if (!button) return;

            const isAccept = button.matches('[data-button="acceptAppointment"]') || button.getAttribute('data-appointment-action') === 'accepted';
            const type = isAccept ? 'accepted' : 'rejected';
            const card = button.closest('[data-id]') || button.closest('article');
            const id = card?.getAttribute('data-id');
            const actions = button.closest('[data-appointment-actions]') || button.parentElement;

            if (id && actions) {
                this.saveStatus(id, type);
                this.renderStatus(actions, type);
                card.classList.remove('border-gray-200', 'border-green-400');
                card.style.borderTopColor = isAccept ? '' : '#800020';
                if (isAccept) card.classList.add('border-green-400');
            }
        });
    }

    async loadAppointments() {
        const schedules = await this.fetchAgenda.get();

        if (!schedules) {
            this.renderEmptyState('Não foi possível carregar os agendamentos.');
            return;
        }

        this.render(schedules);
    }

    init() {
        if (this.content) {
            this.addEvents();
        }
        return this;
    }
}
