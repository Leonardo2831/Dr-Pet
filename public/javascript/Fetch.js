export default class Fetch {
    classModalErro = 'error';
    classModalSucess = 'success';

    constructor(url, selectorModalInfo){
        this.url = url;
        this.modalInfo = document.querySelector(selectorModalInfo);
    }

    showModalError(err){
        if(this.modalInfo) {
            this.modalInfo.classList.add(this.classModalErro);
            this.modalInfo.classList.remove(this.classModalSucess);

            this.modalInfo.textContent = 'Houve um erro ao carregar os dados!';
            console.error(err);
        }
    }

    showModalSuccess(){
        if(this.modalInfo) {
            this.modalInfo.classList.remove(this.classModalErro);
            this.modalInfo.classList.add(this.classModalSucess);

            this.modalInfo.textContent = 'Os dados foram carregados com sucesso!';
        }
    }

    async get(){
        try{
            const response = await fetch(this.url);
            const data = await response.json();
            
            this.showModalSuccess();
            return data;
        } catch(err) {
            this.showModalError(err);
        } finally {
            setTimeout(() => {
                this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
            }, 5000);
        }
    }

    async post(){}

    async put(){}

    async delete(){}
}