export default function formatPhone(selector) {
    const inputs = document.querySelectorAll(selector);

    if (inputs.length === 0) return;

    inputs.forEach(input => {
        input.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\D/g, '');
            
            value = value.substring(0, 11);

            let formatted = value;
            if (value.length > 2) {
                formatted = `(${value.substring(0, 2)}) `;
                
                if (value.length > 6) {
                    if (value.length === 11) {
                        formatted += `${value.substring(2, 7)}-${value.substring(7)}`;
                    } else {
                        formatted += `${value.substring(2, 6)}-${value.substring(6)}`;
                    }
                } else {
                    formatted += value.substring(2);
                }
            }
            
            event.target.value = formatted;
        });
    });
}