import Fetch from "../Fetch.js";
import structSlide from "./components/structSlide.js";

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
                imagesBlob.forEach((imageBlob) => {
                    const figure = structSlide(imageBlob);
                    this.labelAdd.before(this.labelAdd, figure);
                });
            }
        });
    }

    saveImage(){
        const inputFile = this.labelAdd.querySelector('input').files[0];
        if(!inputFile) {
            console.error('Nenhum arquivo selecionado!');
            return;
        }

        const objectImage = {
            // cria um id único e seguro que o javascript moderno traz
            id: crypto.randomUUID(),
            image: inputFile,
            altImage: inputFile.name
        };
        this.fetchJson.post(objectImage, "application/json");
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