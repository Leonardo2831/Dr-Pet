export default function eventoSlides() {
  const dropArea = document.getElementById('section-slides');
  const gallery = document.getElementById('gallery'); // Centralizando o container
  let draggedItem = null;

  // --- 1. CONFIGURAÇÃO DO DRAG & DROP EXTERNO (Desktop -> Navegador) ---

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
  });

  dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  });

  function handleFiles(files) {
    [...files].forEach(previewFile);
  }

  // --- 2. CRIAÇÃO DO PREVIEW E TORNAR ARRASTÁVEL ---

  function previewFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      img.classList.add('slide-item');
      
      // Habilita o movimento nativo
      img.draggable = true; 
      
      // Adiciona os eventos para permitir reordenar com o mouse
      addReorderEvents(img);

      gallery.appendChild(img);
      console.log("Arquivo pronto para upload:", file.name);
    };
  }

  // --- 3. LÓGICA DE REORDENAÇÃO MANUAL (Move slides entre si) ---

  function addReorderEvents(item) {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
      item.classList.add('dragging'); // Opcional: estilo CSS para o item sendo movido
    });

    item.addEventListener('dragend', () => {
      draggedItem = null;
      item.classList.remove('dragging');
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault(); // Necessário para permitir o drop
    });

    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (this !== draggedItem) {
        const allSlides = [...gallery.querySelectorAll('.slide-item')];
        const curIndex = allSlides.indexOf(draggedItem);
        const targetIndex = allSlides.indexOf(this);

        if (curIndex < targetIndex) {
          this.after(draggedItem); // Move para depois se estiver vindo de antes
        } else {
          this.before(draggedItem); // Move para antes se estiver vindo de depois
        }
      }
    });
  }

  // --- 4. FUNÇÃO DE INVERSÃO ---

  // Tornamos a função global para que o botão HTML consiga acessá-la
  window.inverterSlides = function() {
    const slides = Array.from(gallery.querySelectorAll('.slide-item'));
    const botaoAdicionar = gallery.querySelector('.botao-adicionar');

    slides.reverse();

    slides.forEach(slide => {
      gallery.appendChild(slide);
    });

    if (botaoAdicionar) {
      gallery.appendChild(botaoAdicionar);
    }
  };
}