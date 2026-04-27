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