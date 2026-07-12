

export default function decorate(block) {
    const row = block.firstElementChild;
    if (!row) return;
   
    const [imageCell, contentCell] = [...row.children];
   
    // ── Background image ─────────────────────────────────────
    const bgWrap = document.createElement('div');
    bgWrap.className = 'card-bg';
   
    const picture = imageCell?.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.setAttribute('loading', 'eager');
        img.removeAttribute('width');
        img.removeAttribute('height');
      }
      bgWrap.append(picture);
    }
   
    // ── Content overlay ───────────────────────────────────────
    const content = document.createElement('div');
    content.className = 'card-content';
   
    [...contentCell.children].forEach((el) => {
      // Headings → card heading
      if (/^H[1-6]$/.test(el.tagName)) {
        const heading = document.createElement(el.tagName.toLowerCase());
        heading.className = 'card-heading';
        heading.innerHTML = el.innerHTML;
        content.append(heading);
        return;
      }
   
      // Paragraphs containing a link → CTA / PDF link
      const anchor = el.querySelector('a');
      if (anchor) {
        const isPdf = anchor.href?.toLowerCase().includes('.pdf');
        const a = document.createElement('a');
        a.href = anchor.href;
        a.textContent = anchor.textContent.trim();
        a.className = isPdf ? 'card-link card-pdf-link' : 'card-link';
        if (anchor.target) a.target = anchor.target;
        content.append(a);
        return;
      }
   
      // Everything else → paragraph
      if (el.textContent.trim()) {
        const p = document.createElement('p');
        p.className = 'card-text';
        p.textContent = el.textContent.trim();
        content.append(p);
      }
    });
   
    // ── Rebuild block ─────────────────────────────────────────
    block.textContent = '';
    block.append(bgWrap, content);
  }
   