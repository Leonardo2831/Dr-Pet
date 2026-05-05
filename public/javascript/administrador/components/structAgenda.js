export default function structAgenda(object){
    const div = document.createElement('div');
    div.className = "flex items-center gap-4 p-4 bg-white rounded-lg shadow border border-slate-200 hover:shadow-md transition-shadow";
    div.setAttribute('data-id', object.id);

    div.innerHTML = `
        
    `;

    return div;
}