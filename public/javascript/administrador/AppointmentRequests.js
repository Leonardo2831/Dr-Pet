import Fetch from "../utils/Fetch.js";
import { clickOutside } from "../utils/clickOutside.js";
import toContactWhatsapp from "../utils/toContactWhatsapp.js";
import formatPhone, { applyPhoneMask } from "../utils/formatPhone.js";

export default class AppointmentRequests {
  constructor(selectorContent) {
    this.content = document.querySelector(selectorContent);
    this.section = document.getElementById("section-agendamentos");
    this.fetchEmail = new Fetch(
      "administrador/agendamentos/accept",
      '[data-modal-info="adm"]',
    );
    this.searchQuery = "";
    this.currentSchedule = null;
    this.currentAction = "accepted";

    // Elementos do Modal de E-mail com Quill
    this.emailModal = document.querySelector('[data-modal="emailAppointment"]');
    this.modalTitle = document.querySelector("[data-email-modal-title]");
    this.actionBadge = document.querySelector("[data-email-action-badge]");

    // Destinatário individual
    this.inputEmailTo = document.querySelector(
      '[data-input="appointmentEmailTo"]',
    );
    this.inputPhone = document.querySelector(
      '[data-input="appointmentPhone"]',
    );
    this.inputEmailSubject = document.querySelector(
      '[data-input="appointmentEmailSubject"]',
    );
    this.editorContainer = document.querySelector(
      '[data-quill-editor="appointmentEmail"]',
    );
    this.btnSendEmail = document.querySelector(
      '[data-button="sendAppointmentEmail"]',
    );
    this.btnTextSend = document.querySelector(
      '[data-button-text="sendAppointmentEmail"]',
    );
    this.btnCloseModal = document.querySelector(
      '[data-button="closeEmailModal"]',
    );
    this.btnCancelModal = document.querySelector(
      '[data-button="cancelEmailModal"]',
    );
    this.loadingOverlay = document.querySelector("[data-loading-email]");

    // Resumo no Modal
    this.summaryName = document.querySelector("[data-email-summary-name]");
    this.summaryPet = document.querySelector("[data-email-summary-pet]");
    this.summaryService = document.querySelector(
      "[data-email-summary-service]",
    );
    this.summaryDate = document.querySelector("[data-email-summary-date]");
    this.summaryPhone = document.querySelector("[data-email-summary-phone]");

    // Busca de agendamentos
    this.inputSearch = document.querySelector(
      '[data-input="searchAppointments"]',
    );

    this.quill = null;
  }

  getCardData(card) {
    if (!card) return null;
    return {
      id:
        card.getAttribute("data-appointment-id") ||
        card.getAttribute("data-id"),
      clientName: card.getAttribute("data-client-name") || "Cliente",
      email: card.getAttribute("data-email") || "",
      telefone: card.getAttribute("data-phone") || "",
      petName: card.getAttribute("data-pet") || "Pet",
      serviceId: card.getAttribute("data-service-id") || "",
      service: card.getAttribute("data-service") || "Serviço",
      date: card.getAttribute("data-date") || "",
      hour: card.getAttribute("data-hour") || "",
      buscarResidencia: card.getAttribute("data-translado") === "true",
      isPending: card.getAttribute("data-pending") === "true",
    };
  }

