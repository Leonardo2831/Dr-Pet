export default class Fetch {
    classModalErro = 'error';
    classModalSucess = 'success';

    constructor(urlFinal, selectorModalInfo){
        this.url = 'http://localhost:3000/' + urlFinal;
        this.modalInfo = document.querySelector(selectorModalInfo);
    }

    showModalError(err, messageErr){
        if(this.modalInfo) {
            this.modalInfo.classList.add(this.classModalErro);
            this.modalInfo.classList.remove(this.classModalSucess);

            this.modalInfo.textContent = messageErr;
            console.error(err);
        }
    }

    showModalSuccess(message){
        if(this.modalInfo) {
            this.modalInfo.classList.remove(this.classModalErro);
            this.modalInfo.classList.add(this.classModalSucess);

            this.modalInfo.textContent = message;
        }
    }

    async get(){
        try{
            const response = await fetch(this.url);
            const data = await response.json();
            
            if (data && Object.keys(data).length > 0) {
                this.showModalSuccess('Os dados foram carregados com sucesso!');
            }

            return data;
        } catch(err) {
            this.showModalError(err, 'Houve um erro ao carregar os dados!');
        } finally {
            setTimeout(() => {
                this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
            }, 5000);
        }
    }

    async post(object){
        try{
            const response = await fetch(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(object),
            });
            
            this.showModalSuccess('Os dados foram enviados com sucesso!');
            return response;
        } catch(err) {
            this.showModalError(err, 'Houve um erro ao enviar os dados!');
        } finally {
            setTimeout(() => {
                this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
            }, 5000);
        }
    }

    async put(id, object){}

    async delete(id){
        try{
            const response = await fetch(`${this.url}/${id}`, {
                method: "DELETE",
            });
            
            this.showModalSuccess('Os dados foram deletados com sucesso!');
            return response;
        } catch(err) {
            this.showModalError(err, 'Houve um erro ao deletar os dados!');
        } finally {
            setTimeout(() => {
                this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
            }, 5000);
        }
    }
}