import Fetch from '../utils/Fetch.js';
import Storage from '../utils/Storage.js';

export default class ChangeAvatar {
    constructor(selectorInput) {
        this.input = document.querySelector(selectorInput);
        if (this.input) {
            this.image = this.input.closest('figure').querySelector('img:first-of-type');
        }
        this.fetchUser = new Fetch('usuarios', '[data-modal-info-menu="user"]');
        this.userId = Storage.get('user-id');
        this.changeImage = this.changeImage.bind(this);
    }

    changeImage(event) {
        const files = event.target.files;
        
        if (files && files.length > 0) {
            const file = files[0];
            
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um formato de imagem válido.');
                this.input.value = ''; 
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (this.image) {
                    this.image.src = e.target.result;
                }
                if (this.userId) {
                    await this.fetchUser.patch(this.userId, { avatar: e.target.result });
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (this.image) {
                this.image.src = "../images/icons/options/user-default.svg";
            }
            if (this.userId) {
                this.fetchUser.patch(this.userId, { avatar: "" });
            }
        }
    }

    init() {
        if (this.input) {
            this.input.setAttribute('accept', 'image/*');
            this.input.removeAttribute('multiple');
            this.input.addEventListener('change', this.changeImage);
        }
        return this;
    }
}