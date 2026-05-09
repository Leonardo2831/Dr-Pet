import getParamsURL from '../../getParamsURL.js';

export default function checkInputRadioParams(){
    const servicoSelecionado = getParamsURL('servico');
    if (servicoSelecionado) {
        const radioCorrespondente = document.querySelector(`input[name="servico"][value="${servicoSelecionado}"]`);
        if (radioCorrespondente) {
            radioCorrespondente.checked = true;
        }
    }
}