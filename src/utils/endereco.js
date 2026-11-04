// Limites dos campos do endereço. Somados, cabem folgados nos 255 caracteres de agenda.endereco.
const LIMITES = { rua: 70, numero: 10, bairro: 40, cidade: 40, complemento: 40 };

const limpar = (valor, max) => String(valor ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

function formatarCep(digitos) {
    return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

const CAMPOS_SEPARADOS = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];

/**
 * Valida o endereço enviado pelo formulário e monta o texto único guardado em agenda.endereco
 * (o mesmo formato usado pelas telas do admin: "Rua, nº 10, Bairro, Cidade, UF, CEP 00000-000 (complemento)").
 *
 * Aceita os campos separados (cep, rua, numero, bairro, cidade, estado, complemento) ou, por compatibilidade,
 * o texto único antigo em "endereco".
 * Retorna { endereco } ou { erro }.
 */
function montarEndereco(corpo) {
    const enviouSeparado = CAMPOS_SEPARADOS.some((campo) => corpo[campo] !== undefined);

    if (!enviouSeparado) {
        const unico = limpar(corpo.endereco, 255);
        return unico.length >= 3 ? { endereco: unico } : { erro: 'Informe o endereço.' };
    }

    const cep = String(corpo.cep ?? '').replace(/\D/g, '');
    const rua = limpar(corpo.rua, LIMITES.rua);
    const numero = limpar(corpo.numero, LIMITES.numero);
    const bairro = limpar(corpo.bairro, LIMITES.bairro);
    const cidade = limpar(corpo.cidade, LIMITES.cidade);
    const estado = limpar(corpo.estado, 2).toUpperCase();
    const complemento = limpar(corpo.complemento, LIMITES.complemento);

    if (cep.length !== 8) return { erro: 'Informe um CEP válido, com 8 dígitos.' };
    if (rua.length < 3) return { erro: 'Informe a rua.' };
    if (numero.length < 1) return { erro: 'Informe o número (ou S/N).' };
    if (bairro.length < 2) return { erro: 'Informe o bairro.' };
    if (cidade.length < 2) return { erro: 'Informe a cidade.' };
    if (!/^[A-Z]{2}$/.test(estado)) return { erro: 'Informe o estado com 2 letras (ex.: SP).' };

    const partes = [rua, `nº ${numero}`, bairro, cidade, estado, `CEP ${formatarCep(cep)}`];
    const endereco = partes.join(', ') + (complemento ? ` (${complemento})` : '');

    return { endereco: endereco.slice(0, 255) };
}

/**
 * Faz o caminho inverso de montarEndereco: separa o texto guardado em agenda.endereco em campos.
 * Entende os dois formatos gerados pelo site:
 *   "Rua, nº 10, Bairro, Cidade, UF, CEP 00000-000 (complemento)"   (formulário atual)
 *   "Rua, nº 10, Bairro, Cidade, UF (complemento)"                  (formulário antigo, sem CEP)
 * Retorna { cep, rua, numero, bairro, cidade, estado, complemento } ou null se for texto livre.
 * A leitura é feita do fim para o começo, então vírgulas dentro do nome da rua não atrapalham.
 */
function separarEndereco(texto) {
    const t = String(texto ?? '').trim();
    if (!t) return null;

    // rua, nº número, bairro, cidade, UF [, CEP 00000-000] [(complemento)]
    const m = t.match(/^(.+?),\s*n[º°]\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([A-Za-z]{2})(?:,\s*CEP\s*(\d{5}-?\d{3}))?(?:\s*\((.*)\))?\s*$/i);
    if (!m) return null;

    return {
        cep: (m[6] || '').replace(/\D/g, ''),
        rua: m[1].trim(),
        numero: m[2].trim(),
        bairro: m[3].trim(),
        cidade: m[4].trim(),
        estado: m[5].toUpperCase(),
        complemento: (m[7] || '').trim()
    };
}

module.exports = { montarEndereco, separarEndereco, LIMITES };
