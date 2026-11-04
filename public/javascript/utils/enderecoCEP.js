import buscarCEP from './viaCEP.js';
import { applyCepMask } from './formatCEP.js';

// Campos do endereço (formulário de agendamento e janela de edição do admin): [data-address="cep|rua|numero|bairro|cidade|estado|complemento"]
const NOMES = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'complemento'];
const TEMPO_LIMITE_MS = 7000;

const campo = {};
let statusEl = null;
let ultimoCep = '';           // último CEP já consultado (evita consultar de novo ao sair do campo)
const autoPreenchido = {};    // o que a consulta colocou em rua/bairro, para saber se o usuário já editou
const ouvintes = [];

const soDigitos = (valor) => String(valor || '').replace(/\D/g, '');
const comTimeout = (promessa, ms) => Promise.race([promessa, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
const avisar = (el) => el.dispatchEvent(new Event('input', { bubbles: true }));

const CLASSES_STATUS = { info: 'text-gray-600', ok: 'text-green-600', erro: 'text-red-600' };

function mostrarStatus(texto, tipo = 'info') {
    if (!statusEl) return;
    statusEl.textContent = texto;
    Object.values(CLASSES_STATUS).forEach((c) => statusEl.classList.remove(c));
    statusEl.classList.add(CLASSES_STATUS[tipo] || CLASSES_STATUS.info);
}

// Coloca o valor vindo do CEP, sem atropelar o que o usuário já digitou quando a consulta não traz aquele dado
function aplicar(nome, valorNovo) {
    const el = campo[nome];
    const atual = el.value.trim();
    const vemDaConsulta = nome in autoPreenchido && atual === autoPreenchido[nome];

    if (valorNovo) {
        el.value = valorNovo;
        autoPreenchido[nome] = valorNovo;
    } else if (vemDaConsulta || !atual) {
        // CEP geral da cidade (sem rua/bairro): limpa só o que tinha vindo do CEP anterior
        el.value = '';
        delete autoPreenchido[nome];
    }
    avisar(el);
}

async function consultar(cep) {
    ultimoCep = cep;
    mostrarStatus('Buscando endereço...', 'info');

    const endereco = await comTimeout(buscarCEP(cep), TEMPO_LIMITE_MS);

    // o usuário pode ter mudado o CEP enquanto a resposta vinha
    if (soDigitos(campo.cep.value) !== cep) return;

    if (!endereco) {
        mostrarStatus('Não encontramos esse CEP. Preencha o endereço manualmente.', 'erro');
        return;
    }

    aplicar('rua', endereco.rua);
    aplicar('bairro', endereco.bairro);
    aplicar('cidade', endereco.cidade);
    aplicar('estado', endereco.estado);

    const semRua = !campo.rua.value.trim();
    mostrarStatus(
        semRua
            ? 'Este CEP é geral da cidade: informe a rua e o bairro.'
            : 'Endereço encontrado. Confira e altere o que precisar.',
        semRua ? 'info' : 'ok'
    );

    // só avança o cursor se a pessoa ainda estiver no CEP (não atrapalha quem já foi para outro campo)
    const ativo = document.activeElement;
    if (ativo === campo.cep || ativo === document.body) {
        (semRua ? campo.rua : campo.numero).focus();
    }
}

/** Lê os campos do endereço no formato que o servidor espera. */
export function lerEndereco() {
    return Object.fromEntries(NOMES.map((nome) => [
        nome,
        nome === 'cep' ? soDigitos(campo.cep?.value) : (campo[nome]?.value || '').trim()
    ]));
}

/** Preenche os campos com um endereço salvo (não consulta o CEP, para não trocar o que o usuário salvou). */
export function preencherEndereco(valores) {
    NOMES.forEach((nome) => {
        const valor = valores[nome] || '';
        campo[nome].value = nome === 'cep' ? applyCepMask(valor) : valor;
    });
    ultimoCep = soDigitos(valores.cep);
    Object.keys(autoPreenchido).forEach((k) => delete autoPreenchido[k]);
    mostrarStatus('');
    NOMES.forEach((nome) => avisar(campo[nome]));
}

export function limparEndereco(focar = true) {
    NOMES.forEach((nome) => { campo[nome].value = ''; });
    ultimoCep = '';
    Object.keys(autoPreenchido).forEach((k) => delete autoPreenchido[k]);
    mostrarStatus('');
    NOMES.forEach((nome) => avisar(campo[nome]));
    if (focar) campo.cep.focus();
}

/** Chama a função sempre que qualquer campo do endereço mudar. */
export function aoAlterarEndereco(callback) {
    ouvintes.push(callback);
}

export default function setupEnderecoCEP() {
    NOMES.forEach((nome) => { campo[nome] = document.querySelector(`[data-address="${nome}"]`); });
    statusEl = document.querySelector('[data-address-status]');
    if (NOMES.some((nome) => !campo[nome])) return; // página sem o bloco de endereço

    // endereço salvo já vem preenchido pelo servidor: não precisa consultar de novo
    ultimoCep = soDigitos(campo.cep.value);

    campo.cep.addEventListener('input', () => {
        campo.cep.value = applyCepMask(campo.cep.value);
        const digitos = soDigitos(campo.cep.value);

        if (digitos.length < 8) {
            mostrarStatus('');
            return;
        }
        if (digitos !== ultimoCep) consultar(digitos);
    });

    campo.cep.addEventListener('blur', () => {
        const digitos = soDigitos(campo.cep.value);
        if (digitos.length === 8 && digitos !== ultimoCep) consultar(digitos);
    });

    // a sigla do estado é sempre 2 letras maiúsculas
    campo.estado.addEventListener('input', () => {
        campo.estado.value = campo.estado.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    });

    NOMES.forEach((nome) => {
        campo[nome].addEventListener('input', () => ouvintes.forEach((cb) => cb()));
    });
}
