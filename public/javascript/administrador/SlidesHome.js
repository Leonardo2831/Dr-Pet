import Fetch from "../utils/Fetch.js";
import structSlide from "./components/structSlide.js";
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';

export default class SlidesHome{
    constructor(selectorLabelAdd, contentSlide){
        this.labelAdd = document.querySelector(selectorLabelAdd);
        this.contentSlide = document.querySelector(contentSlide);

        this.saveImage = this.saveImage.bind(this);

        this.fetchJson = new Fetch('slides-home', '[data-modal-info="adm"]');
    }

    slidesInit(){
        this.fetchJson.get().then((imagesBlob) => {
            if(Array.isArray(imagesBlob)) {
                imagesBlob.sort((a, b) => a.order - b.order);
                imagesBlob.forEach((imageBlob) => {
                    const figure = structSlide(imageBlob);
                    this.labelAdd.before(figure, this.labelAdd);
                });
            }

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
                        await this.fetchJson.patch(id, { order: index + 1 });
                    }
                }
            })
        });
    }

    async saveImage(){
        const input = this.labelAdd.querySelector('input');
        const inputFile = input.files[0];
        if(!inputFile) {
            console.error('Nenhum arquivo selecionado!');
            return;
        }

        const slides = await this.fetchJson.get();
        const maxOrder = Array.isArray(slides) && slides.length > 0 ? Math.max(...slides.map(s => s.order || s.ordem || 0)) : 0;

        const formData = new FormData();
        formData.append('image', inputFile);
        formData.append('alt', inputFile.name);
        formData.append('ordem', maxOrder + 1);

        const response = await this.fetchJson.post(formData);
        if (response && response.ok) {
            const newSlide = await response.json();
            const figure = structSlide(newSlide);
            this.labelAdd.before(figure, this.labelAdd);
        }
        input.value = '';
    }

    addEvents(){
        this.labelAdd.addEventListener('change', this.saveImage);
    }

    init(){
        if(this.labelAdd && this.contentSlide){
            this.slidesInit();
            this.addEvents();
        }

        return this;
    }
}