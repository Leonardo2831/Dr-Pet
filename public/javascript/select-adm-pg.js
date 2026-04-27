document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            tabContents.forEach(content => content.classList.add('hidden'));

            tabBtns.forEach(tBtn => {
                tBtn.classList.remove('bg-green-600', 'shadow-[3px_3px_8px_0px_rgba(0,0,0,0.1)]', 'hover:bg-green-700');
                tBtn.classList.add('bg-gray-200', 'hover:bg-gray-300');
                    
                const span = tBtn.querySelector('span');
                if (span) {
                    span.classList.remove('text-gray-50');
                    span.classList.add('text-green-700');
                }
            });


            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            } else {
                console.error(`ERRO: Não foi possível acessar essa seção, tente novamente mais tarde.`);
            }

            btn.classList.remove('bg-gray-200', 'hover:bg-gray-300');
            btn.classList.add('bg-green-600', 'shadow-[3px_3px_8px_0px_rgba(0,0,0,0.1)]', 'hover:bg-green-700');
                
            const activeSpan = btn.querySelector('span');
            if (activeSpan) {
                activeSpan.classList.remove('text-green-700');
                activeSpan.classList.add('text-gray-50');
            }
        });
    });
});