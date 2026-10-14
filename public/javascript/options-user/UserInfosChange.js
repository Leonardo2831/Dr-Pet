import formatPhone from "../utils/formatPhone.js";
import buscarCEP from "../utils/viaCEP.js";
import PopUp from "../utils/Pop-up.js";
import CheckFunction from "../utils/CheckFunction.js";

const confirm = new CheckFunction();

export default class UserInfosChange {
    constructor() {
        this.popups = [];
    }

    initModals() {
        // Modais de dados pessoais
        const personalModals = [
            { button: '[data-button="openEditEmail"]', modal: '[data-modal="editEmail"]', close: '[data-button="closeEditEmail"]' },
            { button: '[data-button="openEditTelefone"]', modal: '[data-modal="editTelefone"]', close: '[data-button="closeEditTelefone"]' },
            { button: '[data-button="openEditSenha"]', modal: '[data-modal="editSenha"]', close: '[data-button="closeEditSenha"]' },
            { button: '[data-button="editarNome"]', modal: '[data-modal="editName"]', close: '[data-button="closeEditName"]' }
        ];

        personalModals.forEach(config => {
            const popup = new PopUp(config.button, config.modal, config.close).init();
            this.popups.push(popup);

            const closeBtn = document.querySelector(config.close);
            if (closeBtn) {
                closeBtn.addEventListener('click', (event) => {
                    if (event && event.preventDefault) event.preventDefault();
                    popup.closeModal();
                });
            }
        });

        // Ouvinte global para qualquer botão de fechar (X) e clique fora
        document.addEventListener('click', (event) => {
            const closeBtn = event.target.closest('[data-button^="close"]');
            if (closeBtn) {
                const modal = closeBtn.closest('[data-modal]');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                return;
            }

            if (event.target && event.target.hasAttribute && event.target.hasAttribute('data-modal')) {
                event.target.classList.add('hidden');
                event.target.classList.remove('flex');
            }
        });

        // Configuração dos modais de Endereço e Pet
        this.initAddressModal();
        this.initPetModal();
    }

    initAddressModal() {
        const modalAddress = document.querySelector('[data-modal="addAddress"]');
        const formAddress = document.querySelector('[data-form="addAddress"]');
        const titleAddress = document.querySelector('[data-title="modalAddress"]') || modalAddress?.querySelector('h3');
        const submitBtnText = document.querySelector('[data-button-text="saveAddress"]') || document.querySelector('[data-button="saveAddress"] span');
        const btnAddAddress = document.querySelector('[data-button="address"]');
        const btnCloseAddress = document.querySelector('[data-button="closeFormAddress"]');
        const popupAddress = document.querySelector('[data-popup="options-address"]');

        const openModalAddress = () => {
            if (!modalAddress) return;
            modalAddress.classList.remove('hidden');
            modalAddress.classList.add('flex');
        };

        const closeModalAddress = () => {
            if (!modalAddress) return;
            modalAddress.classList.add('hidden');
            modalAddress.classList.remove('flex');
        };

        // Botão "Adicionar endereço"
        if (btnAddAddress && formAddress) {
            btnAddAddress.addEventListener('click', (event) => {
                event.preventDefault();
                formAddress.reset();
                formAddress.action = '/option-user/create-address';
                if (titleAddress) titleAddress.textContent = 'Adicionar Endereço';
                if (submitBtnText) submitBtnText.textContent = 'Salvar Endereço';
                openModalAddress();
            });
        }

        if (btnCloseAddress) {
            btnCloseAddress.addEventListener('click', closeModalAddress);
        }
        if (modalAddress) {
            modalAddress.addEventListener('click', (event) => {
                if (event.target === modalAddress) closeModalAddress();
            });
        }

        const btnEditAddress = document.querySelector('[data-button="editAddress"]');
        if (btnEditAddress) {
            btnEditAddress.addEventListener('click', () => {
                const addressId = popupAddress?.dataset.currentId;
                const card = document.querySelector(`#address-container [data-id="${addressId}"]`);
                if (!card) return;

                if (popupAddress) {
                    popupAddress.classList.add('hidden');
                    popupAddress.classList.remove('flex');
                }

                if (formAddress) {
                    formAddress.action = `/option-user/update-address/${addressId}`;
                }
                if (titleAddress) titleAddress.textContent = 'Editar Endereço';
                if (submitBtnText) submitBtnText.textContent = 'Salvar alterações';

                const ruaInput = document.querySelector('[data-input="rua"]');
                const numInput = document.querySelector('[data-input="numero"]');
                const cepInput = document.querySelector('[data-input="cep"]');
                const cidInput = document.querySelector('[data-input="cidade"]');
                const estInput = document.querySelector('[data-input="estado"]');
                const baiInput = document.querySelector('[data-input="bairro"]');
                const telInput = document.querySelector('[data-input="telefoneAddress"]');

                if (ruaInput) ruaInput.value = card.dataset.rua || '';
                if (numInput) numInput.value = card.dataset.numero || '';
                if (cepInput) cepInput.value = card.dataset.cep || '';
                if (cidInput) cidInput.value = card.dataset.cidade || '';
                if (estInput) estInput.value = card.dataset.estado || '';
                if (baiInput) baiInput.value = card.dataset.bairro || '';
                if (telInput) telInput.value = card.dataset.telefone || '';

                openModalAddress();
            });
        }

        const btnDeleteAddress = document.querySelector('[data-button="deleteAddress"]');
        if (btnDeleteAddress) {
            btnDeleteAddress.addEventListener('click', () => {
                const addressId = popupAddress?.dataset.currentId;
                const card = document.querySelector(`#address-container [data-id="${addressId}"]`);
                if (!card) return;

                if (popupAddress) {
                    popupAddress.classList.add('hidden');
                    popupAddress.classList.remove('flex');
                }

                confirm.open(async () => {
                    try {
                        const response = await fetch(`/option-user/delete-address/${addressId}`, {
                            method: 'POST',
                            headers: { 'Accept': 'application/json' }
                        });

                        if (response.ok) {
                            card.remove();
                            const container = document.querySelector('#address-container');
                            if (container && !container.querySelector('[data-id]')) {
                                container.innerHTML = '<p class="p-4 sm:p-6 lg:p-[30px] text-base sm:text-lg text-gray-700">Nenhum endereço cadastrado.</p>';
                            }
                        } else {
                            console.error('Erro ao excluir endereço.');
                        }
                    } catch (error) {
                        console.error('Erro de conexão ao excluir endereço:', error);
                    }
                });
            });
        }
    }

