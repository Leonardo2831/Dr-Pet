// '13733130' -> '13733-130' (aceita no máximo 8 dígitos)
export function applyCepMask(value) {
    const digitos = String(value || '').replace(/\D/g, '').slice(0, 8);
    return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}
