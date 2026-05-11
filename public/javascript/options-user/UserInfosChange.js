import Storage from "../Storage.js";

export default class UserInfosChange{
    constructor(selectorButtonSaveEmail, selectorButtonSavePhone, selectorButtonSavePassword,
        selectorInputEditEmail, selectorInputEditPhone, selectorInputEditPassword, userData, fetchUser
    ){
        this.buttonSaveEmail = document.querySelector(selectorButtonSaveEmail);
        this.buttonSavePhone = document.querySelector(selectorButtonSavePhone);
        this.buttonSavePassword = document.querySelector(selectorButtonSavePassword);

        this.inputEditEmail = document.querySelector(selectorInputEditEmail);
        this.inputEditPhone = document.querySelector(selectorInputEditPhone);
        this.inputEditPassword = document.querySelector(selectorInputEditPassword);

        this.saveEmail = this.saveEmail.bind(this);
        this.savePhone = this.savePhone.bind(this);
        this.savePassword = this.savePassword.bind(this);

        this.userId = Storage.getValueStorage('user-id');
        this.userData = userData;
        this.fetchUser = fetchUser;
    }

    loadDataUser(){
        this.inputEditEmail.value = this.userData.email;
        this.inputEditPhone.value = this.userData.phone;
        this.inputEditPassword.value = this.userData.password;
    }

    async saveEmail(){
        const newEmail = this.inputEditEmail.value;
        await this.fetchUser.put(this.userId, { ...this.userData, email: newEmail });
    }

    async savePhone(){
        const newPhone = this.inputEditPhone.value;
        await this.fetchUser.put(this.userId, { ...this.userData, phone: newPhone });
    }

    async savePassword(){
        const newPassword = this.inputEditPassword.value;
        await this.fetchUser.put(this.userId, { ...this.userData, password: newPassword });
    }

    addEventsSave(){
        if(this.buttonSaveEmail) this.buttonSaveEmail.addEventListener('click', this.saveEmail);
        if(this.buttonSavePhone) this.buttonSavePhone.addEventListener('click', this.savePhone);
        if(this.buttonSavePassword) this.buttonSavePassword.addEventListener('click', this.savePassword);
    }

    init(){
        if(this.inputEditEmail && this.inputEditPassword && this.inputEditPhone){
            this.addEventsSave();
            this.loadDataUser();
        }

        return this;
    }
}