    initPetModal() {
        const modalPet = document.querySelector('[data-modal="addPet"]');
        const formPet = document.querySelector('[data-form="addPet"]');
        const titlePet = document.querySelector('[data-title="modalPet"]') || modalPet?.querySelector('h3');
        const submitBtnText = document.querySelector('[data-button-text="savePet"]') || document.querySelector('[data-button="savePet"] span');
        const btnAddPet = document.querySelector('[data-button="Pet"]');
        const btnClosePet = document.querySelector('[data-button="closeFormPet"]');
        const popupPet = document.querySelector('[data-popup="options-pet"]');

        const openModalPet = () => {
            if (!modalPet) return;
            modalPet.classList.remove('hidden');
            modalPet.classList.add('flex');
        };

        const closeModalPet = () => {
            if (!modalPet) return;
            modalPet.classList.add('hidden');
            modalPet.classList.remove('flex');
        };

        // Botão "Adicionar pet"
        if (btnAddPet && formPet) {
            btnAddPet.addEventListener('click', (event) => {
                event.preventDefault();
                formPet.reset();
                formPet.action = '/option-user/create-pet';
                if (titlePet) titlePet.textContent = 'Adicionar meu Pet';
                if (submitBtnText) submitBtnText.textContent = 'Salvar meu pet';
                const defaultGender = formPet.querySelector('[data-input="petGender"][value="macho"]');
                if (defaultGender) defaultGender.checked = true;
                openModalPet();
            });
        }

        if (btnClosePet) {
            btnClosePet.addEventListener('click', closeModalPet);
        }
        if (modalPet) {
            modalPet.addEventListener('click', (event) => {
                if (event.target === modalPet) closeModalPet();
            });
        }

        const btnEditPet = document.querySelector('[data-button="editPet"]');
        if (btnEditPet) {
            btnEditPet.addEventListener('click', () => {
                const petId = popupPet?.dataset.currentId;
                const card = document.querySelector(`#pet-container [data-id="${petId}"]`);
                if (!card) return;

                if (popupPet) {
                    popupPet.classList.add('hidden');
                    popupPet.classList.remove('flex');
                }

                if (formPet) {
                    formPet.action = `/option-user/update-pet/${petId}`;
                }
                if (titlePet) titlePet.textContent = 'Editar meu Pet';
                if (submitBtnText) submitBtnText.textContent = 'Salvar alterações';

                const nameInput = document.querySelector('[data-input="petName"]');
                const raceInput = document.querySelector('[data-input="petRace"]');
                const descInput = document.querySelector('[data-input="petDescription"]');

                if (nameInput) nameInput.value = card.dataset.nome || '';
                if (raceInput) raceInput.value = card.dataset.raca || '';
                if (descInput) descInput.value = card.dataset.descricao || '';

                const genderRadio = document.querySelector(`[data-input="petGender"][value="${card.dataset.genero}"]`);
                if (genderRadio) genderRadio.checked = true;

                openModalPet();
            });
        }

        const btnDeletePet = document.querySelector('[data-button="deletePet"]');
        if (btnDeletePet) {
            btnDeletePet.addEventListener('click', () => {
                const petId = popupPet?.dataset.currentId;
                const card = document.querySelector(`#pet-container [data-id="${petId}"]`);
                if (!card) return;

                if (popupPet) {
                    popupPet.classList.add('hidden');
                    popupPet.classList.remove('flex');
                }

                confirm.open(async () => {
                    try {
                        const response = await fetch(`/option-user/delete-pet/${petId}`, {
                            method: 'POST',
                            headers: { 'Accept': 'application/json' }
                        });

                        if (response.ok) {
                            card.remove();
                            const container = document.querySelector('#pet-container');
                            if (container && !container.querySelector('[data-id]')) {
                                container.innerHTML = '<p class="p-4 sm:p-6 lg:p-[30px] text-base sm:text-lg text-gray-700">Nenhum pet cadastrado.</p>';
                            }
                        } else {
                            console.error('Erro ao excluir pet.');
                        }
                    } catch (error) {
                        console.error('Erro de conexão ao excluir pet:', error);
                    }
                });
            });
        }
    }

