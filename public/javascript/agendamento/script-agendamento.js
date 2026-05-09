import PopUp from './../Pop-up.js';

document.addEventListener('DOMContentLoaded', () => {
    const selectService = new PopUp('[data-button="selectService"]', '[data-modal="serviceSelected"]').init();

    const agendamento = {
    servico: 'Banho e Tosa', 
    dia: null,
    horario: null,
    mes: 'abril'
};


const detalhesServicos = {
    'Banho e Tosa': { tempo: '1h 30min', preco: 'R$ 90,00' },
    'Vacinação': { tempo: '30min', preco: 'R$ 150,00' },
    'Cirurgia': { tempo: 'A definir', preco: 'Sob consulta' }
};

    // 3. Função principal que atualiza o card da direita
    function atualizarResumo() {
    
    document.getElementById('resumo-servico').textContent = agendamento.servico;
    
    const detalhes = detalhesServicos[agendamento.servico];
    if (detalhes) {
        document.getElementById('resumo-tempo').textContent = detalhes.tempo;
        document.getElementById('resumo-preco').textContent = detalhes.preco;
    }

    
    const textoDataHora = document.getElementById('resumo-data-hora');
    if (agendamento.dia && agendamento.horario) {
         textoDataHora.textContent = `Dia ${agendamento.dia} de ${agendamento.mes} às ${agendamento.horario}`;
    }
}

    const botoesServico = document.querySelectorAll('.servico-opcao');
        botoesServico.forEach(botao => {
        botao.addEventListener('click', (evento) => {
            // Atualiza a variável de estado
            agendamento.servico = evento.target.getAttribute('data-servico');
            atualizarResumo();
        });
});

// 5. Selecionar Dia no Calendário
const diasCalendario = document.querySelectorAll('.dia-calendario');
diasCalendario.forEach(dia => {
    dia.addEventListener('click', (evento) => {
        // Remove a classe 'ativo' (cor verde) de todos os dias
        diasCalendario.forEach(d => d.classList.remove('ativo'));
        
        // Adiciona a classe 'ativo' no dia clicado
        evento.target.classList.add('ativo');
        
        // Salva o dia escolhido e atualiza o resumo
        agendamento.dia = evento.target.textContent;
        atualizarResumo();
    });
});

// 6. Selecionar Horário
const botoesHorario = document.querySelectorAll('.horario-slot');
botoesHorario.forEach(slot => {
    slot.addEventListener('click', (evento) => {
        // Remove a classe 'ativo' de todos os horários
        botoesHorario.forEach(h => h.classList.remove('ativo'));
        
        // Adiciona a classe 'ativo' no horário clicado
        evento.target.classList.add('ativo');
        
        // Salva o horário escolhido e atualiza o resumo
        agendamento.horario = evento.target.textContent;
        atualizarResumo();
    });
});
});