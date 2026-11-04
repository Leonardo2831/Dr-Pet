import { applyPhoneMask } from '../utils/formatPhone.js';
import { applyCepMask } from '../utils/formatCEP.js';

// Popup somente leitura com os detalhes de um agendamento (aberto ao clicar no card da Agenda).
// Os textos são colocados com textContent, então nomes e observações com HTML aparecem como texto.

const moeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function dataLocal(iso) {
    const [ano, mes, dia] = String(iso || '').split('-').map(Number);
    return ano && mes && dia ? new Date(ano, mes - 1, dia) : null;
}

const minutosParaHora = (total) => `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

function situacao(objeto, inicio, fim) {
    const aguardando = objeto.pendente === true || Number(objeto.pendente) === 1;
    if (aguardando) return { texto: 'Aguardando confirmação', classe: 'bg-orange-light text-orange' };
    if (fim && fim <= new Date()) return { texto: 'Concluído', classe: 'bg-green-light text-green-600' };
    return { texto: 'Confirmado', classe: 'bg-green-light text-green-600' };
}

let ultimoGatilho = null;

function fechar(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.removeEventListener('keydown', aoPressionarTecla);
    if (ultimoGatilho && document.contains(ultimoGatilho)) ultimoGatilho.focus();
    ultimoGatilho = null;
}

function aoPressionarTecla(evento) {
    if (evento.key !== 'Escape') return;
    const modal = document.querySelector('[data-modal="scheduleDetails"]');
    if (modal && !modal.classList.contains('hidden')) fechar(modal);
}

function linhaDeEndereco(texto, destaque = false) {
    const p = document.createElement('p');
    p.textContent = texto;
    if (destaque) p.className = 'font-semibold';
    return p;
}

function preencherEndereco(container, objeto) {
    container.replaceChildren();
    const campos = objeto.enderecoCampos;

    if (campos) {
        container.append(linhaDeEndereco(`${campos.rua}, nº ${campos.numero}`, true));
        container.append(linhaDeEndereco(campos.bairro));
        const cidade = [campos.cidade, campos.estado].filter(Boolean).join(' - ');
        container.append(linhaDeEndereco(campos.cep ? `${cidade} · CEP ${applyCepMask(campos.cep)}` : cidade));
        if (campos.complemento) container.append(linhaDeEndereco(`Complemento: ${campos.complemento}`));
        return;
    }

    const texto = String(objeto.endereco || objeto.user?.endereco || '').trim();
    container.append(linhaDeEndereco(texto || 'Não informado', Boolean(texto)));
}

export default function openScheduleDetails(objeto, gatilho = null) {
    const modal = document.querySelector('[data-modal="scheduleDetails"]');
    if (!modal || !objeto) return;

    const campo = (nome) => modal.querySelector(`[data-details="${nome}"]`);
    const servico = objeto.service || {};

    const nomeServico = servico.nome || servico.name || 'Serviço';
    const duracao = Number(servico.duracao) || 0;
    const [hora, minuto] = String(objeto.hour || '').split(':').map(Number);
    const data = dataLocal(objeto.date);

    let inicio = null;
    let fim = null;
    if (data && !Number.isNaN(hora)) {
        inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate(), hora, minuto || 0);
        fim = new Date(inicio.getTime() + (duracao || 30) * 60000);
    }

    // Cabeçalho
    campo('serviceName').textContent = nomeServico;
    const diaSemana = data ? data.toLocaleDateString('pt-BR', { weekday: 'long' }) : '';
    campo('when').textContent = data
        ? `${diaSemana.charAt(0).toUpperCase()}${diaSemana.slice(1)}, ${data.toLocaleDateString('pt-BR')} às ${objeto.hour}`
        : '';

    const estado = situacao(objeto, inicio, fim);
    const selo = campo('status');
    selo.textContent = estado.texto;
    selo.className = `inline-block w-fit px-3 py-1 rounded-full font-sans font-semibold text-sm ${estado.classe}`;

    const imagem = campo('serviceImage');
    imagem.classList.add('hidden');
    if (objeto.fk_service || servico.id) {
        imagem.onload = () => imagem.classList.remove('hidden');
        imagem.onerror = () => imagem.classList.add('hidden');
        imagem.src = `/servicos/imagem/${objeto.fk_service || servico.id}`;
        imagem.alt = nomeServico;
    }

    // Serviço
    campo('serviceDescription').textContent = servico.descricao || 'Sem descrição cadastrada.';
    campo('duration').textContent = duracao ? `${duracao} min` : '-';
    campo('price').textContent = servico.preco ? moeda(servico.preco) : '-';

    // Agendamento
    campo('date').textContent = data ? data.toLocaleDateString('pt-BR') : '-';
    campo('time').textContent = inicio
        ? `${objeto.hour} às ${minutosParaHora(hora * 60 + (minuto || 0) + (duracao || 30))}`
        : (objeto.hour || '-');
    campo('pickup').textContent = objeto.buscarResidencia ? 'Sim' : 'Não';
    campo('observation').textContent = objeto.observation || servico.observations || 'Nenhuma observação.';

    // Cliente e pet
    campo('client').textContent = objeto.user?.username || objeto.nome || 'Cliente';
    campo('pet').textContent = objeto.petAgendado?.name || objeto.nomePet || '-';
    const telefone = objeto.telefone || objeto.user?.phone || '';
    const link = campo('phone');
    link.textContent = telefone ? applyPhoneMask(telefone) : '-';
    if (telefone) link.setAttribute('href', `tel:${String(telefone).replace(/\D/g, '')}`);
    else link.removeAttribute('href');
    campo('email').textContent = objeto.email || objeto.user?.email || '-';

    // Endereço
    preencherEndereco(campo('address'), objeto);

    // Abrir
    ultimoGatilho = gatilho;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.scrollTop = 0;
    document.addEventListener('keydown', aoPressionarTecla);
    modal.querySelector('[data-button="closeScheduleDetails"]').focus();
}

/** Liga os botões de fechar e o clique fora do popup (chamar uma vez, quando o painel carregar). */
export function setupScheduleDetails() {
    const modal = document.querySelector('[data-modal="scheduleDetails"]');
    if (!modal) return;

    modal.querySelectorAll('[data-button="closeScheduleDetails"], [data-button="closeScheduleDetailsBottom"]')
        .forEach((botao) => botao.addEventListener('click', () => fechar(modal)));

    // clicar no fundo escuro (fora da caixa branca) fecha
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) fechar(modal);
    });
}
