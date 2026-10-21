import { clickOutside } from "../utils/clickOutside.js";
import Fetch from "../utils/Fetch.js";
import formatPrice from "../utils/formatPrice.js";

export default class FormProduct {
    constructor(selectorModal, selectorForm, selectorButtonClose,
        selectorInputName, selectorSelectCategory, selectorInputPrice, selectorAreaShortDescription, selectorAreaLongDescription, 
        selectorEditorLongDescription,
        selectorInputMainImage, selectorInputSlideImages, selectorInfoMainImage, selectorInfoSlideImages, selectorButtonCreateProduct) {
        
        this.modalProduct = document.querySelector(selectorModal);
        this.formProduct = document.querySelector(selectorForm);
        this.buttonCloseForm = document.querySelector(selectorButtonClose);
        this.buttonCreateProduct = document.querySelector(selectorButtonCreateProduct);

        this.inputName = document.querySelector(selectorInputName);
        this.selectCategory = document.querySelector(selectorSelectCategory);
        this.inputPrice = document.querySelector(selectorInputPrice);
        this.areaShortDescription = document.querySelector(selectorAreaShortDescription);
        this.areaLongDescription = document.querySelector(selectorAreaLongDescription);
        this.editorLongDescription = document.querySelector(selectorEditorLongDescription);

        this.quillLong = null;
        this.longDescriptionMaxLength = 1000;

        // Imagem Principal
        this.inputMainImage = document.querySelector(selectorInputMainImage);
        this.placeholderMain = document.querySelector('[data-placeholder="product-main-image"]');
        this.previewWrapperMain = document.querySelector('[data-preview-wrapper="product-main-image"]');
        this.previewImgMain = document.querySelector('[data-preview-img="product-main-image"]');
        this.infoWrapperMain = document.querySelector('[data-info-wrapper="product-main-image"]');
        this.infoMainImage = document.querySelector(selectorInfoMainImage);
        this.removeBtnMain = document.querySelector('[data-remove-img="product-main-image"]');
        this.labelMain = document.querySelector('label[for="input-main-image"]');
        this.mainImageState = null; 

        // Imagens do Slide
        this.inputSlideImages = document.querySelector(selectorInputSlideImages);
        this.labelSlide = document.querySelector('label[for="input-slide-images"]');
        this.slideGallery = document.querySelector('[data-slide-gallery]');
        this.slideCountBadge = document.querySelector('[data-slide-count-badge]');
        this.infoSlidesImages = document.querySelector(selectorInfoSlideImages);
        this.slideImagesList = []; 
        this.draggedSlideIndex = null;

        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');

        this.openForm = this.openForm.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.initCreateProduct = this.initCreateProduct.bind(this);
        this.handleMainImageChange = this.handleMainImageChange.bind(this);
        this.handleSlideImagesChange = this.handleSlideImagesChange.bind(this);
    }

    handleEditorChange(quill, oldDelta, hiddenField, maxLength) {
        if (!quill || !hiddenField) return;

        if (quill.getLength() - 1 > maxLength) {
            quill.updateContents(oldDelta); 
        }

        hiddenField.value = this.getEditorHtml(quill);
    }

    getEditorHtml(quill) {
        if (!quill) return '';
        const html = quill.root.innerHTML.trim();
        return html === '<p><br></p>' ? '' : html;
    }

    getEditorValue(quill, hiddenField) {
        if (quill) {
            return this.getEditorHtml(quill).trim();
        }
        return hiddenField?.value.trim() ?? '';
    }

