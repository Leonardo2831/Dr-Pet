const links = document.querySelectorAll('[data-target]');
const sections = document.querySelectorAll('section[id]');

links.forEach(link => {
    link.addEventListener('click', () => {
        sections.forEach((section) => {
            section.classList.add('hidden');
        });
        
        const linkCorreto = link.dataset.target;
        document.getElementById(linkCorreto).classList.remove('hidden');
    })
})