    initCEPLookup() {
        const inputCEP = document.querySelector('[data-input="cep"]');
        if (!inputCEP) return;

        inputCEP.addEventListener('blur', async () => {
            const address = await buscarCEP(inputCEP.value);
            if (!address) return;

            const fields = {
                rua: document.querySelector('[data-input="rua"]'),
                bairro: document.querySelector('[data-input="bairro"]'),
                cidade: document.querySelector('[data-input="cidade"]'),
                estado: document.querySelector('[data-input="estado"]'),
            };

            if (fields.rua && !fields.rua.value) fields.rua.value = address.rua;
            if (fields.bairro && !fields.bairro.value) fields.bairro.value = address.bairro;
            if (fields.cidade) fields.cidade.value = address.cidade;
            if (fields.estado) fields.estado.value = address.estado;

            document.querySelector('[data-input="numero"]')?.focus();
        });
    }

    initPhoneMask() {
        formatPhone('[data-input="editTelefone"]');
        formatPhone('[data-input="telefoneAddress"]');
    }

    initTabPersistence() {
        const returnSection = sessionStorage.getItem('option-user-return-section');
        if (returnSection) {
            sessionStorage.removeItem('option-user-return-section');
            document.querySelectorAll('main section[id]').forEach(section => section.classList.add('hidden'));
            document.getElementById(returnSection)?.classList.remove('hidden');
        }

        document.querySelector('[data-form="addAddress"]')?.addEventListener('submit', () => {
            sessionStorage.setItem('option-user-return-section', 'Endereco');
        });
        document.querySelector('[data-form="addPet"]')?.addEventListener('submit', () => {
            sessionStorage.setItem('option-user-return-section', 'dados-pet');
        });

        ['editEmail', 'editTelefone', 'editSenha'].forEach(form => {
            document.querySelector(`[data-form="${form}"]`)?.addEventListener('submit', () => {
                sessionStorage.setItem('option-user-return-section', 'dados-pessoais');
            });
        });

        document.querySelector('[data-form="editName"]')?.addEventListener('submit', () => {
            sessionStorage.setItem('option-user-return-section', 'menu-inicial');
        });
    }

    init() {
        this.initModals();
        this.initCEPLookup();
        this.initPhoneMask();
        this.initTabPersistence();
        return this;
    }
}