    initEditor() {
        if (!window.Quill || this.quillLong) return;
        
        if (this.editorLongDescription) {
            this.quillLong = new Quill(this.editorLongDescription, {
                theme: 'snow',
                placeholder: 'Digite uma descrição detalhada para o produto (máximo de 1000 caracteres)...',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ header: [1, 2, 3, false] }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link']
                    ]
                }
            });
            this.quillLong.root.style.fontSize = '1.125rem';
            this.quillLong.on('text-change', (delta, oldDelta) => {
                this.handleEditorChange(this.quillLong, oldDelta, this.areaLongDescription, this.longDescriptionMaxLength);
            });
        }
    }

    getLabelFile(input) {
        if (!input || !input.id) return null;
        return this.formProduct?.querySelector(`label[for="${input.id}"]`) ?? null;
    }

    // --- GERENCIAMENTO DA IMAGEM PRINCIPAL ---
    handleMainImageFile(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.mainImageState = {
                file,
                base64: e.target.result,
                name: file.name,
                isExisting: false
            };
            this.renderMainImagePreview();
        };
        reader.readAsDataURL(file);
    }

    handleMainImageChange() {
        const file = this.inputMainImage?.files && this.inputMainImage.files[0];
        if (file) {
            this.handleMainImageFile(file);
        }
    }

    resetMainImage() {
        this.mainImageState = null;
        if (this.inputMainImage) this.inputMainImage.value = '';
        this.renderMainImagePreview();
    }

    renderMainImagePreview() {
        if (this.mainImageState && (this.mainImageState.base64 || this.mainImageState.url)) {
            if (this.previewImgMain) {
                this.previewImgMain.src = this.mainImageState.base64 || this.mainImageState.url;
            }
            if (this.placeholderMain) {
                this.placeholderMain.classList.add('hidden');
                this.placeholderMain.classList.remove('flex');
            }
            if (this.previewWrapperMain) {
                this.previewWrapperMain.classList.remove('hidden');
                this.previewWrapperMain.classList.add('flex');
            }
            if (this.infoMainImage) {
                this.infoMainImage.textContent = `✔ ${this.mainImageState.name || 'Imagem selecionada'}`;
            }
            if (this.infoWrapperMain) {
                this.infoWrapperMain.classList.remove('hidden');
                this.infoWrapperMain.classList.add('flex');
            }
        } else {
            if (this.previewImgMain) this.previewImgMain.src = '';
            if (this.previewWrapperMain) {
                this.previewWrapperMain.classList.add('hidden');
                this.previewWrapperMain.classList.remove('flex');
            }
            if (this.placeholderMain) {
                this.placeholderMain.classList.remove('hidden');
                this.placeholderMain.classList.add('flex');
            }
            if (this.infoWrapperMain) {
                this.infoWrapperMain.classList.add('hidden');
                this.infoWrapperMain.classList.remove('flex');
            }
            if (this.infoMainImage) {
                this.infoMainImage.textContent = '';
            }
        }
    }

    // --- GERENCIAMENTO DE SLIDES (MÚLTIPLAS IMAGENS + REORDENAÇÃO) ---
    async handleSlideFiles(files) {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(f => f.type && f.type.startsWith('image/'));
        if (validFiles.length === 0) {
            alert('Nenhum arquivo de imagem válido encontrado.');
            return;
        }

        for (const file of validFiles) {
            await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.slideImagesList.push({
                        id: null,
                        file,
                        base64: e.target.result,
                        alt: file.name,
                        isExisting: false
                    });
                    resolve();
                };
                reader.onerror = () => resolve();
                reader.readAsDataURL(file);
            });
        }

        if (this.inputSlideImages) this.inputSlideImages.value = '';
        this.renderSlideGallery();
    }

    handleSlideImagesChange() {
        if (this.inputSlideImages && this.inputSlideImages.files) {
            this.handleSlideFiles(this.inputSlideImages.files);
        }
    }

    moveSlide(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.slideImagesList.length) return;
        if (toIndex < 0 || toIndex >= this.slideImagesList.length) return;

        const item = this.slideImagesList.splice(fromIndex, 1)[0];
        this.slideImagesList.splice(toIndex, 0, item);
        this.renderSlideGallery();
    }

    removeSlide(index) {
        if (index < 0 || index >= this.slideImagesList.length) return;
        this.slideImagesList.splice(index, 1);
        this.renderSlideGallery();
    }

    renderSlideGallery() {
        if (!this.slideGallery) return;

        const count = this.slideImagesList.length;

        // Atualiza badge e texto informativo
        if (this.slideCountBadge) {
            if (count > 0) {
                this.slideCountBadge.textContent = `${count} slide${count > 1 ? 's' : ''}`;
                this.slideCountBadge.classList.remove('hidden');
            } else {
                this.slideCountBadge.classList.add('hidden');
            }
        }

        if (this.infoSlidesImages) {
            if (count > 0) {
                this.infoSlidesImages.textContent = `✔ ${count} foto(s) no slide`;
                this.infoSlidesImages.classList.remove('hidden');
            } else {
                this.infoSlidesImages.textContent = '';
                this.infoSlidesImages.classList.add('hidden');
            }
        }

        if (count === 0) {
            this.slideGallery.innerHTML = `
                <p data-slide-empty class="text-sm text-gray-400 mx-auto text-center py-4">
                    Nenhum slide adicionado ainda. Adicione fotos acima para montar o slide do produto.
                </p>
            `;
            return;
        }

        this.slideGallery.innerHTML = '';

        this.slideImagesList.forEach((slide, index) => {
            const card = document.createElement('div');
            card.className = 'slide-card group/slide relative flex-shrink-0 w-[130px] sm:w-[150px] bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-green-500 transition-all flex flex-col overflow-hidden cursor-grab active:cursor-grabbing';
            card.draggable = true;
            card.dataset.slideIndex = String(index);

            const imgSrc = slide.base64 || slide.url || '';
            const isFirst = index === 0;
            const isLast = index === count - 1;

            card.innerHTML = `
                <!-- Badge de Ordem -->
                <div class="absolute top-1.5 left-1.5 z-10 bg-black/70 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow">
                    #${index + 1}
                </div>

                <!-- Botão Remover Slide -->
                <button type="button" data-action="remove-slide" data-index="${index}"
                    title="Remover este slide"
                    class="absolute top-1.5 right-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/95 hover:bg-red-500 hover:text-white text-gray-700 shadow transition-colors text-xs font-bold leading-none">
                    ✕
                </button>

                <!-- Miniatura -->
                <div class="w-full h-[95px] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src="${imgSrc}" alt="${slide.alt || 'Slide'}" class="w-full h-full object-cover pointer-events-none" />
                </div>

                <!-- Barra de Ordenação -->
                <div class="flex items-center justify-between p-1.5 bg-gray-50 border-t border-gray-100">
                    <button type="button" data-action="move-left" data-index="${index}"
                        title="Mover para esquerda"
                        ${isFirst ? 'disabled' : ''}
                        class="p-1 rounded hover:bg-green-100 text-gray-600 hover:text-green-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors font-bold text-xs">
                        ◀
                    </button>
                    <span class="text-[11px] text-gray-600 font-semibold truncate max-w-[65px]">
                        Slide ${index + 1}
                    </span>
                    <button type="button" data-action="move-right" data-index="${index}"
                        title="Mover para direita"
                        ${isLast ? 'disabled' : ''}
                        class="p-1 rounded hover:bg-green-100 text-gray-600 hover:text-green-700 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors font-bold text-xs">
                        ▶
                    </button>
                </div>
            `;

            // Eventos de Drag and Drop para reordenar
            card.addEventListener('dragstart', (e) => {
                this.draggedSlideIndex = index;
                card.classList.add('opacity-40');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', String(index));
                }
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('opacity-40');
                this.draggedSlideIndex = null;
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (this.draggedSlideIndex !== null && this.draggedSlideIndex !== index) {
                    card.classList.add('border-green-600', 'bg-green-50');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('border-green-600', 'bg-green-50');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('border-green-600', 'bg-green-50');
                if (this.draggedSlideIndex !== null && this.draggedSlideIndex !== index) {
                    this.moveSlide(this.draggedSlideIndex, index);
                }
            });

            this.slideGallery.appendChild(card);
        });
    }

    markErrors() {
        if (!this.inputName?.value.trim()) {
            this.inputName?.classList.add('error');
            this.inputName.addEventListener('click', () => this.inputName.classList.remove('error'));
        }
        if (!this.selectCategory?.value) {
            this.selectCategory?.classList.add('error');
            this.selectCategory.addEventListener('click', () => this.selectCategory.classList.remove('error'));
        }
        if (!(Number(this.inputPrice?.value.replace(/\D/g, '')) > 0)) {
            this.inputPrice?.classList.add('error');
            this.inputPrice.addEventListener('click', () => this.inputPrice.classList.remove('error'));
        }
        if (!this.areaShortDescription?.value.trim()) {
            this.areaShortDescription?.classList.add('error');
            this.areaShortDescription.addEventListener('click', () => this.areaShortDescription.classList.remove('error'));
        }
        if (!this.areaLongDescription?.value.trim()) {
            const longValue = this.getEditorValue(this.quillLong, this.areaLongDescription);
            if (!longValue) {
                this.areaLongDescription?.classList.add('error');
                const editorWrapper = this.editorLongDescription?.closest('.quill-wrapper');
                if (editorWrapper) editorWrapper.classList.add('error');
            }
        }
            
        const labelMainImage = this.getLabelFile(this.inputMainImage);
        const hasMain = this.mainImageState && (this.mainImageState.base64 || this.mainImageState.url);
        if (!hasMain) {
            labelMainImage?.classList.add('error');
            labelMainImage?.addEventListener('click', () => labelMainImage.classList.remove('error'));
        }

        const labelSlideImages = this.getLabelFile(this.inputSlideImages);
        if (this.slideImagesList.length === 0) {
            labelSlideImages?.classList.add('error');
            labelSlideImages?.addEventListener('click', () => labelSlideImages.classList.remove('error'));
        }
    }

    verifyInputs() {
        const hasName = this.inputName?.value.trim() !== '';
        const hasCategory = this.selectCategory?.value !== '';
        const hasPrice = Number(this.inputPrice?.value.replace(',', '.').replace('R$', '')) > 0;
        const hasShortDescription = this.areaShortDescription?.value.trim() !== '';
        const hasLongDescription = this.getEditorValue(this.quillLong, this.areaLongDescription) !== '';
        const hasMainImage = Boolean(this.mainImageState && (this.mainImageState.base64 || this.mainImageState.url));
        const hasSlideImages = this.slideImagesList.length > 0;

        return hasName && hasCategory && hasPrice && hasShortDescription && hasLongDescription && hasMainImage && hasSlideImages;
    }

    async createObjectProduct() {
        let imageMainData = null;
        if (this.mainImageState) {
            if (this.mainImageState.base64) {
                imageMainData = {
                    image: this.mainImageState.base64,
                    alt: this.inputName.value.trim()
                };
            } else if (this.mainImageState.isExisting) {
                imageMainData = {
                    isExisting: true,
                    url: this.mainImageState.url,
                    alt: this.inputName.value.trim()
                };
            }
        }

        const slidesData = this.slideImagesList.map((item, index) => ({
            id: item.id || null,
            image: item.base64 || item.url,
            alt: item.alt || `${this.inputName.value.trim()} - Slide ${index + 1}`,
            ordem: index + 1
        }));

        return {
            name: this.inputName.value.trim(),
            category: this.selectCategory.value,
            price: Number(this.inputPrice.value.replace(',', '.').replace('R$', '')),
            shortDescription: this.areaShortDescription.value.trim(),
            longDescription: this.getEditorValue(this.quillLong, this.areaLongDescription),
            imageMain: imageMainData,
            imagesSlide: slidesData
        };
    }

    async initCreateProduct() {
        if (this.verifyInputs()) {
            const idProduct = this.buttonCreateProduct.getAttribute('data-id');
            const createObject = await this.createObjectProduct();

            if (idProduct) {
                createObject.id = idProduct;
                await this.fetchJson.put(idProduct, createObject);
            } else {
                await this.fetchJson.post(createObject);
            }

            this.closeForm();
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } else {
            this.markErrors();
        }
    }

    closeForm() {
        if (!this.modalProduct) return;
        this.modalProduct.classList.add('hidden');
        this.modalProduct.classList.remove('flex');

        if (this.modalProduct._cleanupClickOutside) {
            this.modalProduct._cleanupClickOutside();
        }
        if (this.formProduct && this.formProduct._cleanupClickOutside) {
            this.formProduct._cleanupClickOutside();
        }

        if (this.formProduct) {
            this.formProduct.reset();
        }
        if (this.quillLong) {
            this.quillLong.setText('');
        }
        if (this.areaLongDescription) {
            this.areaLongDescription.value = '';
        }

        this.resetMainImage();
        this.slideImagesList = [];
        this.renderSlideGallery();

        const errorElements = this.formProduct?.querySelectorAll('.error');
        if (errorElements) {
            errorElements.forEach(el => el.classList.remove('error'));
        }
    }

    async putValuesForm(product) {
        if (!product) return;

        if (this.buttonCreateProduct) {
            this.buttonCreateProduct.setAttribute('data-id', product.id || '');
            const span = this.buttonCreateProduct.querySelector('span');
            if (span) span.textContent = 'Atualizar Produto';
        }

        const modalTitle = this.modalProduct?.querySelector('h3');
        if (modalTitle) modalTitle.textContent = 'Editar Produto';

        if (this.inputName) this.inputName.value = product.name || '';
        if (this.selectCategory) this.selectCategory.value = product.category || '';
        
        if (this.inputPrice) {
            let preco = product.price;
            if (typeof preco === 'string') {
                preco = preco.replace('R$', '').trim();
            }
            const num = parseFloat(String(preco).replace(',', '.'));
            this.inputPrice.value = !isNaN(num) ? "R$ " + num.toFixed(2).replace('.', ',') : (product.price || '');
        }

        if (this.areaShortDescription) {
            this.areaShortDescription.value = product.shortDescription || '';
        }

        if (this.quillLong) {
            if (product.longDescription && product.longDescription.trim() !== '') {
                this.quillLong.root.innerHTML = product.longDescription;
            } else {
                this.quillLong.setText('');
            }
            if (this.areaLongDescription) {
                this.areaLongDescription.value = this.getEditorHtml(this.quillLong);
            }
        } else if (this.areaLongDescription) {
            this.areaLongDescription.value = product.longDescription || '';
        }

        // Limpa estado anterior de imagens
        this.resetMainImage();
        this.slideImagesList = [];
        this.renderSlideGallery();

        // Abre o modal
        if (this.modalProduct) {
            this.modalProduct.classList.remove('hidden');
            this.modalProduct.classList.add('flex');
            if (this.formProduct) clickOutside(this.formProduct, 'click', this.closeForm);
        }

        // Carrega os dados detalhados do produto (imagens e slides) via API
        if (product.id) {
            try {
                const response = await fetch(`/produtos/${product.id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Preenche imagem principal existente
                    if (data.mainImage) {
                        this.mainImageState = {
                            url: data.mainImage,
                            name: 'Imagem principal preservada',
                            isExisting: true
                        };
                        this.renderMainImagePreview();
                    }

                    // Preenche slides existentes e renderiza a galeria com ordenação
                    if (data.imagesSlide && Array.isArray(data.imagesSlide)) {
                        this.slideImagesList = data.imagesSlide.map((s, idx) => ({
                            id: s.id,
                            url: s.url,
                            alt: s.alt || `Slide ${idx + 1}`,
                            ordem: s.ordem || (idx + 1),
                            isExisting: true
                        }));
                        this.renderSlideGallery();
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes do produto:", err);
            }
        }
    }

    openForm() {
        this.closeForm();

        if (this.buttonCreateProduct) {
            this.buttonCreateProduct.setAttribute('data-id', '');
            const span = this.buttonCreateProduct.querySelector('span');
            if (span) span.textContent = 'Cadastrar Produto';
        }
        const modalTitle = this.modalProduct?.querySelector('h3');
        if (modalTitle) modalTitle.textContent = 'Adicionar Novo Produto';

        if (!this.modalProduct) return;
        this.modalProduct.classList.remove('hidden');
        this.modalProduct.classList.add('flex');

        if (this.formProduct) clickOutside(this.formProduct, 'click', this.closeForm);
    }

    addEvents() {
        if (this.buttonCloseForm) {
            this.buttonCloseForm.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeForm();
            });
        }
        if (this.modalProduct) {
            this.modalProduct.addEventListener('click', (event) => {
                if (event.target === this.modalProduct) {
                    this.closeForm();
                }
            });
        }

        // Imagem Principal
        if (this.inputMainImage) {
            this.inputMainImage.addEventListener('change', this.handleMainImageChange);
        }
        if (this.removeBtnMain) {
            this.removeBtnMain.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetMainImage();
            });
        }
        if (this.labelMain) {
            ['dragenter', 'dragover'].forEach(evt => {
                this.labelMain.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.labelMain.classList.add('border-green-600', 'bg-green-50');
                });
            });
            ['dragleave', 'drop'].forEach(evt => {
                this.labelMain.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.labelMain.classList.remove('border-green-600', 'bg-green-50');
                });
            });
            this.labelMain.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                if (dt && dt.files && dt.files.length > 0) {
                    this.handleMainImageFile(dt.files[0]);
                }
            });
        }

        // Imagens do Slide
        if (this.inputSlideImages) {
            this.inputSlideImages.addEventListener('change', this.handleSlideImagesChange);
        }
        if (this.labelSlide) {
            ['dragenter', 'dragover'].forEach(evt => {
                this.labelSlide.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.labelSlide.classList.add('border-green-600', 'bg-green-50');
                });
            });
            ['dragleave', 'drop'].forEach(evt => {
                this.labelSlide.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.labelSlide.classList.remove('border-green-600', 'bg-green-50');
                });
            });
            this.labelSlide.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                if (dt && dt.files && dt.files.length > 0) {
                    this.handleSlideFiles(dt.files);
                }
            });
        }

        // Delegação de cliques na galeria de slides (remover, mover esquerda, mover direita)
        if (this.slideGallery) {
            this.slideGallery.addEventListener('click', (e) => {
                const target = e.target.closest('button[data-action]');
                if (!target) return;

                e.preventDefault();
                e.stopPropagation();

                const action = target.getAttribute('data-action');
                const idx = parseInt(target.getAttribute('data-index'), 10);

                if (isNaN(idx)) return;

                if (action === 'remove-slide') {
                    this.removeSlide(idx);
                } else if (action === 'move-left') {
                    this.moveSlide(idx, idx - 1);
                } else if (action === 'move-right') {
                    this.moveSlide(idx, idx + 1);
                }
            });
        }

        if (this.inputPrice) this.inputPrice.addEventListener('input', () => formatPrice(this.inputPrice));
        if (this.buttonCreateProduct) this.buttonCreateProduct.addEventListener('click', this.initCreateProduct);
    }

    init() {
        this.initEditor();
        if (this.modalProduct && this.formProduct) {
            this.addEvents();
        }

        return this;
    }
}