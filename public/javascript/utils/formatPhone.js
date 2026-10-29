export function applyPhoneMask(value) {
    if (!value) return '';
    value = String(value).replace(/\D/g, '');
    if (value.length > 11 && value.startsWith('55')) {
        value = value.substring(2);
    }
    value = value.substring(0, 11);

    if (value.length > 2) {
        let formatted = `(${value.substring(0, 2)}) `;

        if (value.length > 6) {
            if (value.length === 11) {
                formatted += `${value.substring(2, 7)}-${value.substring(7)}`;
            } else {
                formatted += `${value.substring(2, 6)}-${value.substring(6)}`;
            }
        } else {
            formatted += value.substring(2);
        }

        return formatted;
    }

    return value;
}

function changePhone(event) {
    event.target.value = applyPhoneMask(event.target.value);
}

export default function formatPhone(selector) {
    const inputs = typeof selector === 'string' 
        ? document.querySelectorAll(selector) 
        : (selector instanceof HTMLElement ? [selector] : []);

    if (inputs.length === 0) return;

    inputs.forEach(input => {
        if (input.value) {
            input.value = applyPhoneMask(input.value);
        }

        input.removeEventListener('input', changePhone);
        input.removeEventListener('change', changePhone);
        input.addEventListener('input', changePhone);
        input.addEventListener('change', changePhone);
    });
}