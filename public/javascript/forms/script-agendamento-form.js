const parametrosDaUrl = new URLSearchParams(window.location.search);
const servicoSelecionado = parametrosDaUrl.get('servico');
if (servicoSelecionado) {
    const radioCorrespondente = document.querySelector(`input[name="servico"][value="${servicoSelecionado}"]`);
    if (radioCorrespondente) {
        radioCorrespondente.checked = true;
    }
}