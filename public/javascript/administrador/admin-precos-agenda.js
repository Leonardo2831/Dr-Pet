import formatPrice from '../utils/formatPrice.js';

function formatTime(input) {
    if (!input) return;
    const digits = input.value.replace(/\D/g, '');
    if (!digits) {
        input.value = '';
        return;
    }
    input.value = digits + ' min';

    // define onde cursor vai estar antes de " min"
    const cursorPosition = digits.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
}

function setupImageUpload(inputId, key) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const placeholder = document.querySelector(`[data-placeholder="${key}"]`);
    const previewWrapper = document.querySelector(`[data-preview-wrapper="${key}"]`);
    const previewImg = document.querySelector(`[data-preview-img="${key}"]`);
    const infoWrapper = document.querySelector(`[data-info-wrapper="${key}"]`);
    const infoText = document.querySelector(`[data-info="${inputId}"]`);
    const removeBtn = document.querySelector(`[data-remove-img="${key}"]`);
    const label = document.querySelector(`label[for="${inputId}"]`);

    function reset() {
        input.value = '';
        if (previewImg) previewImg.src = '';
        if (previewWrapper) {
            previewWrapper.classList.add('hidden');
            previewWrapper.classList.remove('flex');
        }
        if (placeholder) {
            placeholder.classList.remove('hidden');
            placeholder.classList.add('flex');
        }
        if (infoWrapper) {
            infoWrapper.classList.add('hidden');
            infoWrapper.classList.remove('flex');
        }
        if (infoText) {
            infoText.textContent = '';
        }
    }

    input._resetImageUpload = reset;

    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WEBP, etc).');
                reset();
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImg) previewImg.src = e.target.result;
                if (placeholder) {
                    placeholder.classList.add('hidden');
                    placeholder.classList.remove('flex');
                }
                if (previewWrapper) {
                    previewWrapper.classList.remove('hidden');
                    previewWrapper.classList.add('flex');
                }
                if (infoText) {
                    infoText.textContent = `✔ ${file.name}`;
                }
                if (infoWrapper) {
                    infoWrapper.classList.remove('hidden');
                    infoWrapper.classList.add('flex');
                }
            };
            reader.readAsDataURL(file);
        } else {
            reset();
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            reset();
        });
    }

    // Suporte para Drag and Drop na área do label
    if (label) {
        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                label.classList.add('border-green-600', 'bg-green-50');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                label.classList.remove('border-green-600', 'bg-green-50');
            }, false);
        });

        label.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    const form = input.closest('form');
    if (form) {
        form.addEventListener('reset', () => {
            setTimeout(reset, 10);
        });
    }
}

export default function adminPrecosAgenda() {
    // Inputs da Atualização de Serviço
    const inputPriceAtualizar = document.getElementById('preco-input');
    const inputTimeAtualizar = document.getElementById('tempo-input');

    // Inputs do Cadastro de Novo Serviço
    const inputPriceNovo = document.getElementById('novo-servico-preco');
    const inputTimeNovo = document.getElementById('novo-servico-duracao');

    if (inputPriceAtualizar) {
        inputPriceAtualizar.addEventListener('input', () => formatPrice(inputPriceAtualizar));
    }
    if (inputTimeAtualizar) {
        inputTimeAtualizar.addEventListener('input', () => formatTime(inputTimeAtualizar));
    }

    if (inputPriceNovo) {
        inputPriceNovo.addEventListener('input', () => formatPrice(inputPriceNovo));
    }
    if (inputTimeNovo) {
        inputTimeNovo.addEventListener('input', () => formatTime(inputTimeNovo));
    }

    // Configura upload, preview dinâmico e confirmação das imagens de serviços
    setupImageUpload('novo-servico-imagem', 'novo-servico');
    setupImageUpload('atualizar-servico-imagem', 'atualizar-servico');

    const selectServico = document.getElementById('servico-select');
    if (selectServico) {
        selectServico.addEventListener('change', () => {
            const atualizarInput = document.getElementById('atualizar-servico-imagem');
            if (atualizarInput && typeof atualizarInput._resetImageUpload === 'function') {
                atualizarInput._resetImageUpload();
            }
        });
    }
}