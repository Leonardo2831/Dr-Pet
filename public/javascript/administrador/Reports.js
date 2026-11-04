// Relatórios do painel de administrador: abas (Usuários, Produtos, Serviços).
// A aba "Usuários" continua sendo da classe UserReports; aqui ficam as demais e a troca de abas.

const escapeHtml = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const comparadorTexto = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

const classeLinha = (indice) => (indice % 2 === 1 ? 'bg-row-zebra' : 'bg-white');
const estiloLinha = (indice) => (indice % 2 === 1 ? 'background-color: #E2EAE4;' : '');

// ---------------------------------------------------------------------------
// Tabela genérica: busca com debounce, paginação de 10 em 10 e recarga por filtros
// ---------------------------------------------------------------------------
class ReportTable {
    constructor({ endpoint, tableBody, pagination, colspan, emptyText, errorText, params, renderRow, onData, sorts, defaultSort }) {
        this.endpoint = endpoint;
        this.tableBody = document.querySelector(tableBody);
        this.paginationContainer = document.querySelector(pagination);
        this.colspan = colspan;
        this.emptyText = emptyText;
        this.errorText = errorText;
        this.getParams = params || (() => ({}));
        this.renderRow = renderRow;
        this.onData = onData || (() => {});

        this.items = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.loaded = false;
        this.requestId = 0;

        // Ordenação: sorts = { coluna: { value: item => valor, type: 'text'|'number', first: 'asc'|'desc' } }
        this.sorts = sorts || {};
        this.sort = defaultSort ? { ...defaultSort } : null; // { key, dir }

        this.addPaginationEvents();
        this.setupSortHeaders();
    }

    // Devolve uma cópia ordenada conforme a coluna e a direção escolhidas (sem alterar a lista original)
    ordenar(itens) {
        const config = this.sort && this.sorts[this.sort.key];
        if (!config) return itens;

        const fator = this.sort.dir === 'asc' ? 1 : -1;
        return [...itens].sort((a, b) => {
            const va = config.value(a);
            const vb = config.value(b);

            let comparacao;
            if (config.type === 'number') comparacao = (Number(va) || 0) - (Number(vb) || 0);
            else comparacao = comparadorTexto.compare(String(va ?? ''), String(vb ?? ''));

            return comparacao * fator;
        });
    }

    // Transforma os <th data-sort="..."> em botões. 1º clique: direção padrão da coluna; 2º clique: a inversa.
    setupSortHeaders() {
        const tabela = this.tableBody?.closest('table');
        if (!tabela) return;

        this.sortHeaders = [...tabela.querySelectorAll('th[data-sort]')].filter(th => this.sorts[th.getAttribute('data-sort')]);

        this.sortHeaders.forEach((th) => {
            const rotulo = th.textContent.trim();
            th.innerHTML = `
                <button type="button" title="Ordenar por ${escapeHtml(rotulo.toLowerCase())}"
                    class="inline-flex items-center gap-1.5 font-bold text-left hover:text-green-700 transition-colors rounded outline-none focus-visible:ring-2 focus-visible:ring-green-300">
                    <span>${escapeHtml(rotulo)}</span>
                    <span data-sort-icon aria-hidden="true" class="text-sm text-gray-400">↕</span>
                </button>`;

            th.querySelector('button').addEventListener('click', () => this.alternarOrdenacao(th.getAttribute('data-sort')));
        });

        this.atualizarIndicadores();
    }

    alternarOrdenacao(chave) {
        const config = this.sorts[chave];
        if (!config) return;

        if (this.sort && this.sort.key === chave) {
            this.sort.dir = this.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            // números começam do maior para o menor; textos começam de A a Z
            this.sort = { key: chave, dir: config.first || 'asc' };
        }

        this.items = this.ordenar(this.items);
        this.currentPage = 1;
        this.atualizarIndicadores();
        if (this.loaded) this.render();
    }

