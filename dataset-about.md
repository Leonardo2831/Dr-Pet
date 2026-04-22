# O Uso de `dataset` (Atributos `data-*`) no JavaScript

O `dataset` é uma propriedade do JavaScript que permite acessar e manipular os atributos de dados personalizados (`data-*`) definidos em elementos HTML. Ele oferece uma maneira limpa, padronizada e segura de armazenar informações extras diretamente no DOM (Document Object Model), sem a necessidade de criar atributos não padrão ou usar classes CSS para guardar valores.

## Como funciona no HTML?

No HTML, você pode criar qualquer atributo personalizado prefixando-o com `data-`. Por exemplo:

```html
<button 
  data-item="btn-comprar" 
  data-produto-id="123" 
  data-categoria="petiscos" 
  data-preco="15.90"
>
  Comprar Petisco
</button>
```

Neste exemplo, `data-produto-id`, `data-categoria` e `data-preco` são atributos de dados que guardam informações específicas sobre este botão.

## Como manipular com JavaScript?

No JavaScript, você acessa esses atributos através da propriedade `.dataset` do elemento. O JavaScript converte automaticamente os nomes com hífen (`kebab-case` do HTML) para o padrão `camelCase`.

### 1. Lendo valores (Get)

```javascript
// Pegando um item no dom com data-atributo
const botao = document.querySelector('[data-item="btn-comprar"]');

// Acessando os valores
const id = botao.dataset.produtoId; // "123"
const categoria = botao.dataset.categoria; // "petiscos"
const preco = botao.dataset.preco; // "15.90"

console.log(`Comprando produto ${id} da categoria ${categoria} por R$${preco}`);
```

### 2. Modificando ou adicionando valores (Set)

Você também pode alterar esses valores dinamicamente ou criar novos:

```javascript
// Alterando um valor existente
botao.dataset.preco = "12.90"; // Aplica um desconto

// Adicionando um novo data-attribute (data-estoque)
botao.dataset.estoque = "50";
```
Isso atualizará o HTML no navegador para: `<button ... data-preco="12.90" data-estoque="50">...`

## Por que o `dataset` é importante?

1. **Separação de Responsabilidades:** Ajuda a manter a separação entre o HTML (estrutura/dados), o CSS (apresentação) e o JavaScript (comportamento). Você não precisa usar `class` ou `id` para armazenar valores lógicos, deixando as classes exclusivamente para estilos.

2. **Facilidade de Acesso:** A propriedade `.dataset` fornece uma API simples e direta para ler e escrever esses dados, sendo mais prática que os métodos convencionais como `getAttribute('data-algo')` ou `setAttribute('data-algo', 'valor')`.

3. **Armazenamento Local e Específico:** Permite armazenar o estado ou dados diretamente no elemento visual que interage com o usuário. Isso é muito útil em listas, galerias, carrinhos de compras e componentes onde cada item precisa carregar sua própria identificação ou configuração.

4. **Código Mais Limpo e Menos Variáveis Globais:** Ao invés de criar arrays ou objetos complexos no JavaScript apenas para mapear qual botão faz o que, a informação já fica atrelada ao próprio botão. Ao clicar, basta ler o `dataset` do elemento clicado.

5. **Seleção de Elementos Segura e Desacoplada:** Usar atributos como `data-item` ou `data-js` para selecionar elementos via `document.querySelector` cria uma separação clara entre as classes de estilo e as âncoras de comportamento do JavaScript.

### Selecionando Elementos via Data-Attributes

Uma das melhores práticas modernas ao manipular o DOM é selecionar os elementos usando seus `data-attributes` em vez de classes ou IDs. Veja por que isso evita confusões:

**Abordagem Comum (Acoplada ao CSS):**
```html
<!-- Se alguém remover ou alterar a classe "btn-comprar" para mudar o visual, o JavaScript irá quebrar! -->
<button class="btn bg-blue-500 btn-comprar">Comprar</button>
```
```javascript
const botao = document.querySelector('.btn-comprar'); // Arriscado
```

**Abordagem com Data-Attributes (Segura e Desacoplada):**
```html
<!-- O CSS pode mudar livremente. O JavaScript continua funcionando, pois usa o data-item. -->
<button class="btn bg-blue-500" data-item="btn-comprar">Comprar</button>
```
```javascript
const botao = document.querySelector('[data-item="btn-comprar"]'); // Seguro
```

Essa técnica de seleção:
- **Evita bugs visuais vs lógicos:** Alterações no estilo da página (CSS) não interferem na lógica do botão (JS).
- **Comunicação clara de intenção:** Quando um desenvolvedor bate o olho em um atributo `data-*` (como `data-item`, `data-action` ou `data-js`) no HTML, ele sabe na hora que aquele elemento possui interações dinâmicas via JavaScript.


### Exemplo Prático de Importância

Imagine uma lista de produtos. Ao clicar em um botão para deletar um item, como o JavaScript sabe qual item deve ser deletado?

**Sem dataset (Ruim):**
```html
<!-- Dependendo de IDs que misturam apresentação e lógica, ou extraindo da string -->
<button class="delete-btn" id="item-42">Deletar</button> 
```

**Com dataset (Bom):**
```html
<!-- Claro, semântico e fácil de capturar -->
<button class="delete-btn" data-id="42">Deletar</button> 
```

```javascript
document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', (event) => {
    // Pega o ID diretamente do botão clicado de forma semântica
    const idParaDeletar = event.target.dataset.id; 
    deletarProduto(idParaDeletar);
  });
});
```

Em resumo, o `dataset` é a ponte ideal para conectar dados vitais do back-end ou da lógica de negócios diretamente à interface do usuário de forma legível e eficiente.