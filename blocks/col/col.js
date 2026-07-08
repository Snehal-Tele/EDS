
export default function decorate(block) {
    const cols = [...block.firstElementChild.children];
    block.classList.add(`columns-${cols.length}-cols`);
   
    // Process each row
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const pic = col.querySelector('picture');
   
        // ── Image column ──────────────────────────────────────
        if (pic) {
          const picWrapper = pic.closest('div');
          if (picWrapper && picWrapper.children.length === 1) {
            picWrapper.classList.add('columns-img-col');
   
            // Ensure img has no fixed dimensions (for responsive scaling)
            const img = pic.querySelector('img');
            if (img) {
              img.setAttribute('loading', 'lazy');
              img.removeAttribute('width');
              img.removeAttribute('height');
            }
          }
        } else {
          // ── Text column ────────────────────────────────────
          col.classList.add('columns-text-col');
   
          const children = [...col.children].filter((el) => el.textContent.trim());
   
          children.forEach((el, index) => {
            if (index === 0) {
              // First element → heading
              el.classList.add('columns-heading');
   
              // Inject full-width divider right after heading
              const divider = document.createElement('div');
              divider.className = 'columns-divider';
              el.insertAdjacentElement('afterend', divider);
            } else {
              // All subsequent paragraphs → description
              el.classList.add('columns-description');
            }
          });
        }
      });
    });
  }
  