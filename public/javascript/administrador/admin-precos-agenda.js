import Fetch from '../Fetch.js'; // Ajuste o caminho se necessário

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastrar-precos');

    form.addEventListener('submit', async (event) => {
        

        const servicoSelecionado = document.getElementById('servico-select').value;
        const novoTempo = document.getElementById('tempo-input').value;
        const novoPreco = parseFloat(document.getElementById('preco-input').value);

        const fetchPrecos = new Fetch('precos');

        try {
            event.preventDefault();
            let precosAtuais = await fetchPrecos.get();

            precosAtuais[servicoSelecionado] = {
                time: novoTempo,
                price: novoPreco
            };


            await fetch('http://localhost:3000/precos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(precosAtuais)
            });

            alert('Preço e tempo atualizados com sucesso!');

            document.getElementById('tempo-input').value = '';
            document.getElementById('preco-input').value = '';
            
        } catch (error) {
            console.error('Erro ao atualizar os dados:', error);
            alert('Houve um erro ao atualizar os preços.');
        }
    });
});