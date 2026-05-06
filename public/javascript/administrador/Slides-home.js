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
                    this.labelAdd.before(figure, this.labelAdd);
                });
            }
        });
    }

    // necessário, pois o json server não aceita o salvamento de um blob (defeito: fica 33% mais pesado no arquivo, pois transforma esse binário em uma string)
    readFile(inputFile){
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                // o reader pega o endereço do arquivo e salva seu valor na memória
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);

                // valor da memória que o arquivo ficou salvo transforma em string base64
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
        
        const objectImage = {
            // cria um id único e seguro que o javascript moderno traz
            id: crypto.randomUUID(),
            altImage: inputFile.name,
            image: imageBase64
        };

        console.log(objectImage);

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