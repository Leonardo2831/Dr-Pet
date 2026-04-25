/*
O código tem que adaptar, isso é apenas para uma seção de navegação como a do admnistrador com 3 opções, acho que funciona igual para a opção do usuário mas irá precisar criar um método e selecionar novo item guardando no this, sendo ele o botão do menu (que é um texto), para voltar na primeira section.
*/
export default class TabNav {
    constructor(selectorListButtons, selectorListSections, classActive){
        this.listButtons = document.querySelectorAll(selectorListButtons);
        this.listSections = document.querySelectorAll(selectorListSections);
        this.classActive = classActive;
    }

    navigationTab(index){
        this.listSections.forEach((listSection) => {
            listSection.classList.remove(this.classActive);
        });

        this.listSections[index].classList.add(this.classActive);
    }

    addEventTabNav(){
        this.listButtons.forEach((listImage, index) => {
            listImage.addEventListener("click", () => {
                this.navigationTab(index);
            });
        });
    }

    init(){
        if(this.listButtons.length && this.listSections.length) {
            this.listSections[0].classList.add(this.classActive);
            this.addEventTabNav();
        }

        return this;
    }
}