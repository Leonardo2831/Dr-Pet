// Transforma texto em HTML seguro: "<img>" aparece como texto em vez de virar uma imagem
export default function escapeHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
