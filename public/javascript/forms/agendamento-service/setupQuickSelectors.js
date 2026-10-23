export default function setupQuickSelectors() {
    const enderecoInput = document.getElementById('endereco');
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
    if (enderecoButtons.length > 0 && enderecoInput) {
        enderecoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn === outroEnderecoBtn) {
                    activateButton(btn, enderecoButtons);
                    enderecoInput.value = '';
                    enderecoInput.placeholder = 'Digite o endereço completo...';
                    enderecoInput.focus();
                } else {
                    const enderecoCompleto = btn.getAttribute('data-endereco-completo');
                    if (enderecoCompleto) {
                        enderecoInput.value = enderecoCompleto;
                    }
                    activateButton(btn, enderecoButtons);
                }
            });
        });

        // Sincronizar ao digitar manualmente no campo de endereço
        enderecoInput.addEventListener('input', () => {
            const currentVal = enderecoInput.value.trim().toLowerCase();
            let matched = false;

            enderecoButtons.forEach(btn => {
                if (btn !== outroEnderecoBtn) {
                    const endComp = (btn.getAttribute('data-endereco-completo') || '').trim().toLowerCase();
                    if (endComp && endComp === currentVal) {
                        activateButton(btn, enderecoButtons);
                        matched = true;
                    }
                }
            });

            if (!matched && outroEnderecoBtn) {
                activateButton(outroEnderecoBtn, enderecoButtons);
            }
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
