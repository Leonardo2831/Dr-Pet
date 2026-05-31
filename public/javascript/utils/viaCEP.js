export default async function buscarCEP(cep) {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.erro) return null;

        return {
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
        };
    } catch {
        return null;
    }
}
