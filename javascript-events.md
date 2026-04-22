# 📘 JavaScript — Entendendo Eventos

## O que é um "evento"?

Um **evento** é qualquer coisa que **acontece** na página e que o JavaScript consegue "ouvir" e reagir.

Pense assim: quando você **clica** em um botão, isso é um evento. Quando você **passa o mouse** por cima de uma imagem, isso também é um evento. Quando a **página termina de carregar**, isso é mais um evento.

> O JavaScript fica "esperando" esses eventos acontecerem para executar um código em resposta.

---

## 🖱️ O Evento de Click (`click`)

O evento mais comum e mais fácil de entender é o **click** — ele dispara quando o usuário **clica** em um elemento da página (botão, link, imagem, div, qualquer coisa).

---

## Como usar eventos — Passo a passo

### 1. Selecionar o elemento

Primeiro, você precisa dizer ao JavaScript **qual** elemento da página ele deve observar.

```html
<!-- No HTML, criamos um botão com um id -->
<button id="meuBotao">Clique aqui</button>
```

```javascript
// No JavaScript, selecionamos esse botão pelo id
const botao = document.querySelector('#meuBotao');
```

> **`document.querySelector()`** é como dizer: _"Documento, me encontre o elemento que tem esse seletor."_
> O `#meuBotao` funciona igual ao CSS — o `#` significa que estamos buscando por **id**.

---

### 2. Adicionar o "ouvinte" de evento

Agora dizemos ao JavaScript: _"Fique de olho nesse botão. Quando alguém clicar nele, execute essa função."_

```javascript
botao.addEventListener('click', function() {
  alert('Você clicou no botão!');
});
```

Vamos quebrar isso em partes:

| Parte                     | O que faz                                                        |
| ------------------------- | ---------------------------------------------------------------- |
| `botao`                   | O elemento que selecionamos antes                                |
| `.addEventListener()`     | Método que "adiciona um ouvinte" — fica esperando o evento       |
| `'click'`                 | O **tipo** do evento que queremos ouvir (neste caso, um clique)  |
| `function() { ... }`      | O **código** que será executado quando o evento acontecer        |

---

### 3. Exemplo completo e funcional

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Exemplo de Evento</title>
</head>
<body>

  <button id="meuBotao">Clique aqui</button>
  <p id="mensagem"></p>

  <script>
    // 1. Seleciona os elementos
    const botao = document.querySelector('#meuBotao');
    const mensagem = document.querySelector('#mensagem');

    // 2. Adiciona o ouvinte de evento de click
    botao.addEventListener('click', function() {
      // 3. Quando clicar, muda o texto do parágrafo
      mensagem.textContent = '✅ Botão foi clicado!';
    });
  </script>

</body>
</html>
```

**O que acontece aqui:**
1. A página carrega com um botão e um parágrafo vazio
2. O JavaScript fica "ouvindo" cliques no botão
3. Quando o usuário clica, o texto do parágrafo muda para "✅ Botão foi clicado!"

---

## 🔄 Analogia simples

Imagine um **porteiro** em um prédio:

- O **elemento** (botão) é a **porta**
- O **addEventListener** é o **porteiro** que fica vigiando a porta
- O **'click'** é a **ação** que o porteiro está esperando (alguém bater na porta)
- A **function** é a **instrução** do que o porteiro deve fazer quando alguém bater (_"abra a porta e diga bom dia"_)

```
Porta  +  Porteiro  +  "quando baterem"  +  "abra e diga bom dia"
  ↓          ↓              ↓                       ↓
