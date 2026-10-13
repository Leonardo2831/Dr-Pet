export default class ChangeAvatar {
    constructor(selectorInput) {
        this.input = document.querySelector(selectorInput);
        if (this.input) {
            this.image = this.input.closest('figure').querySelector('img:first-of-type');
        }
        this.changeImage = this.changeImage.bind(this);
    }

    async changeImage(event) {
        const files = event.target.files;
        
        if (files && files.length > 0) {
            const file = files[0];
            
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um formato de imagem válido.');
                this.input.value = ''; 
                return;
            }

            // Preview instantâneo via BLOB URL
            if (this.image) {
                this.image.src = URL.createObjectURL(file);
            }

            // Envio direto do arquivo como BLOB via FormData
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('/option-user/update-avatar', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    console.error('Falha ao salvar avatar no servidor.');
                }
            } catch (err) {
                console.error('Erro ao atualizar avatar:', err);
            }
        } else {
            if (this.image) {
                this.image.src = "/images/icons/options/user-default.svg";
            }
            try {
                await fetch('/option-user/remove-avatar', { method: 'POST' });
            } catch (err) {
                console.error('Erro ao remover avatar:', err);
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