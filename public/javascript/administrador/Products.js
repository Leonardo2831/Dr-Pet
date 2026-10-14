import CheckFunction from '../utils/CheckFunction.js';

const confirm = new CheckFunction();

export default class Products {
    constructor(selectorContentProducts, selectorButtonNew, selectorInputSearchProduct, selectorSelectTypeProduct, formProduct) {
        this.contentProducts = document.querySelector(selectorContentProducts);
        this.buttonNew = document.querySelector(selectorButtonNew);
        this.inputSearchProduct = document.querySelector(selectorInputSearchProduct);
        this.selectTypeProduct = document.querySelector(selectorSelectTypeProduct);

        this.formProduct = formProduct;
    }

    filterTable() {
        const tableBody = this.contentProducts || document.querySelector('[data-content-products="table"]');
        if (!tableBody) return;

        const searchTerm = (this.inputSearchProduct?.value || '').toLowerCase().trim();
        const selectedCategory = (this.selectTypeProduct?.value || 'all').toLowerCase().trim();

        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(tr => {
            const name = (tr.dataset.name || tr.dataset.nome || tr.children[0]?.textContent || '').toLowerCase();
            const category = (tr.dataset.category || tr.dataset.categoria || tr.children[1]?.textContent || '').toLowerCase();

            const matchesSearch = !searchTerm || name.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || category.includes(selectedCategory);

            if (matchesSearch && matchesCategory) {
                tr.style.display = '';
            } else {
                tr.style.display = 'none';
            }
        });
    }

    addEvents() {
        // 1. Botão "Novo Produto" abre o modal de cadastro
        if (this.buttonNew && this.formProduct) {
            this.buttonNew.addEventListener('click', (event) => {
                event.preventDefault();
                this.formProduct.openForm();
            });
        }

        // 2. Delegação global de eventos para os botões Editar e Excluir na tabela
        document.addEventListener('click', (event) => {
            const editBtn = event.target.closest('[data-button="editProduct"]');
            if (editBtn) {
                event.preventDefault();
                const tr = editBtn.closest('tr');
                if (!tr || !this.formProduct) return;

                const product = {
                    id: tr.dataset.id || tr.getAttribute('data-id') || '',
                    name: tr.dataset.name || tr.dataset.nome || tr.children[0]?.textContent?.trim() || '',
                    category: tr.dataset.category || tr.dataset.categoria || tr.children[1]?.textContent?.trim() || '',
                    price: tr.dataset.price || tr.dataset.preco || tr.children[2]?.textContent?.trim() || '',
                    longDescription: tr.dataset.longDescription || tr.dataset.long || tr.dataset.descricaoLonga || tr.children[3]?.innerHTML?.trim() || tr.children[3]?.textContent?.trim() || '',
                    shortDescription: tr.dataset.shortDescription || tr.dataset.short || tr.dataset.descricaoCurta || tr.children[4]?.textContent?.trim() || ''
                };

                this.formProduct.putValuesForm(product);
                return;
            }

            const deleteBtn = event.target.closest('[data-button="deleteProduct"]');
            if (deleteBtn) {
                event.preventDefault();
                const tr = deleteBtn.closest('tr');
                const id = tr?.dataset.id || tr?.getAttribute('data-id');
                if (!id) return;

                confirm.open(() => {
                    fetch(`/produtos/${id}`, { method: 'DELETE' })
                        .then(() => tr.remove())
                        .catch(err => console.error("Erro ao excluir produto:", err));
                });
                return;
            }
        });

        // 3. Filtro em tempo real por busca de texto e categoria
        if (this.inputSearchProduct) {
            this.inputSearchProduct.addEventListener('input', () => this.filterTable());
        }

        if (this.selectTypeProduct) {
            this.selectTypeProduct.addEventListener('change', () => this.filterTable());
        }
    }

    init() {
        this.addEvents();
        return this;
    }
}