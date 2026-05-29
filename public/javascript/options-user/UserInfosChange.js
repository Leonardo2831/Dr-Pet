import Storage from "../utils/Storage.js";
import formatPhone from "../utils/formatPhone.js";
import Criptografia from "../utils/Criptografia.js";

export default class UserInfosChange{
    constructor(selectorButtonSaveEmail, selectorButtonSavePhone, selectorButtonSavePassword,
        selectorInputEditEmail, selectorInputEditPhone, selectorInputEditPassword, userData, fetchUser
    ){
        this.buttonSaveEmail = document.querySelector(selectorButtonSaveEmail);
        this.buttonSavePhone = document.querySelector(selectorButtonSavePhone);
        this.buttonSavePassword = document.querySelector(selectorButtonSavePassword);
        this.buttonSaveAddress = document.querySelector('[data-button="saveAddress"]');
        this.buttonSavePets = document.querySelector('[data-button="savePet"]');

        this.inputEditEmail = document.querySelector(selectorInputEditEmail);
        this.inputEditPhone = document.querySelector(selectorInputEditPhone);
        this.selectorInputEditPhone = selectorInputEditPhone;
        this.inputEditPassword = document.querySelector(selectorInputEditPassword);

        this.buttonAddAddress = document.querySelector('[data-button="address"]');
        this.modalAddAddress = document.querySelector('[data-modal="addAddress"]');

        this.buttonAddPets = document.querySelector('[data-button="Pet"]');
        this.modalAddPets = document.querySelector('[data-modal="addPet"]')

        this.buttonSaveName = document.querySelector('[data-button="saveNome"]');
        this.inputEditName = document.querySelector('[data-input="editName"]');
        this.editNameButton = document.querySelector('[data-button="editarNome"]');
        this.modalEditName = document.querySelector('[data-modal="editName"]');
        this.saveName = this.saveName.bind(this);

        this.saveEmail = this.saveEmail.bind(this);
        this.savePhone = this.savePhone.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.saveAddress = this.saveAddress.bind(this);
        this.savePets = this.savePets.bind(this);

        this.userId = Storage.get('user-id');
        this.userData = userData;
        this.fetchUser = fetchUser;
    }

    loadDataUser(){
        this.inputEditEmail.value = this.userData.email;
        this.inputEditPhone.value = this.userData.phone;
        formatPhone(this.selectorInputEditPhone);
    }

    async saveEmail(){
        const newEmail = this.inputEditEmail.value.replace(/\D/g, '');
        await this.fetchUser.put(this.userId, { ...this.userData, email: newEmail });
    }

    async savePhone(){
        const newPhone = this.inputEditPhone.value;
        await this.fetchUser.put(this.userId, { ...this.userData, phone: newPhone });
    }

    async savePassword(){
        const newPassword = this.inputEditPassword.value;
        await this.fetchUser.put(this.userId, { ...this.userData, password: Criptografia.generateHash(newPassword) });
    }

    async saveName(){
        const newName = this.inputEditName.value;
        await this.fetchUser.put(this.userId, { ...this.userData, userName: newName });
        document.querySelector('[data-info="nameUser"]').textContent = newName;
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

    async savePets(){
        const newName = document.querySelector('[data-input="petName"]').value;
        const newRace = document.querySelector('[data-input="petRace"]').value;
        const newGender = document.querySelector('[data-input="petGender"]').value;
        const newDescription = document.querySelector('[data-input="petDescription"]').value;

        const newPet = {
            id: crypto.randomUUID(),
            name: newName,
            race: newRace,
            gender: newGender,
            description: newDescription
        };
        const editId = this.buttonSavePets.dataset.editId;

        if(editId) {
            const index = this.userData.pets.findIndex(a => a.id === editId);
            this.userData.pets[index] = { id: editId, name: newName, race: newRace, gender: newGender, description: newDescription };
            await this.fetchUser.put(this.userId, this.userData);
            delete this.buttonSavePets.dataset.editId;
        } else {
            this.userData.pets.push(newPet);
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

        if(this.buttonAddPets) this.buttonAddPets.addEventListener('click', () => {
            this.modalAddPets.classList.remove('hidden');
            this.modalAddPets.classList.add('flex');
        });
        if(this.buttonSavePets) this.buttonSavePets.addEventListener('click', this.savePets);

        document.querySelector('[data-button="closeFormAddress"]').addEventListener('click', () => {
            const modal = document.querySelector('[data-modal="addAddress"]');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        document.querySelector('[data-button="closeFormPet"]').addEventListener('click', () => {
            const modal = document.querySelector('[data-modal="addPet"]');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        if(this.editNameButton) this.editNameButton.addEventListener('click', () => {
            this.inputEditName.value = this.userData.userName;
            this.modalEditName.classList.remove('hidden');
            this.modalEditName.classList.add('flex');
        });

        if(this.buttonSaveName) this.buttonSaveName.addEventListener('click', this.saveName);

        document.querySelector('[data-button="closeEditName"]').addEventListener('click', () => {
            this.modalEditName.classList.add('hidden');
            this.modalEditName.classList.remove('flex');
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
