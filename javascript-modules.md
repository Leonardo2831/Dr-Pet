# 📦 Módulos em JavaScript — `import` e `export`

## O que é um "módulo"?

Imagine que você está montando um **quebra-cabeça gigante**. Se todas as peças estivessem misturadas numa única caixa enorme, seria muito difícil achar a peça certa, não é?

Agora imagine que alguém separou as peças por cor em **caixinhas menores** — azul numa caixa, verde em outra, vermelho em outra. Ficou muito mais fácil!

**Um módulo é exatamente isso: uma "caixinha" de código.**

Em vez de escrever TODO o JavaScript do seu projeto em um único arquivo gigantesco, você **divide** o código em vários arquivos menores, onde cada um cuida de uma responsabilidade específica.

```
❌ Tudo num arquivo só (bagunça):
   script.js  →  2000 linhas com TUDO misturado

✅ Dividido em módulos (organizado):
   carrinho.js     →  só o código do carrinho de compras
   validacao.js    →  só o código que valida formulários
   animacoes.js    →  só o código das animações
```

---

## Por que usar módulos?

| Benefício | Explicação simples |
|---|---|
| 🧹 **Organização** | Cada arquivo tem uma função clara. Você sabe exatamente onde procurar cada coisa. |
| 🔁 **Reutilização** | Escreveu uma função útil? Pode usar em qualquer outro arquivo sem copiar e colar. |
| 🐛 **Menos bugs** | Código organizado = menos chance de quebrar algo sem querer. |
| 👥 **Trabalho em equipe** | Cada pessoa pode trabalhar num arquivo diferente sem conflito. |
| 🔒 **Isolamento** | Variáveis de um módulo não "vazam" para outros, evitando conflitos de nomes. |

---

## As duas palavras-chave: `export` e `import`

Para módulos funcionarem, precisamos de duas ações:

1. **`export`** → "Ei, mundo! Essa função/variável está **disponível** para quem quiser usar."
2. **`import`** → "Ei, eu **quero usar** aquela função/variável que outro arquivo disponibilizou."

Pense assim:

```
📤 export = ENVIAR para fora   (tornar público)
📥 import = RECEBER de fora    (pegar o que preciso)
```

---

## Como usar `export` (disponibilizar código)

### Forma 1 — Export nomeado (`named export`)

Você coloca a palavra `export` na frente do que quer disponibilizar:

```js
// 📄 arquivo: saudacoes.js

export function bomDia() {
  return "Bom dia! ☀️";
}

export function boaNoite() {
  return "Boa noite! 🌙";
}

export const siteNome = "Dr. Pet";
```

> **O que aconteceu?** Marcamos 3 coisas como públicas: as funções `bomDia`, `boaNoite` e a constante `siteNome`. Qualquer outro arquivo pode importá-las.

Outra forma de escrever, exportando tudo de uma vez no final:

```js
// 📄 arquivo: saudacoes.js

function bomDia() {
  return "Bom dia! ☀️";
}

function boaNoite() {
  return "Boa noite! 🌙";
}

const siteNome = "Dr. Pet";

// Exporta tudo junto no final do arquivo:
export { bomDia, boaNoite, siteNome };
```

> As duas formas fazem **exatamente a mesma coisa**. Use a que preferir!

---

### Forma 2 — Export padrão (`default export`)

Quando um arquivo tem **uma coisa principal** para exportar, usamos `export default`:

```js
// 📄 arquivo: calculadora.js

export default function somar(a, b) {
  return a + b;
}
```

> **Regra:** Cada arquivo só pode ter **um** `export default`. Pense nele como o "produto estrela" daquele módulo.

---

## Como usar `import` (receber código)

### Importando exports nomeados

Use **chaves `{ }`** e escreva o nome exato:

```js
// 📄 arquivo: app.js

import { bomDia, siteNome } from './saudacoes.js';

console.log(bomDia());   // "Bom dia! ☀️"
console.log(siteNome);   // "Dr. Pet"
```

> **Nota:** Você só importa o que precisa! Não é obrigado a importar tudo.

### Importando o export default

**Sem chaves** — e você pode dar o nome que quiser:

```js
// 📄 arquivo: app.js

import somar from './calculadora.js';
// Poderia ser qualquer nome: import minhaFuncao from './calculadora.js';

console.log(somar(2, 3));  // 5
```

### Importando os dois tipos juntos

```js
// 📄 arquivo: app.js

import somar, { bomDia, siteNome } from './saudacoes.js';
//     ↑ default    ↑ nomeados
```

### Importando tudo de um módulo

Use `* as` para pegar tudo de uma vez:

```js
// 📄 arquivo: app.js

import * as Saudacoes from './saudacoes.js';

console.log(Saudacoes.bomDia());    // "Bom dia! ☀️"
console.log(Saudacoes.boaNoite());  // "Boa noite! 🌙"
console.log(Saudacoes.siteNome);    // "Dr. Pet"
```

