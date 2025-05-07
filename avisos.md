**Evite muitas classes e evitar uso de id para estilizar, deixarei conteúdo sobre seletores abaixo.**

# Seletores de CSS
## 1. SELETORES SIMPLES:
- **\*** : Escolhe todas as tags da página.
    ```css
    * {
        margin: 0;
        padding: 0;
    }
    ```
- **tag** : Escolhe todas as tags com o nome que você indicar (exemplo: div, p).
    ```css
    p {
        font-size: 16px;
        color: black;
    }
    ```
- **#id** : Escolhe a tag que tem o ID que você indicar.
    ```css
    #header {
        background-color: blue;
        height: 60px;
    }
    ```
- **.class** : Escolhe todas as tags que têm a classe que você indicar.
    ```css
    .button {
        padding: 10px 20px;
        background-color: green;
        color: white;
    }
    ```

## 2. SELETORES COMBINADORES:
- **tag1 tag2** : Escolhe todas as tag2 que estão dentro de tag1.
    ```css
    div p {
        color: gray;
    }
    ```
- **tag1 > tag2** : Escolhe todas as tag2 que são filhos diretos de tag1.
    ```css
    ul > li {
        list-style: none;
    }
    ```
- **tag1 + tag2** : Escolhe a tag2 que vem logo depois de tag1.
    ```css
    h1 + p {
        font-size: 14px;
    }
    ```
- **tag1 ~ tag2** : Escolhe todas as tag2 que são irmãs de tag1.
    ```css
    h1 ~ p {
        color: darkgray;
    }
    ```

## 3. SELETORES PSEUDO-CLASSES:
- **tag:hover** : Escolhe tags quando o mouse está em cima delas.
    ```css
    a:hover {
        text-decoration: underline;
    }
    ```
- **tag:focus** : Escolhe tags que estão selecionadas ou focadas.
    ```css
    input:focus {
        border-color: blue;
    }
    ```
- **tag:nth-child(n)** : Escolhe o filho número "n" de uma tag pai.
    ```css
    li:nth-child(2) {
        font-weight: bold;
    }
    ```
- **tag:nth-child(odd)** : Escolhe todos os filhos ímpares de um elemento pai.
    ```css
    tr:nth-child(odd) {
        background-color: lightgray;
    }
    ```
- **tag:nth-child(even)** : Escolhe todos os filhos pares de um elemento pai.
    ```css
    tr:nth-child(even) {
        background-color: white;
    }
    ```
- **tag:nth-of-type(n)** : Escolhe a tag número "n" de um tipo específico dentro de um pai.
    ```css
    p:nth-of-type(3) {
        color: red;
    }
    ```
- **tag:first-child** : Escolhe o primeiro filho de uma tag pai.
    ```css
    li:first-child {
        font-size: 18px;
    }
    ```
- **tag:last-child** : Escolhe o último filho de uma tag pai.
    ```css
    li:last-child {
        font-size: 12px;
    }
    ```

## 4. SELETORES PSEUDO-ELEMENTOS:
- **tag::before** : Adiciona algo antes do conteúdo de uma tag.
    ```css
    h1::before {
        content: ""; /* irá adicionar um item sem nada, como um bloco */
        color: gold;
    }
    ```
- **tag::after** : Adiciona algo depois do conteúdo de uma tag.
    ```css
    h1::after {
        content: " ★";
        color: gold;
    }
    ```
- **tag::first-letter** : Escolhe a primeira letra de uma tag.
    ```css
    p::first-letter {
        font-size: 24px;
        font-weight: bold;
    }
    ```
- **tag::first-line** : Escolhe a primeira linha de uma tag.
    ```css
    p::first-line {
        font-style: italic;
    }
    ```

## 5. SELETORES DE GRUPO:
- **tag1, tag2** : Escolhe todas as tag1 e tag2 e faz o mesmo estilo para os dois.
    ```css
    h1, h2 {
        font-family: Arial, sans-serif;
    }
    ```

Deixar o projeto mais fidedigno possível ao figma, olhe as estilizações que estão criadas por variáveis, usa o alt para ver a distância, use mais o gap quando seu item pai já tiver o flex.

# Gap no CSS
O `gap` é uma propriedade utilizada para definir o espaçamento entre os itens de um container que utiliza "flexbox" ou "grid". Ele é uma alternativa mais prática e legível do que usar margens para espaçar os elementos.

## Como usar o gap
- Em containers com `display: flex` ou `display: grid`, você pode aplicar o `gap` para definir o espaçamento entre os itens.
- O `gap` pode ser aplicado em uma ou duas dimensões:
    - gap: valor; define o espaçamento igual entre os itens.
    - row-gap: valor; define o espaçamento entre as linhas.
    - column-gap: valor; define o espaçamento entre as colunas.
    
```
.container {
    display: flex;
    gap: 20px; /* Define um espaçamento igual de 20px entre os itens */
}
```

## Imagine os itens com flex espaçados apenas com 20px, logo vai ter o [item espaço item espaço item].

**Deixe o código espaçado para melhor compreensão**

Exemplo: 

```
.container{
    código de alinhamento (como flex)

    código de espaços e tamanhos (width, height, margin e padding)

    código de estilos (cores, bordas, sombras...)

    funções (como transições, cursor...)
}

.form {
    display: flex;
    align-items: center;
    gap: 30px;

    max-width: 880px;
    padding: 60px;
    margin: 0 auto;

    background-color: var(--green6);
    border: 1px solid var(--gray3); 
    border-radius: 10px;
    color: var(--white);

    cursor: pointer;
}
```

**Seguindo esses casos iremos ter um projeto mais fácil de trabalhar**

# Git no nosso projeto

```
git checkout -b seuNome-feature
git checkout main        
git merge seuNome-feature 
git push origin main
```