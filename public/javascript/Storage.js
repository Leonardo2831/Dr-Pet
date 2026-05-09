export default class Storage{
    static setValueStorage(key, value){
        if(key && value){
            localStorage.setItem(key, JSON.stringify(value));
        }
    } 

    static getValueStorage(key){
        if(localStorage.getItem(key)){
            return JSON.parse(localStorage.getItem(key));
        }
    }

    static removeItemStorage(key){
        if(localStorage.getItem(key)){
            localStorage.removeItem(key);
        }
    }
}