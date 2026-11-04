// Descobre o tipo da imagem pelos primeiros bytes (as imagens ficam em BLOB, sem tipo guardado)
function detectarMime(buffer) {
    if (buffer.length > 3 && buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
    if (buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
    if (buffer.length > 11 && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return 'image/jpeg';
}

module.exports = { detectarMime };