---

## Renomeando com `as`

Às vezes dois módulos exportam algo com o mesmo nome. Nesse caso, renomeie:

```js
import { bomDia as saudacaoManha } from './saudacoes.js';

console.log(saudacaoManha());  // "Bom dia! ☀️"
```

Funciona no export também:

```js
function calcularTotal() { /* ... */ }

export { calcularTotal as total };
```

---

## Exemplo prático completo 🐾

Vamos imaginar um mini-sistema para o **Dr. Pet**:

### 1. Módulo de Pets

```js
// 📄 arquivo: pets.js

export class Pet {
  constructor(nome, tipo) {
    this.nome = nome;
    this.tipo = tipo;
  }

  apresentar() {
    return `🐾 Olá! Eu sou ${this.nome}, um ${this.tipo}.`;
  }
}

export function criarPet(nome, tipo) {
  return new Pet(nome, tipo);
}
```

### 2. Módulo de Agendamento

```js
// 📄 arquivo: agendamento.js

export default function agendar(pet, data, servico) {
  return {
    pet: pet.nome,
    data: data,
    servico: servico,
    confirmado: true,
  };
}

export function formatarData(data) {
  return data.toLocaleDateString('pt-BR');
}
```

### 3. Arquivo principal que usa tudo

```js
// 📄 arquivo: app.js

import { Pet, criarPet } from './pets.js';
import agendar, { formatarData } from './agendamento.js';

// Criando um pet
const rex = criarPet("Rex", "Cachorro");
console.log(rex.apresentar());
// 🐾 Olá! Eu sou Rex, um Cachorro.

// Agendando um banho
const consulta = agendar(rex, new Date(), "Banho e Tosa");
console.log(consulta);
// { pet: "Rex", data: ..., servico: "Banho e Tosa", confirmado: true }

// Formatando a data
console.log(formatarData(new Date()));
// 21/04/2026
```

---

## Como usar módulos no HTML

Para que o navegador entenda que seu JavaScript usa módulos, adicione `type="module"` na tag `<script>`:

```html
<!-- ✅ Com módulos -->
<script type="module" src="./js/app.js"></script>

<!-- ❌ Sem type="module", import/export NÃO funcionam -->
<script src="./js/app.js"></script>
```

> **Importante:** Scripts do tipo `module` já são executados automaticamente em **modo estrito** (`strict mode`) e com **`defer`** (carregam sem bloquear a página).

---

## Resumo visual rápido

```
📄 saudacoes.js                      📄 app.js
┌──────────────────────┐             ┌──────────────────────────────┐
│                      │   export    │                              │
│  export function     │ ─────────→  │  import { bomDia }           │
│    bomDia() { ... }  │             │    from './saudacoes.js';    │
│                      │             │                              │
│  export function     │             │  bomDia();  // "Bom dia! ☀️"│
│    boaNoite() { ... }│             │                              │
│                      │             └──────────────────────────────┘
└──────────────────────┘
```

---

## Tabela de referência rápida

| O que você quer fazer | Sintaxe |
|---|---|
| Exportar uma função/variável | `export function nome() { }` |
| Exportar várias coisas juntas | `export { a, b, c };` |
| Exportar algo como padrão | `export default function() { }` |
| Importar export nomeado | `import { nome } from './arquivo.js';` |
| Importar export default | `import nome from './arquivo.js';` |
| Importar tudo | `import * as Tudo from './arquivo.js';` |
| Renomear ao importar | `import { nome as apelido } from './arquivo.js';` |
| Usar no HTML | `<script type="module" src="..."></script>` |

---

## ⚠️ Erros comuns de iniciantes

### 1. Esquecer o `type="module"` no HTML
```html
<!-- ❌ ERRO: import e export não funcionam -->
<script src="./app.js"></script>

<!-- ✅ CORRETO -->
<script type="module" src="./app.js"></script>
```

### 2. Esquecer o caminho relativo (`./`)
```js
// ❌ ERRO: o navegador não encontra o arquivo
import { bomDia } from 'saudacoes.js';

// ✅ CORRETO: sempre comece com ./ ou ../
import { bomDia } from './saudacoes.js';
```

### 3. Usar chaves com export default
```js
// ❌ ERRO: default não usa chaves
import { somar } from './calculadora.js';

// ✅ CORRETO: sem chaves para default
import somar from './calculadora.js';
```

### 4. Tentar usar mais de um `export default`
```js
// ❌ ERRO: só pode ter UM default por arquivo
export default function a() { }
export default function b() { }

// ✅ CORRETO: um default + exports nomeados
export default function a() { }
export function b() { }
```

---

## 🧠 Dica final

> Sempre que perceber que um arquivo está ficando **grande demais** ou fazendo **coisas demais**, é hora de dividir em módulos. Pense: *"Esse código poderia ser útil em outro lugar?"* — Se sim, ele merece seu próprio módulo!