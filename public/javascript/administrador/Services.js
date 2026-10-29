import CheckFunction from '../utils/CheckFunction.js';

export default class Services {
    constructor(selectorContent) {
        this.content = document.querySelector(selectorContent);
        this.confirm = new CheckFunction();
        this.feedback = document.querySelector('[data-modal-info="adm"]');

        this.handleClick = this.handleClick.bind(this);
    }

    showFeedback(message, type) {
        if (!this.feedback) return;

        this.feedback.textContent = message;
        this.feedback.classList.remove('error', 'success');
        this.feedback.classList.add(type);

        window.setTimeout(() => {
            this.feedback.classList.remove('error', 'success');
        }, 2500);
    }

    setLoading(button, isLoading) {
        button.disabled = isLoading;
        button.setAttribute('aria-busy', String(isLoading));
        button.classList.toggle('opacity-50', isLoading);
        button.classList.toggle('cursor-wait', isLoading);
    }

    async getResponseData(response) {
        if (response.status === 204) return {};

        const contentType = response.headers.get('content-type') || '';
        const message = await response.text();

        if (!message) return {};

        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(message);
            } catch (error) {
                console.error('Resposta JSON inválida ao deletar serviço:', error);
            }
        }

        if (contentType.includes('text/html')) return {};

        return { message };
    }

    async deleteService(button) {
        const id = button.dataset.serviceId;
        const card = button.closest('[data-service-card]');

        this.setLoading(button, true);

        try {
            const response = await fetch(`/administrador/servicos/delete/${encodeURIComponent(id)}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                }
            });

            if (response.redirected && new URL(response.url).pathname === '/login') {
                throw new Error('Sua sessão expirou. Entre novamente para continuar.');
            }

            const data = await this.getResponseData(response);

            if (!response.ok) {
                throw new Error(data.erro || data.message || 'Não foi possível deletar o serviço.');
            }

            if (card) {
                card.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            }

            this.showFeedback(
                data.mensagem || data.message || 'Serviço deletado com sucesso!',
                'success'
            );

            window.setTimeout(() => window.location.reload(), 700);
        } catch (error) {
            console.error('Erro ao deletar serviço:', error);
            this.showFeedback(error.message || 'Não foi possível deletar o serviço.', 'error');
            this.setLoading(button, false);
        }
    }

    handleClick(event) {
        const button = event.target.closest('[data-button="deleteService"]');
        if (!button || !this.content.contains(button) || button.disabled) return;

        const id = button.dataset.serviceId;
        const name = button.dataset.serviceName || 'este serviço';
        const confirmMessage = document.querySelector('[data-confirm-message]');

        if (!id) {
            this.showFeedback('Não foi possível identificar o serviço.', 'error');
            return;
        }

        if (confirmMessage) {
            confirmMessage.textContent = `Tem certeza que deseja deletar o serviço "${name}"?`;
        }

        this.confirm.open(() => this.deleteService(button));
    }

    init() {
        if (this.content) {
            this.content.addEventListener('click', this.handleClick);
        }

        return this;
    }
}
