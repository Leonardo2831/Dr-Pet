export default class ChangeAvatar {
    constructor(selectorInput) {
        this.input = document.querySelector(selectorInput);
        if (this.input) {
            this.image = this.input.closest('figure')?.querySelector('img:first-of-type');
        }
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
                const dataUrl = e.target.result;
                if (this.image) {
                    this.image.src = dataUrl;
                }
                try {
                    await fetch('/option-user/update-avatar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: dataUrl })
                    });
                } catch (err) {
                    console.error('Erro ao atualizar avatar no servidor:', err);
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (this.image) {
                this.image.src = "/images/icons/options/user-default.svg";
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