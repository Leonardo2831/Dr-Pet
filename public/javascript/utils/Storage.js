export default class Storage{
    static set(key, value){
        if(key && value){
            localStorage.setItem(key, JSON.stringify(value));
        }
    } 

    static get(key){
        if(localStorage.getItem(key)){
            return JSON.parse(localStorage.getItem(key));
        }
    }

    static delete(key){
        if(localStorage.getItem(key)){
            localStorage.removeItem(key);
        }
    }
}