/**
 * Converte texto/HTML em formatação amigável para o WhatsApp.
 * Suporta tags básicas como negrito (*), itálico (_), tachado (~) e listas (•).
 *
 * @param {string} message - Mensagem em formato HTML ou texto puro.
 * @returns {string} Mensagem formatada para o WhatsApp.
 */
export function formatMessageForWhatsapp(message) {
  if (!message) return "";
  let text = String(message);

  // Se contiver tags HTML, converte formatações básicas para markdown do WhatsApp
  if (/<[a-z][\s\S]*>/i.test(text)) {
    text = text
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*\/p\s*>/gi, "\n\n")
      .replace(/<\s*p\s*>/gi, "")
      .replace(/<\s*li\s*>/gi, "• ")
      .replace(/<\s*\/li\s*>/gi, "\n")
      .replace(/<\s*h[1-6][^>]*>(.*?)<\s*\/h[1-6]>/gi, "*$1*\n\n")
      .replace(/<\s*(?:strong|b)[^>]*>(.*?)<\s*\/(?:strong|b)>/gi, "*$1*")
      .replace(/<\s*(?:em|i)[^>]*>(.*?)<\s*\/(?:em|i)>/gi, "_$1_")
      .replace(/<\s*(?:s|strike)[^>]*>(.*?)<\s*\/(?:s|strike)>/gi, "~$1~")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
  }

  // Normaliza quebras de linha excessivas e espaços
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Normaliza o número de telefone para o padrão internacional exigido pela API do WhatsApp (DDI + DDD + Número).
 * No Brasil: se tiver 10 ou 11 dígitos, adiciona o DDI 55.
 *
 * @param {string|number} phone - Telefone em qualquer formato (ex: "(19) 99359-2253", "19993592253").
 * @returns {string} Apenas dígitos com DDI, ou string vazia se não fornecido.
 */
export function formatPhoneForWhatsapp(phone) {
  if (!phone) return "";
  let clean = String(phone).replace(/\D/g, "");

  // Se for número nacional brasileiro (10 ou 11 dígitos), adiciona DDI 55
  if (clean.length === 10 || clean.length === 11) {
    clean = `55${clean}`;
  }

  return clean;
}

/**
 * Constrói a URL para a API do WhatsApp (wa.me).
 *
 * @param {string|number} [phone] - Telefone do destinatário.
 * @param {string} [message] - Mensagem a ser enviada.
 * @returns {string} URL completa do wa.me.
 */
export function buildWhatsappUrl(phone = "", message = "") {
  const cleanPhone = formatPhoneForWhatsapp(phone);
  const formattedText = formatMessageForWhatsapp(message);
  const encodedText = encodeURIComponent(formattedText);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Função modular para redirecionar ou abrir conversa no WhatsApp com mensagem pré-formatada.
 *
 * @param {string|object} phoneOrOptions - Número do telefone ou objeto de opções.
 * @param {string} [messageText=""] - Mensagem a ser enviada (se o 1º parâmetro for o telefone).
 * @param {string} [targetWindow="_blank"] - Alvo da janela ('_blank', '_self', etc.).
 * @returns {{ url: string, opened: boolean }} Objeto com a URL gerada e se foi aberta com sucesso.
 */
export default function toContactWhatsapp(
  phoneOrOptions,
  messageText = "",
  targetWindow = "_blank",
) {
  let phone = "";
  let message = "";
  let target = targetWindow;
  let shouldOpen = true;

  if (typeof phoneOrOptions === "object" && phoneOrOptions !== null) {
    phone =
      phoneOrOptions.phone ||
      phoneOrOptions.telefone ||
      phoneOrOptions.numero ||
      "";
    message =
      phoneOrOptions.message ||
      phoneOrOptions.text ||
      phoneOrOptions.mensagem ||
      "";
    target = phoneOrOptions.target !== undefined ? phoneOrOptions.target : target;
    shouldOpen = phoneOrOptions.open !== undefined ? phoneOrOptions.open : true;
  } else {
    phone = phoneOrOptions || "";
    message = messageText;
  }

  const url = buildWhatsappUrl(phone, message);

  let opened = false;
  if (shouldOpen && typeof window !== "undefined") {
    try {
      const win = window.open(url, target);
      if (win && !win.closed && typeof win.closed !== "undefined") {
        opened = true;
      } else {
        // Se popup foi bloqueado pelo navegador, redireciona na mesma aba
        window.location.href = url;
        opened = true;
      }
    } catch (e) {
      window.location.href = url;
      opened = true;
    }
  }

  return { url, opened };
}