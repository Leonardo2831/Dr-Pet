# Instalação e Execução do Projeto (Tailwind CSS)

## 1. Primeiros Passos (Após clonar o repositório)

Sempre que você clonar este projeto ou tentar abri-lo em um computador novo na faculdade, a primeira coisa a fazer é instalar as dependências do Tailwind. Abra o terminal na pasta do projeto e rode:

```bash
npm install
```

## 2. Como Rodar o Projeto (Tailwind Watcher)

Para que o Tailwind leia as suas classes do HTML e gere o CSS bonitinho enquanto você cria as telas, é **MUITO IMPORTANTE** deixar o compilador rodando no terminal:

```bash
npm run tailwind
```
*(Dica: Deixe esse processo rodando de fundo. Toda vez que você salvar um arquivo HTML, ele vai compilar e atualizar o arquivo `output.css` sozinho em milissegundos!)*

---

# Regras de Estilização (Padrão Tailwind)

Como atualizamos a arquitetura do nosso projeto, **evite criar classes CSS tradicionais e evite o uso de IDs para estilizar arquivos**.

Toda a estilização deve ser feita adotando o modelo do Tailwind no próprio HTML.

## 1. Escrevendo Classes (Boas Práticas)
- **Tudo é classe utilitária:** Em vez de ir no CSS e escrever `display: flex; gap: 20px;`, você simplesmente escreve no HTML `<div class="flex gap-5">`.
- **Siga nossa paleta:** Nós definimos nossa paleta de cores no `tailwind.config.js`. Use as cores nativas para manter a identidade do "Dr-Pet", como `bg-green-500`, `text-gray-100`, `bg-gray-800` etc.
- **Tipografia:** Esqueça tamanhos estáticos e use o padrão escalável (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`...).

## 2. Espaçamentos (Margin, Padding e Gap)
Mantenha os itens separados de forma inteligente usando as métricas do Tailwind, onde cada `1` equivale a `0.25rem` (4px).
- `p-5` equivale a `padding: 20px;`
- `mt-10` equivale a `margin-top: 40px;`
- Prefira usar amplamente o **`gap`** se o conteiner pai for `flex` ou `grid` para evitar poluir o código com `margin`. 
Exemplo: `<div class="flex flex-col gap-4">`.

**Exemplo Prático (Como um bloco tradicional virou Tailwind):**
```html
<!-- Antes tinhamos que criar .form-card, ir no CSS, abrir as chaves... -->
<!-- Agora, fica tudo centralizado visualmente -->
<form class="flex flex-col items-center gap-[30px] max-w-[880px] p-[60px] mx-auto bg-green-600 border border-gray-300 rounded-lg text-white">
    <!-- conteúdo do formulário -->
</form>
```

---