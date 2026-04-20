# Para iniciar o git no vscode

```bash
git config --global user.name "SeuNomeNoGitHub"
git config --global user.email "SeuEmailNoGitHub"
git clone urlDoProjeto
```

# Fluxo de Trabalho com Git 

Sempre crie uma "branch" (ramificação) nova para trabalhar em uma tela, assim não misturamos código com erro na branch principal.

```bash
# Cria e entra na branch da funcionalidade nova
git checkout -b seuNome-feature

# Faz as alterações... Depois volta para a principal
git checkout main

# Trás o que você codou e mescla (claro, se tiver aprovado)
git merge seuNome-feature

# Joga para o repositório público
git push origin main
```
**Assim conseguimos seguir usando o Git sem problemas e com um código sempre rastreável.**