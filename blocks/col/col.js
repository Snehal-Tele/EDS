
export default function decorate(block) {
    const cols = [...block.firstElementChild.children];
    block.classList.add(`columns-${cols.length}-cols`);
   
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const pic = col.querySelector('picture');
   
        if (pic) {
          // ── Image column ────────────────────────────────────
          col.classList.add('columns-img-col');
   
          const img = pic.querySelector('img');
          if (img) {
            img.setAttribute('loading', 'lazy');
            img.removeAttribute('width');
            img.removeAttribute('height');
          }
        } else {
          // ── Text column ─────────────────────────────────────
          col.classList.add('columns-text-col');
   
          const children = [...col.children].filter((el) => el.textContent.trim());
   
          children.forEach((el, index) => {
            if (index === 0) {
              // First element → heading
              el.classList.add('columns-heading');
   
              // Gray divider injected right after heading
              const divider = document.createElement('div');
              divider.className = 'columns-divider';
              el.insertAdjacentElement('afterend', divider);
            } else {
              el.classList.add('columns-description');
            }
          });
        }
      });
    });
  }