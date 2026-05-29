import Fetch from "../../utils/Fetch.js";
import formatPhone from "../../utils/formatPhone.js";
import Storage from "../../utils/Storage.js";

export default async function fillForm(form) {
    const userId = Storage.get('user-id');
    if (!userId) return;

    const fetchUser = new Fetch('usuarios', null);

    const userData = await fetchUser.get(userId);
    if (!userData) return;

    const inputNome = form.querySelector('#nome');
    const inputTelefone = form.querySelector('#telefone');
    const inputEndereco = form.querySelector('#endereco');
    const inputNomePet = form.querySelector('#nomePet');

    if (inputNome && userData.userName) {
        inputNome.value = userData.userName;
    }

    if (inputTelefone && userData.phone) {
        inputTelefone.value = userData.phone;
        formatPhone('[data-input="formatPhone"]');
    }

    if (inputEndereco && userData.address?.length > 0) {
        const addr = userData.address[0];
        const parts = [addr.rua, addr.numero, addr.bairro, addr.cidade, addr.estado].filter(Boolean);
        inputEndereco.value = parts.join(', ');
    }

    if (inputNomePet && userData.pets?.length > 0) {
        inputNomePet.value = userData.pets[0].name;
    }
}