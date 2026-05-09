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

    async get(id = ""){
        try{
            const response = await fetch(`${this.url}${id ? "/" + id : ""}`);
            const data = await response.json();
            
            if (data && Object.keys(data).length > 0) {
                this.showModalSuccess('Os dados foram carregados com sucesso!');
            }

            return data;
        } catch(err) {
            this.showModalError(err, 'Houve um erro ao carregar os dados!');
        } finally {
            setTimeout(() => {
                if(this.modalInfo) {
                    this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
                }
            }, 1500);
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
                if(this.modalInfo) {
                    this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
                }
            }, 1500);
        }
    }

    async put(id, object){
        try {
            const response = await fetch(`${this.url}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(object),
            });
            
            this.showModalSuccess('Os dados foram atualizados com sucesso!');
            return response;
        } catch(err) {
            this.showModalError(err, 'Houve um erro ao atualizar os dados!');
        } finally {
            setTimeout(() => {
                if(this.modalInfo) {
                    this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
                }
            }, 1500);
        }
    }

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
                if(this.modalInfo) {
                    this.modalInfo.classList.remove(this.classModalErro, this.classModalSucess);
                }
            }, 1500);
        }
    }
}