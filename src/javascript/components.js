// Construtor para selecionar itens
/** 
 * @param {string} mode Modo de seleção: '1' para o um elemento, 'all' para todos.
 * @param {string} value seletor para pegar o item
 * @return {Element|NodeList} elemento único ou lista de elementos
*/
export function Select(mode, value){

    if(mode === 'all'){
        return document.querySelectorAll(value);
    } else if(mode == '1'){
        return document.querySelector(value);
    } else {
        throw new Error("Modo inválido. Use '1' ou 'all'.");
    }

}