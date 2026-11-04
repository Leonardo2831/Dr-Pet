import { lerEndereco, preencherEndereco, limparEndereco, aoAlterarEndereco } from '../../utils/enderecoCEP.js';

export default function setupQuickSelectors() {
    const nomePetInput = document.getElementById('nomePet');
    const petIdInput = document.getElementById('petId');

    const enderecoButtons = Array.from(document.querySelectorAll('.btn-escolha-endereco'));
    const petButtons = Array.from(document.querySelectorAll('.btn-escolha-pet'));
    const outroEnderecoBtn = document.getElementById('btn-outro-endereco');
    const outroPetBtn = document.getElementById('btn-outro-pet');

    const activeClasses = ['bg-green-600', 'text-white', 'border-green-600', 'shadow-sm'];
    const inactiveStandardClasses = ['bg-white', 'text-gray-700', 'border-gray-300', 'hover:border-green-500', 'hover:bg-green-50/50'];
    const inactiveDashedClasses = ['bg-white', 'text-gray-600', 'border-dashed', 'border-gray-400', 'hover:border-green-600', 'hover:text-green-700', 'hover:bg-green-50'];

    function activateButton(btn, group) {
        group.forEach(b => {
            b.classList.remove(...activeClasses);
            if (b.id === 'btn-outro-endereco' || b.id === 'btn-outro-pet') {
                b.classList.remove('border-solid');
                b.classList.add(...inactiveDashedClasses);
            } else {
                b.classList.add(...inactiveStandardClasses);
            }
        });

        if (btn) {
            btn.classList.remove(...inactiveStandardClasses, ...inactiveDashedClasses);
            btn.classList.add(...activeClasses);
        }
    }

    // === Lógica dos Botões de Endereço ===
    if (enderecoButtons.length > 0) {
        const CAMPOS_SALVOS = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'complemento'];
        const doBotao = (btn) => Object.fromEntries(CAMPOS_SALVOS.map((c) => [c, btn.dataset[c] || '']));
        const normalizar = (campo, valor) => (campo === 'cep' ? String(valor).replace(/\D/g, '') : String(valor).trim().toLowerCase());

        enderecoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn === outroEnderecoBtn) {
                    limparEndereco();
                } else {
                    preencherEndereco(doBotao(btn));
                }
                activateButton(btn, enderecoButtons);
            });
        });

        // Se o usuário editar os campos, destaca o endereço salvo que ainda for igual (ou "Outro endereço")
        aoAlterarEndereco(() => {
            const atual = lerEndereco();
            const salvoIgual = enderecoButtons.find((btn) => {
                if (btn === outroEnderecoBtn) return false;
                const salvo = doBotao(btn);
                return CAMPOS_SALVOS.every((c) => normalizar(c, atual[c]) === normalizar(c, salvo[c]));
            });

            activateButton(salvoIgual || outroEnderecoBtn, enderecoButtons);
        });
    }

    // === Lógica dos Botões de Pet ===
    if (petButtons.length > 0 && nomePetInput) {
        petButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn === outroPetBtn) {
                    activateButton(btn, petButtons);
                    nomePetInput.value = '';
                    if (petIdInput) petIdInput.value = '';
                    nomePetInput.placeholder = 'Digite o nome do pet...';
                    nomePetInput.focus();
                } else {
                    const nome = btn.getAttribute('data-pet-nome');
                    const petId = btn.getAttribute('data-pet-id');

                    if (nome) nomePetInput.value = nome;
                    if (petIdInput && petId) petIdInput.value = petId;

                    activateButton(btn, petButtons);
                }
            });
        });

        // Sincronizar ao digitar manualmente no campo de pet
        nomePetInput.addEventListener('input', () => {
            const currentNome = nomePetInput.value.trim().toLowerCase();
            let matched = false;

            petButtons.forEach(btn => {
                if (btn !== outroPetBtn) {
                    const pNome = (btn.getAttribute('data-pet-nome') || '').trim().toLowerCase();
                    if (pNome && pNome === currentNome) {
                        activateButton(btn, petButtons);
                        if (petIdInput) {
                            petIdInput.value = btn.getAttribute('data-pet-id') || '';
                        }
                        matched = true;
                    }
                }
            });

            if (!matched) {
                if (petIdInput) petIdInput.value = '';
                if (outroPetBtn) {
                    activateButton(outroPetBtn, petButtons);
                }
            }
        });
    }
}
