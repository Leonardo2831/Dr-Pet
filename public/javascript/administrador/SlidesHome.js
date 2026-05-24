import Fetch from "../Fetch.js";
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

    readFile(inputFile){
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);

                
                reader.readAsDataURL(inputFile);
            } catch (error) {
                reject(error);
            }
        });
    }

    async saveImage(){
        // pego endereço do arquivo no computador
        const inputFile = this.labelAdd.querySelector('input').files[0];
        if(!inputFile) {
            console.error('Nenhum arquivo selecionado!');
            return;
        }

        const imageBase64 = await this.readFile(inputFile);
        if(!imageBase64) {
            console.error('Erro na leitura do arquivo!');
            return;
        }
        
        const slides = await this.fetchJson.get();
        const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : 0;
        
        const objectImage = {
            id: crypto.randomUUID(),
            altImage: inputFile.name,
            image: imageBase64,
            order:  maxOrder + 1
        };

        this.fetchJson.post(objectImage);
        structSlide(objectImage);
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