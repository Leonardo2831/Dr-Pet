// classe para selecionar itens
export class Select{
    
    /**
     * Seleciona o primeiro elemento que casa com o seletor.
     * @param {string} value seletor CSS para selecionar o elemento
     * @returns {HTMLElement | null}
    */
    single(value){
        return document.querySelector(value);
    }

    /**
     * Seleciona todos os elementos que casam com o seletor.
     * @param {string} value seletor CSS para selecionar o elemento
     * @returns {NodeListOf<HTMLElement>}
    */
    all(value){
        return document.querySelectorAll(value);
    }

}