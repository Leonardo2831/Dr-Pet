import Storage from "../../utils/Storage.js";

export default function checkInputRadioParams(){
    const servicoSelecionado = Storage.get('scheduleData')?.service;
    if (servicoSelecionado) {
        const radioCorrespondente = document.querySelector(`input[name="servico"][value="${servicoSelecionado}"]`);
        if (radioCorrespondente) {
            radioCorrespondente.checked = true;
        }
    }
}