    atualizarIndicadores() {
        (this.sortHeaders || []).forEach((th) => {
            const ativa = this.sort && this.sort.key === th.getAttribute('data-sort');
            const icone = th.querySelector('[data-sort-icon]');

            th.setAttribute('aria-sort', ativa ? (this.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
            icone.textContent = ativa ? (this.sort.dir === 'asc' ? '▲' : '▼') : '↕';
            icone.classList.toggle('text-green-700', Boolean(ativa));
            icone.classList.toggle('text-gray-400', !ativa);
        });
    }

    async load() {
        if (!this.tableBody) return;
        const requestId = ++this.requestId;

        const query = new URLSearchParams();
        Object.entries(this.getParams()).forEach(([chave, valor]) => {
            if (valor) query.set(chave, valor);
        });

        try {
            const resposta = await fetch(`${this.endpoint}${query.toString() ? '?' + query : ''}`);
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
            const dados = await resposta.json();

            if (requestId !== this.requestId) return; // chegou uma resposta mais nova enquanto esta voltava
            this.items = this.ordenar(Array.isArray(dados.itens) ? dados.itens : []);
            this.currentPage = 1;
            this.loaded = true;
            this.onData(dados);
            this.render();
        } catch (erro) {
            if (requestId !== this.requestId) return;
            console.error('Erro ao carregar relatório:', erro);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="${this.colspan}" class="text-center py-10 text-red-600 font-medium text-base">
                        ${escapeHtml(this.errorText)}
                    </td>
                </tr>`;
            this.renderPagination(1);
        }
    }

    render() {
        const tabela = this.tableBody.closest('table');
        if (tabela) {
            tabela.classList.remove('animate-fadeLeft');
            void tabela.offsetWidth; // reinicia a animação ao trocar de página
            tabela.classList.add('animate-fadeLeft');
        }

        const totalPaginas = Math.max(1, Math.ceil(this.items.length / this.itemsPerPage));
        if (this.currentPage > totalPaginas) this.currentPage = totalPaginas;

        const inicio = (this.currentPage - 1) * this.itemsPerPage;
        const pagina = this.items.slice(inicio, inicio + this.itemsPerPage);

        if (pagina.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="${this.colspan}" class="text-center py-10 text-gray-500 font-medium text-base">
                        ${escapeHtml(this.emptyText)}
                    </td>
                </tr>`;
            this.renderPagination(1);
            return;
        }

        this.tableBody.innerHTML = pagina.map((item, indice) => this.renderRow(item, indice)).join('');
        this.renderPagination(totalPaginas);
    }

    renderPagination(totalPaginas) {
        const container = this.paginationContainer;
        if (!container) return;

        if (this.items.length <= this.itemsPerPage || totalPaginas <= 1) {
            container.innerHTML = '';
            container.classList.add('hidden');
            container.classList.remove('flex');
            return;
        }

        container.classList.remove('hidden');
        container.classList.add('flex');

        const botaoNav = (acao, texto, desabilitado) => `
            <button type="button" data-action="${acao}" ${desabilitado ? 'disabled' : ''}
                class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed">${texto}</button>`;

        let html = botaoNav('prev', 'Anterior', this.currentPage === 1);
        for (let p = 1; p <= totalPaginas; p++) {
            html += p === this.currentPage
                ? `<button type="button" data-page="${p}" class="px-3 py-1 text-sm font-semibold text-white bg-green-700 rounded transition-all">${p}</button>`
                : `<button type="button" data-page="${p}" class="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors">${p}</button>`;
        }
        html += botaoNav('next', 'Próximo', this.currentPage === totalPaginas);

        container.innerHTML = html;
    }

    addPaginationEvents() {
        if (!this.paginationContainer) return;

        this.paginationContainer.addEventListener('click', (evento) => {
            const botao = evento.target.closest('button');
            if (!botao || botao.disabled) return;

            const pagina = botao.getAttribute('data-page');
            const acao = botao.getAttribute('data-action');
            const totalPaginas = Math.max(1, Math.ceil(this.items.length / this.itemsPerPage));

            if (pagina) this.currentPage = parseInt(pagina, 10);
            else if (acao === 'prev' && this.currentPage > 1) this.currentPage--;
            else if (acao === 'next' && this.currentPage < totalPaginas) this.currentPage++;
            else return;

            this.render();
        });
    }
}

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------
export default function initReports() {
    const secao = document.querySelector('#section-relatorios');
    if (!secao) return;

    const campo = (seletor) => secao.querySelector(seletor);
    const debounce = (fn, atraso = 300) => {
        let timer;
        return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), atraso); };
    };

    // ---- Produtos
    const produtos = new ReportTable({
        endpoint: '/administrador/relatorios/produtos',
        defaultSort: { key: 'nome', dir: 'asc' },
        sorts: {
            nome: { type: 'text', first: 'asc', value: (p) => p.nome },
            categoria: { type: 'text', first: 'asc', value: (p) => p.categoria },
            preco: { type: 'number', first: 'desc', value: (p) => p.preco },
            descricao: { type: 'text', first: 'asc', value: (p) => p.descricao }
        },
        tableBody: '[data-content-report="produtos"]',
        pagination: '[data-pagination="report-produtos"]',
        colspan: 5,
        emptyText: 'Nenhum produto encontrado.',
        errorText: 'Erro ao carregar produtos. Verifique se o banco de dados está conectado.',
        params: () => ({
            busca: campo('[data-input="searchReportProdutos"]')?.value.trim(),
            categoria: campo('[data-input="reportProdutoCategoria"]')?.value
        }),
        onData: ({ resumo }) => {
            const resumoEl = campo('[data-report-summary="produtos"]');
            if (!resumoEl || !resumo) return;
            const porCategoria = (resumo.categorias || []).map(c => `${escapeHtml(c.categoria)}: ${c.total}`).join(' · ');
            resumoEl.innerHTML = `<strong>${resumo.total}</strong> produto(s) listado(s)${porCategoria ? ` &nbsp;|&nbsp; Cadastrados por categoria — ${porCategoria}` : ''}`;
        },
        renderRow: (p, i) => `
            <tr class="${classeLinha(i)} hover:opacity-90 transition-colors" style="${estiloLinha(i)}">
                <td class="py-3 px-6 text-center w-[90px]">
                    <img src="/produtos/imagem/${p.id}" alt="${escapeHtml(p.nome)}" loading="lazy"
                        class="w-10 h-10 md:w-11 md:h-11 rounded-[8px] object-cover mx-auto bg-gray-100"
                        onerror="this.style.visibility='hidden';" />
                </td>
                <td class="py-3 px-6 font-medium text-gray-900 text-base md:text-lg">${escapeHtml(p.nome)}</td>
                <td class="py-3 px-6 text-gray-800 text-base md:text-lg whitespace-nowrap">${escapeHtml(p.categoria)}</td>
                <td class="py-3 px-6 text-gray-800 text-base md:text-lg whitespace-nowrap">${moeda(p.preco)}</td>
                <td class="py-3 px-6 text-gray-800 text-base md:text-lg">${escapeHtml(p.descricao)}</td>
            </tr>`
    });

    // ---- Serviços
    const servicos = new ReportTable({
        endpoint: '/administrador/relatorios/servicos',
        defaultSort: { key: 'nome', dir: 'asc' },
        sorts: {
            nome: { type: 'text', first: 'asc', value: (s) => s.nome },
            duracao: { type: 'number', first: 'desc', value: (s) => s.duracao },
            preco: { type: 'number', first: 'desc', value: (s) => s.preco }
        },
        tableBody: '[data-content-report="servicos"]',
        pagination: '[data-pagination="report-servicos"]',
        colspan: 4,
        emptyText: 'Nenhum serviço encontrado.',
        errorText: 'Erro ao carregar serviços. Verifique se o banco de dados está conectado.',
        params: () => ({ busca: campo('[data-input="searchReportServicos"]')?.value.trim() }),
        onData: ({ resumo }) => {
            const resumoEl = campo('[data-report-summary="servicos"]');
            if (resumoEl && resumo) resumoEl.innerHTML = `<strong>${resumo.total}</strong> tipo(s) de serviço`;
        },
        renderRow: (s, i) => `
            <tr class="${classeLinha(i)} hover:opacity-90 transition-colors" style="${estiloLinha(i)}">
                <td class="py-3 px-6 text-center w-[90px]">
                    ${s.has_imagem
                        ? `<img src="/servicos/imagem/${s.id}" alt="${escapeHtml(s.nome)}" loading="lazy" class="w-10 h-10 md:w-11 md:h-11 rounded-[8px] object-cover mx-auto bg-gray-100" onerror="this.style.visibility='hidden';" />`
                        : ''}
                </td>
                <td class="py-3 px-6 text-gray-900">
                    <span class="block font-medium text-base md:text-lg">${escapeHtml(s.nome)}</span>
                    <span class="block text-sm text-gray-600 max-w-[320px] truncate" title="${escapeHtml(s.descricao)}">${escapeHtml(s.descricao)}</span>
                </td>
                <td class="py-3 px-6 text-gray-800 text-base md:text-lg whitespace-nowrap">${s.duracao} min</td>
                <td class="py-3 px-6 text-gray-800 text-base md:text-lg whitespace-nowrap">${moeda(s.preco)}</td>
            </tr>`
    });

    // Filtros de produtos e serviços
    const recarregarProdutos = debounce(() => produtos.load());
    campo('[data-input="searchReportProdutos"]')?.addEventListener('input', recarregarProdutos);
    campo('[data-input="reportProdutoCategoria"]')?.addEventListener('change', () => produtos.load());
    const recarregarServicos = debounce(() => servicos.load());
    campo('[data-input="searchReportServicos"]')?.addEventListener('input', recarregarServicos);

    // ---- Abas: carrega os dados de cada relatório na primeira vez que a aba é aberta
    const tabelas = { produtos, servicos };
    const abas = secao.querySelectorAll('[data-report-tab]');
    const paineis = secao.querySelectorAll('[data-report-panel]');

    const ATIVA = ['bg-green-600', 'text-gray-50', 'hover:bg-green-700'];
    const INATIVA = ['bg-gray-200', 'text-green-700', 'hover:bg-gray-300'];

    abas.forEach((aba) => {
        aba.addEventListener('click', () => {
            const alvo = aba.getAttribute('data-report-tab');

            abas.forEach((outra) => {
                const ativa = outra === aba;
                outra.setAttribute('aria-selected', String(ativa));
                outra.classList.remove(...(ativa ? INATIVA : ATIVA));
                outra.classList.add(...(ativa ? ATIVA : INATIVA));
            });

            paineis.forEach((painel) => {
                painel.classList.toggle('hidden', painel.getAttribute('data-report-panel') !== alvo);
            });

            const tabela = tabelas[alvo];
            // recarrega sempre ao abrir, para refletir o que mudou desde a última visita
            if (tabela) tabela.load();
        });
    });

}