botao  .addEventListener( 'click',         function() { ... } )
```

---

## 📋 Outros eventos comuns (além do click)

Os eventos são agrupados por **tipo de interação**. Cada grupo cobre uma área diferente do comportamento do usuário ou do navegador.

---

### 🖱️ Eventos de Mouse

| Evento          | Quando dispara                                                   | Exemplo de uso                        |
| --------------- | ---------------------------------------------------------------- | ------------------------------------- |
| `click`         | Clique simples (pressiona e solta)                               | Botões, links, cards                  |
| `dblclick`      | **Duplo clique** no elemento                                     | Edição inline, zoom em imagens        |
| `mousedown`     | Quando o botão do mouse é **pressionado** (antes de soltar)      | Drag personalizado, pressionar botões |
| `mouseup`       | Quando o botão do mouse é **solto**                              | Finalizar drag, liberar ação          |
| `mouseover`     | Quando o mouse **entra** na área do elemento (ou filho)          | Mostrar tooltip, highlight            |
| `mouseout`      | Quando o mouse **sai** da área do elemento (ou filho)            | Esconder tooltip, remover highlight   |
| `mouseenter`    | Quando o mouse **entra** no elemento (ignora filhos)             | Hover mais preciso que `mouseover`    |
| `mouseleave`    | Quando o mouse **sai** do elemento (ignora filhos)               | Hover mais preciso que `mouseout`     |
| `mousemove`     | Toda vez que o mouse se **move** dentro do elemento              | Efeito parallax, cursor customizado   |
| `contextmenu`   | Clique com o **botão direito** (menu de contexto)                | Menu de contexto personalizado        |
| `wheel`         | Quando o usuário **rola o scroll** do mouse                      | Zoom, scroll customizado              |

---

### ⌨️ Eventos de Teclado

| Evento      | Quando dispara                                             | Exemplo de uso                          |
| ----------- | ---------------------------------------------------------- | --------------------------------------- |
| `keydown`   | Quando uma tecla é **pressionada** (dispara repetidamente) | Atalhos de teclado, jogos              |
| `keyup`     | Quando uma tecla é **solta**                               | Busca em tempo real, validar campo      |
| `keypress`  | ⚠️ Deprecado — prefira `keydown`                          | Evite usar                              |

> **Dica:** dentro do evento de teclado, `event.key` retorna qual tecla foi pressionada.
> ```javascript
> document.addEventListener('keydown', function(event) {
>   console.log(event.key); // ex: "Enter", "ArrowUp", "a", "Escape"
> });
> ```

---

### 📝 Eventos de Formulário

| Evento     | Quando dispara                                                          | Exemplo de uso                          |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------- |
| `submit`   | Quando o formulário é **enviado**                                       | Validar dados antes de enviar           |
| `change`   | Quando o **valor muda** e o campo perde o foco                          | Select dinâmico, checkbox toggle        |
| `input`    | Toda vez que o **valor muda** (em tempo real, a cada tecla digitada)    | Contador de caracteres, busca ao vivo   |
| `focus`    | Quando o campo **recebe foco** (usuário clica ou navega com Tab)        | Destacar campo ativo                    |
| `blur`     | Quando o campo **perde o foco**                                         | Validar campo ao sair dele              |
| `reset`    | Quando o formulário é **resetado** (botão reset)                        | Limpar estados visuais do formulário    |
| `invalid`  | Quando um campo **falha na validação** nativa do HTML                   | Mostrar mensagem de erro customizada    |

> **Diferença entre `input` e `change`:**
> - `input` → dispara **a cada tecla** (tempo real)
> - `change` → dispara **só quando sai do campo** (perde o foco)

---

### 🪟 Eventos de Janela e Documento

| Evento               | Quando dispara                                                         | Exemplo de uso                          |
| -------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| `load`               | Quando a **página inteira termina** de carregar (imagens, CSS, etc.)   | Esconder tela de loading                |
| `DOMContentLoaded`   | Quando o **HTML é parseado** (sem esperar imagens e CSS)               | Inicializar scripts mais rápido         |
| `resize`             | Quando a **janela do navegador é redimensionada**                      | Layouts responsivos via JS              |
| `scroll`             | Quando o usuário **rola a página**                                     | Navbar que aparece ao rolar, parallax   |
| `beforeunload`       | Quando o usuário está **prestes a sair** da página                     | "Tem certeza que quer sair?" alerta     |
| `unload`             | Quando a página está sendo **fechada/navegada para fora**              | Limpar dados de sessão                  |
| `hashchange`         | Quando a **parte `#` da URL muda** (âncoras)                           | Roteamento simples de SPA               |
| `popstate`           | Quando o usuário **navega no histórico** (botão voltar/avançar)        | SPAs com `history.pushState`            |
| `visibilitychange`   | Quando o usuário **minimiza/troca de aba**                             | Pausar vídeo/jogo ao trocar de aba      |
| `online` / `offline` | Quando a **conexão de internet** muda de estado                        | Mostrar banner "sem conexão"            |

---

### 👆 Eventos de Toque (Touch) — Mobile

| Evento         | Quando dispara                                     | Exemplo de uso                     |
| -------------- | -------------------------------------------------- | ---------------------------------- |
| `touchstart`   | Quando o dedo **toca** a tela                      | Início de gesto ou arrasto         |
| `touchmove`    | Quando o dedo **se move** na tela                  | Swipe, arrasto de elementos        |
| `touchend`     | Quando o dedo **sai** da tela                      | Finalizar gesto                    |
| `touchcancel`  | Quando o toque é **interrompido** pelo sistema     | Lidar com interrupções             |

---

### 🗂️ Eventos de Drag & Drop (Arrastar e Soltar)

| Evento        | Quando dispara                                             | Exemplo de uso                        |
| ------------- | ---------------------------------------------------------- | ------------------------------------- |
| `dragstart`   | Quando o usuário **começa** a arrastar um elemento         | Iniciar drag & drop                   |
| `drag`        | Enquanto o elemento está sendo **arrastado**               | Atualizar posição visual              |
| `dragend`     | Quando o **arrasto termina** (soltou ou cancelou)          | Finalizar operação                    |
| `dragover`    | Quando um elemento arrastado está **sobre** a zona de drop | Destacar a zona de destino            |
| `dragenter`   | Quando o elemento arrastado **entra** na zona de drop      | Ativar feedback visual                |
| `dragleave`   | Quando o elemento arrastado **sai** da zona de drop        | Desativar feedback visual             |
| `drop`        | Quando o elemento é **solto** na zona de drop              | Processar o item dropado              |

