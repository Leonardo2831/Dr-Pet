const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB

// Só aceita fotos servidas pelo Google (a URL vem do id_token verificado, mas validamos mesmo assim)
const HOST_GOOGLE = /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//i;

/** Baixa a foto de perfil do Google. Retorna um Buffer ou null (qualquer falha vira null). */
async function baixarFoto(url) {
    if (typeof url !== 'string' || !HOST_GOOGLE.test(url)) return null;

    // O Google entrega a foto em 96px por padrão; pede uma versão maior
    const urlMaior = url.replace(/=s\d+(-c)?$/, '=s256-c');

    try {
        const resposta = await fetch(urlMaior, { signal: AbortSignal.timeout(5000) });
        if (!resposta.ok) return null;
        if (!(resposta.headers.get('content-type') || '').startsWith('image/')) return null;

        const buffer = Buffer.from(await resposta.arrayBuffer());
        return buffer.length > 0 && buffer.length <= TAMANHO_MAXIMO ? buffer : null;
    } catch (err) {
        console.error('Não foi possível baixar a foto do Google:', err.message);
        return null;
    }
}

/**
 * Sem foto = NULL, vazio, ou o valor antigo (a versão anterior guardava só o link da foto como texto).
 */
function semFoto(avatar) {
    if (!avatar || avatar.length === 0) return true;
    return Buffer.isBuffer(avatar) && avatar.length < 600 && avatar.toString('utf8', 0, 8) === 'https://';
}

module.exports = { baixarFoto, semFoto };
