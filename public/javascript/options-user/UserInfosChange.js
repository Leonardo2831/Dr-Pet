import Storage from "../Storage.js";

export default class UserInfosChange{
    constructor(selectorButtonSaveEmail, selectorButtonSavePhone, selectorButtonSavePassword,
        selectorInputEditEmail, selectorInputEditPhone, selectorInputEditPassword, userData, fetchUser
    ){
        this.buttonSaveEmail = document.querySelector(selectorButtonSaveEmail);
        this.buttonSavePhone = document.querySelector(selectorButtonSavePhone);
        this.buttonSavePassword = document.querySelector(selectorButtonSavePassword);
        this.buttonSaveAddress = document.querySelector('[data-button="saveAddress"]');

        this.inputEditEmail = document.querySelector(selectorInputEditEmail);
        this.inputEditPhone = document.querySelector(selectorInputEditPhone);
        this.inputEditPassword = document.querySelector(selectorInputEditPassword);

        this.buttonAddAddress = document.querySelector('[data-button="address"]');
        this.modalAddAddress = document.querySelector('[data-modal="addAddress"]');


        this.saveEmail = this.saveEmail.bind(this);
        this.savePhone = this.savePhone.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveAddress = this.saveAddress.bind(this);

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

    async saveAddress() {
        const newStreet = document.querySelector('[data-input="rua"]').value;
        const newNumber = document.querySelector('[data-input="numero"]').value;
        const newCEP = document.querySelector('[data-input="cep"]').value;
        const newCity = document.querySelector('[data-input="cidade"]').value;
        const newState = document.querySelector('[data-input="estado"]').value;
        const newHood = document.querySelector('[data-input="bairro"]').value;
        const contact = document.querySelector('[data-input="telefoneAddress"]').value;

        const newAddress = {
            id: crypto.randomUUID(),
            rua: newStreet,
            numero: newNumber,
            cep: newCEP,
            cidade: newCity,
            estado: newState,
            bairro: newHood,
            telefone: contact
        };
        const editId = this.buttonSaveAddress.dataset.editId;
    
        if(editId) {
            const index = this.userData.address.findIndex(a => a.id === editId);
            this.userData.address[index] = { id: editId, rua: newStreet, numero: newNumber, cep: newCEP, cidade: newCity, estado: newState, bairro: newHood, telefone: contact};
            await this.fetchUser.put(this.userId, this.userData);
            delete this.buttonSaveAddress.dataset.editId;
        } else {
            this.userData.address.push(newAddress);
            await this.fetchUser.put(this.userId, this.userData);
        }
    }



    addEventsSave(){
        if(this.buttonSaveEmail) this.buttonSaveEmail.addEventListener('click', this.saveEmail);
        if(this.buttonSavePhone) this.buttonSavePhone.addEventListener('click', this.savePhone);
        if(this.buttonSavePassword) this.buttonSavePassword.addEventListener('click', this.savePassword);
        if(this.buttonAddAddress) this.buttonAddAddress.addEventListener('click', () => {
            this.modalAddAddress.classList.remove('hidden');
            this.modalAddAddress.classList.add('flex');
        })

        if(this.buttonSaveAddress) this.buttonSaveAddress.addEventListener('click', this.saveAddress);

        document.querySelector('[data-button="closeFormAddress"]').addEventListener('click', () => {
            const modal = document.querySelector('[data-modal="addAddress"]');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

    }


    init(){
        if(this.inputEditEmail && this.inputEditPassword && this.inputEditPhone){
            this.addEventsSave();
            this.loadDataUser();
        }

        return this;
    }

    


}
