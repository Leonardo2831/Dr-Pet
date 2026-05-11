import checkInputRadioParams from "./checkInputRadioParams.js";

document.addEventListener('DOMContentLoaded', () => {
    checkInputRadioParams();
    const form = document.querySelector('form');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const formData = new FormData(form);
        const novoAgendamento = {
            user: {
                username: formData.get('nome'),
                phone: formData.get('telefone')
            },
            petAgendado: {
                name: formData.get('nomePet')
            },
            service: {
                name: formData.get('servico'),
                observations: formData.get('descricao')
            },
            date: "2026-05-16",
            hour: "10:00",
            buscarResidencia: formData.get('buscarResidencia') === 'on'
        };

        try {
            const resposta = await fetch('http://localhost:3000/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoAgendamento)
            });

            if (resposta.ok) {
                alert('Agendamento realizado com sucesso!');
                window.location.href = 'agenda.html';
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
        }
    });
});