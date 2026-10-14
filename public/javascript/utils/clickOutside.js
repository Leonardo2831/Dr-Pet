/**
 * 
 * @param {Element | null} element - elemento que foi clicado
 * @param {Function} callback 
 */
export function clickOutside(element, eventUser, callback){
    if (!element) return;

    const html = document.documentElement;
    const dataOutside = 'data-outside';

    if (element._cleanupClickOutside) {
        element._cleanupClickOutside();
    }

    function handleOutside(event){
        if(!element.contains(event.target)){
            cleanup();
            callback();
        }
    }

    function cleanup(){
        element.removeAttribute(dataOutside);
        html.removeEventListener(eventUser, handleOutside);
        element._cleanupClickOutside = null;
    }

    element._cleanupClickOutside = cleanup;

    setTimeout(() => {
        if (element.hasAttribute(dataOutside)) {
            html.addEventListener(eventUser, handleOutside);
        }
    });
    element.setAttribute(dataOutside, '');
}