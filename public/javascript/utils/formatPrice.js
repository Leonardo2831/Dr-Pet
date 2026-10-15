export default function formatPrice(input) {
    if (!input) return;
    const valueInput = input.value.replace(/\D/g, '');
    if (!valueInput) {
        input.value = '';
        return;
    }
    input.value = "R$ " + (Number(valueInput) / 100).toFixed(2).replace('.', ',');
}