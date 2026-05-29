function applyPhoneMask(value) {
    value = value.replace(/\D/g, '').substring(0, 11);

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
    const inputs = document.querySelectorAll(selector);

    if (inputs.length === 0) return;

    inputs.forEach(input => {
        if (input.value) {
            input.value = applyPhoneMask(input.value);
        }

        input.addEventListener('input', changePhone);
        input.addEventListener('change', changePhone);
    });
}