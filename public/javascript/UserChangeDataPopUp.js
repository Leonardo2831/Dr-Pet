import PopUp from "./Pop-up.js"
import Fetch from "./Fetch.js";

let userData = null;

const popupEmail = new PopUp('[data-button="openEditEmail"]', '[data-modal="editEmail"]');
popupEmail.init()

const popupTelefone = new PopUp('[data-button="openEditTelefone"]', '[data-modal="editTelefone"]');
popupTelefone.init();

const popupSenha = new PopUp('[data-button="openEditSenha"]', '[data-modal="editSenha"]');
popupSenha.init();

document.querySelector('[data-button="closeEditEmail"]').addEventListener('click', () => {
    popupEmail.closeModal();
});

document.querySelector('[data-button="closeEditTelefone"]').addEventListener('click', () => {
    popupTelefone.closeModal();
});

document.querySelector('[data-button="closeEditSenha"]').addEventListener('click', () => {
    popupSenha.closeModal();
});

const userId = localStorage.getItem('user-id').replace(/[^0-9]/g, '');
const fetchUser = new Fetch(`usuarios/${userId}`, '[data-modal-info-menu="user"]');

async function carregarDados() {
    userData = await fetchUser.get();

    document.querySelector('[data-input="editEmail"]').value = userData.email;
    document.querySelector('[data-input="editTelefone"]').value = userData.phone;
    document.querySelector('[data-input="editSenha"]').value = userData.password;
    document.querySelector('[data-info="email"]').textContent = userData.email;
    document.querySelector('[data-info="telefone"]').textContent = userData.phone;
    document.querySelector('[data-info="senha"]').textContent = userData.password;
};

carregarDados();

document.querySelector('[data-button="saveEmail"]').addEventListener('click', async() => {
    const novoEmail = document.querySelector('[data-input="editEmail"]').value;
    const fetchUserEdit = new Fetch(`usuarios`, '[data-modal-info-menu="user"]');
    await fetchUserEdit.put(userId, { ...userData, email: novoEmail });
})

document.querySelector('[data-button="saveTelefone"]').addEventListener('click', async() => {
    const novoTelefone = document.querySelector('[data-input="editTelefone"]').value;
    const fetchUserEdit = new Fetch(`usuarios`, '[data-modal-info-menu="user"]');
    await fetchUserEdit.put(userId, { ...userData, phone: novoTelefone });
})

document.querySelector('[data-button="saveSenha"]').addEventListener('click', async() => {
    const novaSenha = document.querySelector('[data-input="editSenha"]').value;
    const fetchUserEdit = new Fetch(`usuarios`, '[data-modal-info-menu="user"]');
    await fetchUserEdit.put(userId, { ...userData, password: novaSenha });
})
