import Fetch from "../utils/Fetch.js";
import structSlide from "./components/structSlide.js";
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';
import CheckFunction from "../utils/CheckFunction.js";

const confirm = new CheckFunction();

export default class SlidesHome {
    constructor(selectorLabelAdd, contentSlide) {
        this.labelAdd = document.querySelector(selectorLabelAdd);
        this.contentSlide = document.querySelector(contentSlide);

        this.saveImage = this.saveImage.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);

        this.fetchJson = new Fetch('slides-home', '[data-modal-info="adm"]');
    }

    slidesInit() {
        
        this.contentSlide.addEventListener('drop', (e) => {
            e.preventDefault();
        });

        Sortable.create(this.contentSlide, {
            animation: 150,
            filter: '[data-add-slide]',
            onEnd: async (event) => {
                const figures = this.contentSlide.querySelectorAll('[data-content-slides]');
                for (const [index, figure] of [...figures].entries()) {
                    const id = figure.getAttribute('data-content-slides');
                    await this.fetchJson.patch(id, { ordem: index + 1 });
                }
            }
        });
    }

    async saveImage() {
        const fileInput = this.labelAdd.querySelector('input');
        const inputFile = fileInput ? fileInput.files[0] : null;
        if(!inputFile) return;
        const slides = await this.fetchJson.get();
        const maxOrder = Array.isArray(slides) && slides.length > 0 
            ? Math.max(...slides.map(s => s.ordem || 0)) 
            : 0;

        const formData = new FormData();
        formData.append('slideImage', inputFile);
        formData.append('alt', inputFile.name);
        formData.append('ordem', maxOrder + 1);

        try {
            const response = await fetch('/slides-home', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                
                const newSlide = {
                    id: result.id,
                    alt: inputFile.name,
                    ordem: maxOrder + 1
                };

                const figure = structSlide(newSlide);
                this.labelAdd.before(figure);
                if (fileInput) fileInput.value = '';
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    }

    handleDeleteClick(e) {
        const deleteBtn = e.target.closest('.delete-slide-btn, .delete-btn');
        if (!deleteBtn) return;

        e.preventDefault();

        const figure = deleteBtn.closest('figure[data-content-slides]') || deleteBtn.closest('[data-content-slides]');
        const id = deleteBtn.getAttribute('data-id') || figure?.getAttribute('data-content-slides');
        if (!id) return;

        confirm.open(async () => {
            try {
                const response = await this.fetchJson.delete(id);
                if (!response || response.ok) {
                    if (figure) {
                        figure.remove();
                    }
                }
            } catch (error) {
                console.error('Erro na requisição de exclusão:', error);
            }
        });
    }

    addEvents() {
        if (this.labelAdd) {
            const fileInput = this.labelAdd.querySelector('input');
            if (fileInput) {
                fileInput.addEventListener('change', this.saveImage);
            }
        }

        if (this.contentSlide) {
            this.contentSlide.addEventListener('click', this.handleDeleteClick);
        }
    }

    init() {
        if (this.labelAdd && this.contentSlide) {
            this.slidesInit();
            this.addEvents();
        }
        return this;
    }
}