  formatDate(date) {
    if (!date) return "Data não informada";
    if (date.includes("T")) date = date.split("T")[0];
    if (!date.includes("-")) return date;

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  initQuillEditor() {
    if (!window.Quill || this.quill || !this.editorContainer) return;

    this.quill = new Quill(this.editorContainer, {
      theme: "snow",
      placeholder:
        "Escreva a mensagem personalizada que o cliente receberá por e-mail e WhatsApp...",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ header: [1, 2, 3, false] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "clean"],
        ],
      },
    });
    const maxQuillLength = 800;
    this.quill.on("text-change", () => {
      if (this.quill.getLength() > maxQuillLength) {
        this.quill.deleteText(maxQuillLength, this.quill.getLength());
      }
    });
  }

  openEmailModal(schedule, actionType = "accepted") {
    this.initQuillEditor();

    this.currentSchedule = schedule;
    this.currentAction = actionType;

    if (!this.emailModal || !schedule) return;

    const isAccept = actionType === "accepted";

    // Estilização do badge de ação
    if (this.actionBadge) {
      this.actionBadge.className =
        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 " +
        (isAccept
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-red-light text-red-alert border border-red-300");
      this.actionBadge.textContent = isAccept
        ? "Confirmar Agendamento"
        : "Recusar Agendamento";
    }

    // Título do modal
    if (this.modalTitle) {
      this.modalTitle.textContent = isAccept
        ? "Confirmar Agendamento e Notificar por E-mail / WhatsApp"
        : "Recusar Agendamento e Notificar por E-mail / WhatsApp";
      this.modalTitle.className =
        "font-sans font-bold text-xl md:text-2xl mt-1 " +
        (isAccept ? "text-green-700" : "text-red-alert");
    }

    // Botão de envio
    if (this.btnSendEmail) {
      this.btnSendEmail.className =
        "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-sans font-semibold text-sm md:text-base text-white shadow-sm transition-all focus:outline-none focus:ring-4 " +
        (isAccept
          ? "bg-green-600 hover:bg-green-700 focus:ring-green-500/30"
          : "bg-red-alert hover:opacity-90 focus:ring-red-alert/30");
    }

    if (this.btnTextSend) {
      this.btnTextSend.textContent = isAccept
        ? "Enviar E-mail e Abrir WhatsApp"
        : "Enviar Recusa e Abrir WhatsApp";
    }

    // Dados do agendamento para preencher o resumo e formulário
    const clientName =
      schedule.clientName ||
      schedule.user?.username ||
      schedule.nome ||
      "Cliente";
    const email =
      schedule.email || schedule.user?.email || "cliente@exemplo.com";
    const telefone =
      schedule.telefone || schedule.user?.telefone || "";
    const petName =
      schedule.petName ||
      schedule.nomePet ||
      schedule.petAgendado?.name ||
      "Pet";
    const serviceName = schedule.service || "Serviço Veterinário";
    const dateStr = this.formatDate(
      schedule.date || schedule.dateAgendamento,
    );
    const hourStr =
      schedule.hour || schedule.hourAgendamento || "Horário a definir";

    if (this.summaryName)
      this.summaryName.textContent = `${clientName} (${email})`;
    if (this.summaryPet) this.summaryPet.textContent = petName;
    if (this.summaryService) this.summaryService.textContent = serviceName;
    if (this.summaryDate)
      this.summaryDate.textContent = `${dateStr} às ${hourStr}`;
    if (this.summaryPhone)
      this.summaryPhone.textContent = applyPhoneMask(telefone) || "Não informado";

    if (this.inputEmailTo) {
      this.inputEmailTo.value = email;
      this.inputEmailTo.disabled = false;
    }

    if (this.inputPhone) {
      this.inputPhone.value = applyPhoneMask(telefone);
      formatPhone(this.inputPhone);
    }

    if (this.inputEmailSubject) {
      if (isAccept) {
        this.inputEmailSubject.value = `Dr.Pet - Confirmação do seu agendamento para ${petName}!`;
      } else {
        this.inputEmailSubject.value = `Dr.Pet - Informações sobre sua solicitação de agendamento (${petName})`;
      }
    }

    // Template de texto no Quill
    this.setEmailTemplate(schedule, actionType);

    // Exibir modal centralizado
    this.emailModal.classList.remove("hidden");
    this.emailModal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    // Ativa clickOutside no container interno do modal
    const innerDialog = this.emailModal.querySelector("div");
    if (innerDialog) {
      clickOutside(innerDialog, "click", () => this.closeEmailModal());
    }
  }

  setEmailTemplate(schedule, actionType) {
    if (!this.quill) return;

    const isAccept = actionType === "accepted";
    const clientName = schedule?.clientName || schedule?.nome || "Cliente";
    const petName = schedule?.petName || schedule?.nomePet || "seu pet";
    const serviceName = schedule?.service || "Serviço Veterinário";
    const dateStr = schedule
      ? this.formatDate(schedule.date || schedule.dateAgendamento)
      : "";
    const hourStr = schedule
      ? schedule.hour || schedule.hourAgendamento || ""
      : "";
    const transladoStr = schedule?.buscarResidencia
      ? "Sim (Translado na residência pela Dr.Pet)"
      : "Atendimento presencial na clínica";

    let htmlContent = "";

    if (isAccept) {
      htmlContent = `
        <p>Olá, <strong>${clientName}</strong>!</p>
        <p>Temos uma ótima notícia: o agendamento para o pet <strong>${petName}</strong> foi <strong>confirmado com sucesso</strong> na Dr.Pet!</p>
        <p><strong>Detalhes do Atendimento:</strong></p>
        <ul>
            <li><strong>Serviço:</strong> ${serviceName}</li>
            <li><strong>Data:</strong> ${dateStr}</li>
            <li><strong>Horário:</strong> ${hourStr}</li>
            <li><strong>Pet:</strong> ${petName}</li>
            <li><strong>Transporte:</strong> ${transladoStr}</li>
        </ul>
        <p>Por favor, chegue com 10 minutos de antecedência caso o atendimento seja na clínica. Se você solicitou transporte, nosso motorista estará no seu endereço no horário combinado.</p>
        <p>Em caso de imprevistos ou reagendamento, entre em contato conosco o quanto antes.</p>
        <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
      `;
    } else {
      htmlContent = `
        <p>Olá, <strong>${clientName}</strong>.</p>
        <p>Agradecemos por solicitar um agendamento na <strong>Dr.Pet</strong> para o seu pet <strong>${petName}</strong>.</p>
        <p>Infelizmente, não poderemos confirmar o atendimento na data <strong>${dateStr}</strong> às <strong>${hourStr}</strong> devido à lotação completa da nossa agenda neste horário.</p>
        <p>Gostaríamos muito de atendê-los! Por favor, responda a este e-mail sugerindo novas datas/horários ou acesse nosso site para verificar os horários que ainda estão disponíveis.</p>
        <p>Pedimos sinceras desculpas pelo transtorno e agradecemos pela sua compreensão.</p>
        <p>Atenciosamente,<br><strong>Equipe Dr.Pet</strong></p>
      `;
    }

    this.quill.root.innerHTML = htmlContent.trim();
  }

  closeEmailModal() {
    if (this.emailModal) {
      this.emailModal.classList.add("hidden");
      this.emailModal.classList.remove("flex");
      const innerDialog = this.emailModal.querySelector("div");
      if (innerDialog && innerDialog._cleanupClickOutside) {
        innerDialog._cleanupClickOutside();
      }
    }
    document.body.classList.remove("overflow-hidden");
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add("hidden");
      this.loadingOverlay.classList.remove("flex");
    }
    this.currentSchedule = null;
  }

  async handleSendEmail() {
    const email = this.inputEmailTo ? this.inputEmailTo.value.trim() : "";
    if (!email) {
      alert("Por favor, informe o e-mail do destinatário.");
      if (this.inputEmailTo) this.inputEmailTo.focus();
      return;
    }

    const phone = this.inputPhone
      ? this.inputPhone.value.trim()
      : (this.currentSchedule?.telefone || "");

    const subject = this.inputEmailSubject
      ? this.inputEmailSubject.value.trim()
      : "";
    const messageHtml = this.quill ? this.quill.root.innerHTML : "";
    const messageText = this.quill ? this.quill.getText().trim() : "";

    if (!subject) {
      alert("Por favor, informe o assunto do e-mail.");
      if (this.inputEmailSubject) this.inputEmailSubject.focus();
      return;
    }

    if (!messageText || messageText === "") {
      alert("Por favor, escreva a mensagem no editor.");
      return;
    }

    if (this.loadingOverlay) {
      this.loadingOverlay.classList.remove("hidden");
      this.loadingOverlay.classList.add("flex");
    }

    if (this.btnTextSend) {
      this.originalBtnText = this.btnTextSend.textContent;
      this.btnTextSend.textContent = "Enviando e abrindo WhatsApp...";
    }

    if (this.btnSendEmail) {
      this.btnSendEmail.disabled = true;
      this.btnSendEmail.classList.add("opacity-70", "cursor-wait");
    }

    if (this.btnCloseModal) this.btnCloseModal.disabled = true;
    if (this.btnCancelModal) this.btnCancelModal.disabled = true;

    try {
      if (this.currentSchedule) {
        const scheduleId =
          Number(this.currentSchedule.id) || this.currentSchedule.id;
        const payload = {
          id: scheduleId,
          status: this.currentAction,
          action: this.currentAction,
          pendente: this.currentAction === "accepted" ? 0 : 1,
          email: email,
          to: email,
          telefone: phone,
          destinatario: {
            email: email,
            nome: this.currentSchedule.clientName || "Cliente",
            telefone: phone,
          },
          assunto: subject,
          subject: subject,
          mensagemHtml: messageHtml,
          html: messageHtml,
          mensagemTexto: messageText,
          agendamento: {
            id: scheduleId,
            pet: this.currentSchedule.petName,
            servico: this.currentSchedule.service,
            data: this.currentSchedule.date,
            horario: this.currentSchedule.hour,
            buscarResidencia: Boolean(this.currentSchedule.buscarResidencia),
          },
        };

        // Envia o e-mail e atualiza o agendamento no banco
        await this.fetchEmail.post({ payload });

        // Abre o WhatsApp com a mesma mensagem pronta
        toContactWhatsapp(phone, messageHtml || messageText);
      }

      this.closeEmailModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao processar envio de e-mail e agendamento:", error);
    } finally {
      if (this.loadingOverlay) {
        this.loadingOverlay.classList.add("hidden");
        this.loadingOverlay.classList.remove("flex");
      }
      if (this.btnTextSend && this.originalBtnText) {
        this.btnTextSend.textContent = this.originalBtnText;
      }
      if (this.btnSendEmail) {
        this.btnSendEmail.disabled = false;
        this.btnSendEmail.classList.remove("opacity-70", "cursor-wait");
      }
      if (this.btnCloseModal) this.btnCloseModal.disabled = false;
      if (this.btnCancelModal) this.btnCancelModal.disabled = false;
    }
  }

  render() {
    if (!this.content) return;

    const cards = this.content.querySelectorAll("[data-appointment-card]");
    const emptyState = this.content.querySelector("[data-appointment-empty]");
    let visibleCount = 0;
    const query = (this.searchQuery || "").toLowerCase();

    cards.forEach((card) => {
      let visible = true;
      if (query) {
        const name = (
          card.getAttribute("data-client-name") || ""
        ).toLowerCase();
        const email = (card.getAttribute("data-email") || "").toLowerCase();
        const phone = (card.getAttribute("data-phone") || "").toLowerCase();
        const pet = (card.getAttribute("data-pet") || "").toLowerCase();
        const service = (card.getAttribute("data-service") || "").toLowerCase();
        visible =
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          pet.includes(query) ||
          service.includes(query);
      }

      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount++;
    });

    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount > 0);
    }
  }

  bindCardEvents() {
    if (!this.content) return;
    const cards = this.content.querySelectorAll("[data-appointment-card]");
    cards.forEach((card) => {
      const schedule = this.getCardData(card);

      const btnAccept = card.querySelector('[data-action="accept"]');
      if (btnAccept) {
        btnAccept.onclick = () => {
          const id = btnAccept.getAttribute("data-id") || schedule.id;
          this.openEmailModal({ ...schedule, id }, "accepted");
        };
      }

      const btnReject = card.querySelector('[data-action="reject"]');
      if (btnReject) {
        btnReject.onclick = () => {
          const id = btnReject.getAttribute("data-id") || schedule.id;
          this.openEmailModal({ ...schedule, id }, "rejected");
        };
      }

      const btnRenotify = card.querySelector('[data-action="renotify"]');
      if (btnRenotify) {
        btnRenotify.onclick = () => {
          const id = btnRenotify.getAttribute("data-id") || schedule.id;
          const currentStatus =
            card.getAttribute("data-pending") === "true"
              ? "rejected"
              : "accepted";
          this.openEmailModal({ ...schedule, id }, currentStatus);
        };
      }
    });
  }

  loadAppointments() {
    this.bindCardEvents();
  }

  addEvents() {
    // Campo de busca
    if (this.inputSearch) {
      this.inputSearch.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }

    // Fechar modal de e-mail
    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener("click", () =>
        this.closeEmailModal(),
      );
    }
    if (this.btnCancelModal) {
      this.btnCancelModal.addEventListener("click", () =>
        this.closeEmailModal(),
      );
    }

    // Fechar modal ao clicar fora (backdrop clickoutside)
    if (this.emailModal) {
      this.emailModal.addEventListener("click", (e) => {
        if (e.target === this.emailModal) {
          this.closeEmailModal();
        }
      });
    }

    // Fechar com a tecla ESC
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.emailModal &&
        !this.emailModal.classList.contains("hidden")
      ) {
        this.closeEmailModal();
      }
    });

    // Enviar formulário do modal
    if (this.btnSendEmail) {
      this.btnSendEmail.addEventListener("click", () => this.handleSendEmail());
    }
  }

  init() {
    if (this.content) {
      this.addEvents();
      this.loadAppointments();
    }
    return this;
  }
}
