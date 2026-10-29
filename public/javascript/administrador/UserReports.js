export default class UserReports {
    constructor(options = {}) {
        this.sectionSelector = options.sectionSelector || '#section-relatorios';
        this.searchInputSelector = options.searchInputSelector || '[data-input="searchUsers"]';
        this.tableBodySelector = options.tableBodySelector || '[data-content-users="table"]';
        this.paginationSelector = options.paginationSelector || '[data-pagination="users"]';

        this.section = document.querySelector(this.sectionSelector);
        this.searchInput = document.querySelector(this.searchInputSelector);
        this.tableBody = document.querySelector(this.tableBodySelector);
        this.paginationContainer = document.querySelector(this.paginationSelector);

        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.debounceTimer = null;
    }

    formatPhone(phone) {
        if (!phone) return '-';
        const clean = String(phone).replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        } else if (clean.length === 10) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
        }
        return phone;
    }

    async fetchUsers(searchTerm = '') {
        try {
            const url = searchTerm
                ? `/administrador/usuarios?busca=${encodeURIComponent(searchTerm)}`
                : '/administrador/usuarios';

            const res = await fetch(url);
            if (!res.ok) throw new Error('Erro ao buscar usuários no banco de dados');

            const data = await res.json();
            this.users = Array.isArray(data) ? data : [];
            this.currentPage = 1;
            this.render();
        } catch (error) {
            console.error('Erro na consulta de usuários:', error);
            if (this.tableBody) {
                this.tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-10 text-red-600 font-medium text-base">
                            Erro ao carregar usuários. Verifique se o banco de dados está conectado.
                        </td>
                    </tr>
                `;
            }
        }
    }

    render() {
        if (!this.tableBody) return;

        // Reinicia a animação animate-fadeLeft na tabela ao mudar de página
        const table = this.tableBody.closest('table');
        if (table) {
            table.classList.remove('animate-fadeLeft');
            void table.offsetWidth; // Força reflow para disparar a animação novamente
            table.classList.add('animate-fadeLeft');
        }

        const totalPages = Math.max(1, Math.ceil(this.users.length / this.itemsPerPage));
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const pageUsers = this.users.slice(start, start + this.itemsPerPage);

        if (pageUsers.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-10 text-gray-500 font-medium text-base">
                        Nenhum usuário encontrado.
                    </td>
                </tr>
            `;
            this.renderPagination(1);
            return;
        }

        this.tableBody.innerHTML = pageUsers.map((user, index) => {
            const isZebra = index % 2 === 1;
            const bgClass = isZebra ? 'bg-row-zebra' : 'bg-white';
            const bgStyle = isZebra ? 'background-color: #E2EAE4;' : '';
            const phone = this.formatPhone(user.telefone);

            const avatarSrc = user.has_avatar
                ? `/administrador/usuarios/avatar/${user.id}`
                : '/images/icons/options/user-default.svg';

            const avatarHtml = `<img src="${avatarSrc}" alt="${user.nome}" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover mx-auto" onerror="this.src='/images/icons/options/user-default.svg';" />`;

            return `
                <tr class="${bgClass} hover:opacity-90 transition-colors" style="${bgStyle}">
                    <td class="py-3 px-6 text-center w-[90px]">
                        ${avatarHtml}
                    </td>
                    <td class="py-3 px-6 font-medium text-gray-900 text-base md:text-lg">
                        ${user.nome}
                    </td>
                    <td class="py-3 px-6 text-gray-800 text-base md:text-lg">
                        ${user.email}
                    </td>
                    <td class="py-3 px-6 text-gray-800 text-base md:text-lg whitespace-nowrap">
                        ${phone}
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        if (!this.paginationContainer) return;

        // Só mostra a paginação a partir de 10 usuários (ou se houver mais de 1 página)
        if (this.users.length <= this.itemsPerPage || totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            this.paginationContainer.classList.add('hidden');
            this.paginationContainer.classList.remove('flex');
            return;
        }

        this.paginationContainer.classList.remove('hidden');
        this.paginationContainer.classList.add('flex');

        let buttons = `
            <button type="button" data-action="prev" ${this.currentPage === 1 ? 'disabled' : ''} 
                class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Anterior
            </button>
        `;

        for (let p = 1; p <= totalPages; p++) {
            if (p === this.currentPage) {
                buttons += `
                    <button type="button" data-page="${p}" 
                        class="px-3 py-1 text-sm font-semibold text-white bg-green-700 rounded transition-all">
                        ${p}
                    </button>
                `;
            } else {
                buttons += `
                    <button type="button" data-page="${p}" 
                        class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">
                        ${p}
                    </button>
                `;
            }
        }

        buttons += `
            <button type="button" data-action="next" ${this.currentPage === totalPages ? 'disabled' : ''} 
                class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Próximo
            </button>
        `;

        this.paginationContainer.innerHTML = buttons;
    }

    addEvents() {
        // Busca em tempo real com debounce consultando a rota do banco de dados
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (event) => {
                clearTimeout(this.debounceTimer);
                const term = event.target.value.trim();
                this.debounceTimer = setTimeout(() => {
                    this.fetchUsers(term);
                }, 300);
            });
        }

        // Navegação de paginação
        if (this.paginationContainer) {
            this.paginationContainer.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button || button.disabled) return;

                const page = button.getAttribute('data-page');
                const action = button.getAttribute('data-action');

                if (page) {
                    this.currentPage = parseInt(page, 10);
                    this.render();
                } else if (action === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                    this.render();
                } else if (action === 'next') {
                    const totalPages = Math.max(1, Math.ceil(this.users.length / this.itemsPerPage));
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.render();
                    }
                }
            });
        }

        // Carrega os dados quando a aba de relatórios for aberta se ainda não tiver carregado
        const tabRelatoriosBtn = document.querySelector('[data-tab-btn][data-target="section-relatorios"]');
        if (tabRelatoriosBtn) {
            tabRelatoriosBtn.addEventListener('click', () => {
                if (this.users.length === 0) {
                    this.fetchUsers(this.searchInput?.value?.trim() || '');
                }
            });
        }
    }

    init() {
        this.addEvents();
        // Carga inicial dos usuários
        this.fetchUsers();
        return this;
    }
}
