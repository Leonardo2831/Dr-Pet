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

        this.inputMainImage = document.querySelector(selectorInputMainImage);
        this.inputSlideImages = document.querySelector(selectorInputSlideImages);
        this.infoMainImage = document.querySelector(selectorInfoMainImage);
        this.infoSlidesImages = document.querySelector(selectorInfoSlideImages);

        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');

        this.openForm = this.openForm.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.showNameFileMain = this.showNameFileMain.bind(this);
        this.showCountFilesSlide = this.showCountFilesSlide.bind(this);
        this.initCreateProduct = this.initCreateProduct.bind(this);
    }

    handleEditorChange(quill, oldDelta, hiddenField, maxLength) {
        if (!quill || !hiddenField) return;

        if (quill.getLength() - 1 > maxLength) {
            quill.updateContents(oldDelta); 
        }

        hiddenField.value = this.getEditorHtml(quill);
    }

    // validação para evitar que tenha quebra de linhas apenas no quill
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
        if (!input.id) return null;
        return this.formProduct?.querySelector(`label[for="${input.id}"].cursor-pointer`) ?? null;
    }

    markErrors() {
        if (!this.inputName?.value.trim()) {
            this.inputName?.classList.add('error');
            this.inputName.addEventListener('click', () => {
                this.inputName.classList.remove('error');
            });
        }
        if (!this.selectCategory?.value) {
            this.selectCategory?.classList.add('error');
            this.selectCategory.addEventListener('click', () => {
                this.selectCategory.classList.remove('error');
            });
        }
        if (!(Number(this.inputPrice?.value.replace(/\D/g, '')) > 0)) {
            this.inputPrice?.classList.add('error');
            this.inputPrice.addEventListener('click', () => {
                this.inputPrice.classList.remove('error');
            });
        }
        if (!this.areaShortDescription?.value.trim()) {
            this.areaShortDescription?.classList.add('error');
            this.areaShortDescription.addEventListener('click', () => {
                this.areaShortDescription.classList.remove('error');
            });
        }
        if (!this.areaLongDescription?.value.trim()) {
            const longValue = this.getEditorValue(this.quillLong, this.areaLongDescription);
            if (!longValue) {
                this.areaLongDescription?.classList.add('error');
                const editorWrapper = this.editorLongDescription?.closest('.quill-wrapper');
                if (editorWrapper) editorWrapper.classList.add('error');
                if (this.editorLongDescription) {
                    this.editorLongDescription.classList.add('error');
                    const clearError = () => {
                        this.editorLongDescription.classList.remove('error');
                        if (editorWrapper) editorWrapper.classList.remove('error');
                    };
                    this.editorLongDescription.addEventListener('click', clearError, { once: true });
                    if (this.quillLong) this.quillLong.once('text-change', clearError);
                }
            }
        }
            
        const labelMainImage = this.getLabelFile(this.inputMainImage);
        if (!(this.inputMainImage?.files.length > 0)) {
            labelMainImage?.classList.add('error');
            labelMainImage?.addEventListener('click', () => {
                labelMainImage.classList.remove('error');
            });
        }
        const labelSlideImages = this.getLabelFile(this.inputSlideImages);
        if (!(this.inputSlideImages?.files.length > 0)) {
            labelSlideImages?.classList.add('error');
            labelSlideImages?.addEventListener('click', () => {
                labelSlideImages.classList.remove('error');
            });
        }
    }

    verifyInputs() {
        const hasName = this.inputName?.value.trim() !== '';
        const hasCategory = this.selectCategory?.value !== '';
        const hasPrice = Number(this.inputPrice?.value.replace(',', '.').replace('R$', '')) > 0;
        const hasShortDescription = this.areaShortDescription?.value.trim() !== '';
        const hasLongDescription = this.getEditorValue(this.quillLong, this.areaLongDescription) !== '';
        const hasMainImage = this.inputMainImage?.files.length > 0;
        const hasSlideImages = this.inputSlideImages?.files.length > 0;

        return hasName && hasCategory && hasPrice && hasShortDescription && hasLongDescription && hasMainImage && hasSlideImages;
    }

    transformImagesBase64(images) {
        return Promise.all(
            images.map(image => {
                return new Promise((resolve, reject) => {
                    try {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (err) => reject(err);
                        reader.readAsDataURL(image);
                    } catch (error) {
                        reject(error);
                    }
                });
            })
        );
    }

    transformOneImageBase64(image) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(image);
            } catch (error) {
                reject(error);
            }
        });
    }

    async createObjectProduct() {
        return {
            id: crypto.randomUUID(),
            name: this.inputName.value.trim(),
            category: this.selectCategory.value,
            price: Number(this.inputPrice.value.replace(',', '.').replace('R$', '')),
            shortDescription: this.areaShortDescription.value.trim(),
            longDescription:  this.getEditorValue(this.quillLong, this.areaLongDescription),
            imageMain: {
                image: await this.transformOneImageBase64(this.inputMainImage.files[0]),
                alt: this.inputMainImage.files[0].name
            },
            imagesSlide: [
                ...(await this.transformImagesBase64(Array.from(this.inputSlideImages.files))).map((image, index) => {
                    return {
                        image,
                        alt: this.inputSlideImages.files[index].name
                    };
                })
            ]
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
        } else {
            this.markErrors();
        }
    }

    showCountFilesSlide() {
        const count = this.inputSlideImages.files.length;
        if (count > 0) {
            this.infoSlidesImages.textContent = `✔ ${count} imagem(ns) selecionada(s)`;
            this.infoSlidesImages.classList.remove('hidden');
        } else {
            this.infoSlidesImages.textContent = '';
            this.infoSlidesImages.classList.add('hidden');
        }
    }

    showNameFileMain() {
        if (this.inputMainImage.files.length > 0) {
            this.infoMainImage.textContent = `✔ ${this.inputMainImage.files[0].name}`;
            this.infoMainImage.classList.remove('hidden');
        } else {
            this.infoMainImage.textContent = '';
            this.infoMainImage.classList.add('hidden');
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
        if (this.infoMainImage) {
            this.infoMainImage.textContent = '';
            this.infoMainImage.classList.add('hidden');
        }
        if (this.infoSlidesImages) {
            this.infoSlidesImages.textContent = '';
            this.infoSlidesImages.classList.add('hidden');
        }
        const errorElements = this.formProduct?.querySelectorAll('.error');
        if (errorElements) {
            errorElements.forEach(el => el.classList.remove('error'));
        }
    }

    putValuesForm(product) {
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

        if (!this.modalProduct) return;
        this.modalProduct.classList.remove('hidden');
        this.modalProduct.classList.add('flex');

        if (this.formProduct) clickOutside(this.formProduct, 'click', this.closeForm);
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
        if (this.inputMainImage && this.infoMainImage) this.inputMainImage.addEventListener('change', this.showNameFileMain);
        if (this.inputSlideImages && this.infoSlidesImages) this.inputSlideImages.addEventListener('change', this.showCountFilesSlide);
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