---

### 🎬 Eventos de Mídia (Áudio e Vídeo)

| Evento           | Quando dispara                                        | Exemplo de uso                       |
| ---------------- | ----------------------------------------------------- | ------------------------------------ |
| `play`           | Quando o vídeo/áudio **começa a tocar**               | Mostrar controles, pausar outros     |
| `pause`          | Quando o vídeo/áudio é **pausado**                    | Atualizar botão play/pause           |
| `ended`          | Quando o vídeo/áudio **termina**                      | Reproduzir próxima mídia             |
| `timeupdate`     | Enquanto a mídia **avança** (a cada frame)            | Atualizar barra de progresso         |
| `volumechange`   | Quando o **volume muda**                              | Exibir nível de volume               |
| `canplay`        | Quando há dados suficientes para **começar** a tocar  | Esconder loading da mídia            |
| `error`          | Quando ocorre um **erro** ao carregar a mídia         | Mostrar mensagem de erro             |

---

### 📋 Eventos de Clipboard (Copiar/Colar)

| Evento   | Quando dispara                                    | Exemplo de uso                          |
| -------- | ------------------------------------------------- | --------------------------------------- |
| `copy`   | Quando o usuário **copia** conteúdo (`Ctrl+C`)    | Adicionar texto extra ao copiar         |
| `cut`    | Quando o usuário **recorta** conteúdo (`Ctrl+X`)  | Interceptar recorte                     |
| `paste`  | Quando o usuário **cola** conteúdo (`Ctrl+V`)     | Validar/processar conteúdo colado       |

---

### 🖼️ Eventos de Foco em Elemento

| Evento         | Quando dispara                                            | Nota                                      |
| -------------- | --------------------------------------------------------- | ----------------------------------------- |
| `focus`        | Quando o elemento **recebe foco**                         | Não borbulha (não propaga para o pai)     |
| `blur`         | Quando o elemento **perde foco**                          | Não borbulha                              |
| `focusin`      | Igual ao `focus`, mas **borbulha**                        | Útil para detectar foco em filhos         |
| `focusout`     | Igual ao `blur`, mas **borbulha**                         | Útil para detectar perda de foco em filhos|

---

> [!NOTE]
> **O que é "borbulhar" (bubble)?** Quando um evento borbulha, ele também dispara nos **elementos pai**. Por exemplo, clicar num `<span>` dentro de um `<div>` também dispara o evento no `<div>`. Você pode parar esse comportamento com `event.stopPropagation()`.

---

## 🎯 Exemplo prático — Mudando a cor de um elemento ao clicar

```html
<button id="btnCor">Mudar cor da caixa</button>
<div id="caixa" style="width: 100px; height: 100px; background: gray;"></div>

<script>
  const btnCor = document.querySelector('#btnCor');
  const caixa = document.querySelector('#caixa');

  btnCor.addEventListener('click', function() {
    caixa.style.background = 'tomato'; // muda a cor de fundo para "tomato"
  });
</script>
```

---

## 🎯 Exemplo prático — Alternando (toggle) uma classe CSS

Este padrão é muito usado no dia a dia, por exemplo para abrir/fechar menus:

```html
<button id="btnMenu">Abrir Menu</button>
<nav id="menu" class="escondido">
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
</nav>

<style>
  .escondido { display: none; }
</style>

<script>
  const btnMenu = document.querySelector('#btnMenu');
  const menu = document.querySelector('#menu');

  btnMenu.addEventListener('click', function() {
    // .classList.toggle() adiciona a classe se não tiver,
    // e remove se já tiver — como um interruptor de luz!
    menu.classList.toggle('escondido');
  });
</script>
```

> **`classList.toggle()`** funciona como um **interruptor**: liga/desliga a classe CSS cada vez que é chamado.

---

## ⚡ Resumo rápido

```
1. Selecione o elemento  →  document.querySelector('#id')
2. Adicione o ouvinte    →  elemento.addEventListener('tipo', função)
3. Escreva a ação        →  function() { /* o que fazer */ }
```

**Essa é a base de toda interatividade no JavaScript.** A partir daqui, você pode criar menus que abrem e fecham, formulários que validam campos, animações que respondem ao clique, e muito mais.

---

> [!TIP]
> **Dica:** Sempre coloque seu `<script>` no **final do `<body>`** (antes de `</body>`).
> Isso garante que o HTML já foi carregado quando o JavaScript tentar selecionar os elementos.