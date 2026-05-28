export default function formatPrice(input) {
    const valueInput = input.value.replace(/\D/g, '');;
    input.value = "R$ " + (Number(valueInput) / 100).toFixed(2).replace('.', ',');
}