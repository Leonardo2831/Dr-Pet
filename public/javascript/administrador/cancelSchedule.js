import Fetch from "../utils/Fetch.js";
import { clickOutside } from "../utils/clickOutside.js";
import toContactWhatsapp from "../utils/toContactWhatsapp.js";
import formatPhone, { applyPhoneMask } from "../utils/formatPhone.js";

let cancelQuill = null;

function formatDateBR(dateStr) {
    if (!dateStr) return "Data não informada";
    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
    if (!dateStr.includes("-")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

export default async function cancelSchedule(modal, id, scheduleObj = null) {
    if (!modal) return;

    const fetchCancelar = new Fetch("administrador/agenda/cancelar", '[data-modal-info="adm"]');
    const fetchDados = new Fetch(`administrador/agenda/${id}`, '[data-modal-info="adm"]');

    const buttonClose = modal.querySelector('[data-button="closeCancelSchedule"]');
    const buttonVoltar = modal.querySelector('[data-button="cancelModalCloseBtn"]');
    const buttonSend = modal.querySelector('[data-button="sendCancelSchedule"]');
    const buttonText = modal.querySelector('[data-button-text="sendCancelSchedule"]');
    const loadingOverlay = modal.querySelector("[data-loading-cancel]");

    const summaryName = modal.querySelector("[data-cancel-summary-name]");
    const summaryPet = modal.querySelector("[data-cancel-summary-pet]");
    const summaryService = modal.querySelector("[data-cancel-summary-service]");
    const summaryDate = modal.querySelector("[data-cancel-summary-date]");
    const summaryPhone = modal.querySelector("[data-cancel-summary-phone]");

    const inputEmail = modal.querySelector('[data-input="cancelScheduleEmail"]');
    const inputPhone = modal.querySelector('[data-input="cancelSchedulePhone"]');
    const inputSubject = modal.querySelector('[data-input="cancelScheduleSubject"]');
    const editorContainer = modal.querySelector('[data-quill-editor="cancelScheduleEmail"]');

    if (inputPhone) {
        formatPhone(inputPhone);
    }

    const closeModal = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        if (loadingOverlay) {
            loadingOverlay.classList.add("hidden");
            loadingOverlay.classList.remove("flex");
        }
    };

    if (buttonClose) buttonClose.onclick = closeModal;
    if (buttonVoltar) buttonVoltar.onclick = closeModal;

    const innerContainer = modal.querySelector("div");
    if (innerContainer) clickOutside(innerContainer, "click", closeModal);

    // 1. Busca os dados do agendamento (do objeto passado, dos dados iniciais ou do endpoint)
    let schedule = scheduleObj;
    if (!schedule && window.initialAgendamentos && Array.isArray(window.initialAgendamentos)) {
        schedule = window.initialAgendamentos.find((a) => String(a.id) === String(id));
    }

    if (!schedule || (!schedule.email && !schedule.usuario?.email)) {
        try {
            const remote = await fetchDados.get();
            if (remote && !remote.erro) {
                schedule = remote;
            }
        } catch (e) {
            console.error("Erro ao carregar dados do agendamento:", e);
        }
    }

    const clientName = schedule?.nome || schedule?.user?.username || schedule?.usuario?.nome || "Cliente";
    const email = schedule?.email || schedule?.usuario?.email || schedule?.user?.email || "";
    const rawPhone = schedule?.telefone || schedule?.user?.phone || schedule?.usuario?.telefone || "";
    const formattedPhone = applyPhoneMask(rawPhone);
    const petName = schedule?.nomePet || schedule?.petAgendado?.name || "Pet";
    const serviceName = schedule?.service?.nome || schedule?.service?.name || schedule?.service_infos?.nome || "Serviço Veterinário";
    const dateFormatted = formatDateBR(schedule?.date || schedule?.dateAgendamento);
    const hourFormatted = schedule?.hour ? schedule.hour.slice(0, 5) : (schedule?.hourAgendamento ? String(schedule.hourAgendamento).slice(0, 5) : "");

    // Preenche resumo
    if (summaryName) summaryName.textContent = email ? `${clientName} (${email})` : clientName;
    if (summaryPet) summaryPet.textContent = petName;
    if (summaryService) summaryService.textContent = serviceName;
    if (summaryDate) summaryDate.textContent = hourFormatted ? `${dateFormatted} às ${hourFormatted}` : dateFormatted;
    if (summaryPhone) summaryPhone.textContent = formattedPhone || "Não informado";

    // Preenche inputs
    if (inputEmail) inputEmail.value = email;
    if (inputPhone) inputPhone.value = formattedPhone;
    if (inputSubject) inputSubject.value = `Dr.Pet - Cancelamento do seu agendamento (${petName})`;

    // 2. Inicializa o editor Quill se necessário
    if (window.Quill && editorContainer) {
        if (!cancelQuill) {
            cancelQuill = new Quill(editorContainer, {
                theme: "snow",
                placeholder: "Escreva o motivo do cancelamento e a mensagem para o cliente...",
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"]
                    ]
                }
            });
            const maxQuillLength = 800;
            cancelQuill.on("text-change", () => {
                if (cancelQuill.getLength() > maxQuillLength) {
                    cancelQuill.deleteText(maxQuillLength, cancelQuill.getLength());
                }
            });
        }

        const templateHtml = `
            <p>Olá, <strong>${clientName}</strong>.</p>
            <p>Infelizmente, informamos que o agendamento para o pet <strong>${petName}</strong> (${serviceName}) marcado para o dia <strong>${dateFormatted}</strong> às <strong>${hourFormatted}</strong> precisou ser <strong>cancelado</strong>.</p>
            <p>Pedimos sinceras desculpas por qualquer imprevisto ou transtorno que isso possa causar. Caso deseje reagendar para outra data conveniente, basta responder a esta mensagem ou acessar nosso site.</p>
            <p>Agradecemos pela compreensão.</p>
            <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
        `.trim();

        cancelQuill.root.innerHTML = templateHtml;
    }

    // 3. Ação do botão enviar cancelamento
    const newButtonSend = buttonSend.cloneNode(true);
    buttonSend.parentNode.replaceChild(newButtonSend, buttonSend);

    newButtonSend.addEventListener("click", async () => {
        const destEmail = inputEmail ? inputEmail.value.trim() : email;
        const destPhone = inputPhone ? inputPhone.value.trim() : formattedPhone;
        const subject = inputSubject ? inputSubject.value.trim() : "Cancelamento de Agendamento";

        const messageHtml = cancelQuill ? cancelQuill.root.innerHTML : "";
        const messageText = cancelQuill ? cancelQuill.getText().trim() : "";

        if (!destEmail) {
            alert("Por favor, preencha o e-mail do cliente.");
            if (inputEmail) inputEmail.focus();
            return;
        }

        if (!messageText) {
            alert("Por favor, preencha a mensagem de cancelamento.");
            return;
        }

        if (loadingOverlay) {
            loadingOverlay.classList.remove("hidden");
            loadingOverlay.classList.add("flex");
        }

        newButtonSend.disabled = true;
        if (buttonText) buttonText.textContent = "Cancelando e notificando...";

        try {
            const payload = {
                id: Number(id) || id,
                email: destEmail,
                to: destEmail,
                telefone: destPhone,
                subject: subject,
                assunto: subject,
                mensagemHtml: messageHtml,
                html: messageHtml,
                mensagemTexto: messageText
            };

            await fetchCancelar.post({ ...payload, payload });

            // Abre o WhatsApp com a mesma mensagem do cancelamento
            toContactWhatsapp(destPhone, messageHtml || messageText);

            closeModal();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            if (loadingOverlay) {
                loadingOverlay.classList.add("hidden");
                loadingOverlay.classList.remove("flex");
            }
            newButtonSend.disabled = false;
            if (buttonText) buttonText.textContent = "Confirmar Cancelamento e Notificar";
        }
    });
}
