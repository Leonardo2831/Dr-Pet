import { clickOutside } from "../clickOutside.js";
import Fetch from "../Fetch.js";
export default class FormProduct {
    constructor(selectorModal, selectorForm, selectorButtonClose,
        selectorInputName, selectorSelectCategory, selectorInputPrice, selectorAreaShortDescription, selectorAreaLongDescription,
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

        this.inputMainImage = document.querySelector(selectorInputMainImage);
        this.inputSlideImages = document.querySelector(selectorInputSlideImages);
        this.infoMainImage = document.querySelector(selectorInfoMainImage);
        this.infoSlidesImages = document.querySelector(selectorInfoSlideImages);

        this.fetchJson = new Fetch('produtos', '[data-modal-info="adm"]');

        this.openFormCreate = this.openFormCreate.bind(this);
        this.closeFormCreate = this.closeFormCreate.bind(this);
        this.showNameFileMain = this.showNameFileMain.bind(this);
        this.showCountFilesSlide = this.showCountFilesSlide.bind(this);
        this.formatInputPrice = this.formatInputPrice.bind(this);
        this.initCreateProduct = this.initCreateProduct.bind(this);
    }

    // Pega o label estilizado, pois o input do estilo file está escondido
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
            this.areaLongDescription?.classList.add('error');
            this.areaLongDescription.addEventListener('click', () => {
                this.areaLongDescription.classList.remove('error');
            });
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
        const hasLongDescription = this.areaLongDescription?.value.trim() !== '';
        const hasMainImage = this.inputMainImage?.files.length > 0;
        const hasSlideImages = this.inputSlideImages?.files.length > 0;

        return hasName && hasCategory && hasPrice && hasShortDescription && hasLongDescription && hasMainImage && hasSlideImages;
    }

    transformImagesBase64(images){
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

    transformOneImageBase64(image){
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

    async createObjectProduct(){
        return {
            id: crypto.randomUUID(),
            name: this.inputName.value.trim(),
            category: this.selectCategory.value,
            price: Number(this.inputPrice.value.replace(',', '.').replace('R$', '')),
            shortDescription: this.areaShortDescription.value.trim(),
            longDescription: this.areaLongDescription.value.trim(),
            imageMain: await this.transformOneImageBase64(this.inputMainImage.files[0]),
            imagesSlide: await this.transformImagesBase64(Array.from(this.inputSlideImages.files))
        };
    }

    async initCreateProduct() {
        if (this.verifyInputs()) {
            await this.fetchJson.post(await this.createObjectProduct());
            this.closeFormCreate();
        } else {
            this.markErrors();
        }
    }

    formatInputPrice() {
        const valueInput = this.inputPrice.value.replace(/\D/g, '');;
        this.inputPrice.value = "R$ " + (Number(valueInput) / 100).toFixed(2).replace('.', ',');
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

    closeFormCreate() {
        if (!this.modalProduct) return;
        this.modalProduct.classList.add('hidden');
        this.modalProduct.classList.remove('flex');

        if (this.formProduct) {
            this.formProduct.reset();
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

    openFormCreate() {
        if (!this.modalProduct) return;
        this.modalProduct.classList.remove('hidden');
        this.modalProduct.classList.add('flex');

        if (this.formProduct) clickOutside(this.formProduct, 'click', this.closeFormCreate);
    }

    addEvents() {
        if (this.buttonCloseForm) this.buttonCloseForm.addEventListener('click', this.closeFormCreate);
        if (this.inputMainImage && this.infoMainImage) this.inputMainImage.addEventListener('change', this.showNameFileMain);
        if (this.inputSlideImages && this.infoSlidesImages) this.inputSlideImages.addEventListener('change', this.showCountFilesSlide);
        if (this.inputPrice) this.inputPrice.addEventListener('input', this.formatInputPrice);
        if (this.buttonCreateProduct) this.buttonCreateProduct.addEventListener('click', this.initCreateProduct);
    }

    init() {
        if (this.modalProduct && this.formProduct) {
            this.addEvents();
        }

        return this;
    }
}