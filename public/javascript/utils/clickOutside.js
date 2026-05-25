/**
 * 
 * @param {Element | null} element - elemento que foi clicado
 * @param {Function} callback 
 */
export function clickOutside(element, eventUser, callback){
    const html = document.documentElement;
    const dataOutside = 'data-outside';

    if(!element.hasAttribute(dataOutside)){
        setTimeout(() => {
            html.addEventListener(eventUser, handleOutside);
        });
        element.setAttribute(dataOutside, '');
    }
        
    function handleOutside(event){
        if(!element.contains(event.target)){
            element.removeAttribute(dataOutside);
            html.removeEventListener(eventUser, handleOutside);
            callback();
        }
    }
}