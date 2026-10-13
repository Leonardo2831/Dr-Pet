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
        if (!window.Quill) return;
        
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
                if (this.editorLongDescription) {
                    this.editorLongDescription.classList.add('error');
                    this.editorLongDescription.addEventListener('click', () => {
                        this.editorLongDescription.classList.remove('error');
                    });
                }
            }
        }
            
        const isEditing = Boolean(this.buttonCreateProduct?.getAttribute('data-id'));
        if (!isEditing) {
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
    }

    verifyInputs() {
        const isEditing = Boolean(this.buttonCreateProduct?.getAttribute('data-id'));
        const hasName = this.inputName?.value.trim() !== '';
        const hasCategory = this.selectCategory?.value !== '';
        const hasPrice = Number(this.inputPrice?.value.replace(',', '.').replace('R$', '')) > 0;
        const hasShortDescription = this.areaShortDescription?.value.trim() !== '';
        const hasLongDescription = this.getEditorValue(this.quillLong, this.areaLongDescription) !== '';
        const hasMainImage = isEditing || (this.inputMainImage?.files.length > 0);
        const hasSlideImages = isEditing || (this.inputSlideImages?.files.length > 0);

        return hasName && hasCategory && hasPrice && hasShortDescription && hasLongDescription && hasMainImage && hasSlideImages;
    }

    createFormDataProduct() {
        const formData = new FormData();
        formData.append('name', this.inputName.value.trim());
        formData.append('category', this.selectCategory.value);
        formData.append('price', Number(this.inputPrice.value.replace(',', '.').replace('R$', '')));
        formData.append('shortDescription', this.areaShortDescription.value.trim());
        formData.append('longDescription', this.getEditorValue(this.quillLong, this.areaLongDescription));

        if (this.inputMainImage?.files?.length > 0) {
            formData.append('mainImage', this.inputMainImage.files[0]);
            formData.append('mainAltImage', this.inputMainImage.files[0].name);
        }

        if (this.inputSlideImages?.files?.length > 0) {
            Array.from(this.inputSlideImages.files).forEach((file) => {
                formData.append('slideImages', file);
            });
        }

        return formData;
    }

    async initCreateProduct() {
        if (this.verifyInputs()) {
            const idProduct = this.buttonCreateProduct.getAttribute('data-id');
            const formData = this.createFormDataProduct();

            if (idProduct) {
                await this.fetchJson.put(idProduct, formData);
            } else {
                await this.fetchJson.post(formData);
            }

            this.closeForm();
            window.location.reload();
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

        if (this.formProduct) {
            this.formProduct.reset();
        }
        if (this.quillShort) {
            this.quillShort.setText('');
            this.areaShortDescription.value = '';
        }
        if (this.quillLong) {
            this.quillLong.setText('');
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
    }

    putValuesForm(product) {
        this.buttonCreateProduct.setAttribute('data-id', product.id);
        this.buttonCreateProduct.querySelector('span').textContent = 'Atualizar Produto';
        this.inputName.value = product.name;
        this.selectCategory.value = product.category;
        this.inputPrice.value = "R$ " + Number(product.price).toFixed(2).replace('.', ',');

        if (this.quillShort) {
            this.quillShort.root.innerHTML = product.shortDescription || '';
            this.areaShortDescription.value = this.getEditorHtml(this.quillShort);
        } else {
            this.areaShortDescription.value = product.shortDescription;
        }
        if (this.quillLong) {
            this.quillLong.root.innerHTML = product.longDescription || '';
            this.areaLongDescription.value = this.getEditorHtml(this.quillLong);
        } else {
            this.areaLongDescription.value = product.longDescription;
        }
    }

    openForm() {
        this.buttonCreateProduct.setAttribute('data-id', '');
        this.buttonCreateProduct.querySelector('span').textContent = 'Cadastrar Produto';
        if (!this.modalProduct) return;
        this.modalProduct.classList.remove('hidden');
        this.modalProduct.classList.add('flex');

        if (this.formProduct) clickOutside(this.formProduct, 'click', this.closeForm);
    }

    addEvents() {
        if (this.buttonCloseForm) this.buttonCloseForm.addEventListener('click', this.closeForm);
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