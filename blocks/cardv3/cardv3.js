export default function decorate(block) {
    const row = block.firstElementChild;
    if (!row) return;
   
    const [colA, colB] = [...row.children];
   
    // Auto-detect which column holds the image
    const colAHasImage = !!colA.querySelector('picture');
    const imageCol   = colAHasImage ? colA : colB;
    const contentCol = colAHasImage ? colB : colA;
   
    // Add modifier so CSS knows text side
    block.classList.add(colAHasImage ? 'cardv3--text-right' : 'cardv3--text-left');
   
    // ── Background image ─────────────────────────────────────
    const bgWrap = document.createElement('div');
    bgWrap.className = 'cardv3-bg';
   
    const picture = imageCol.querySelector('picture');
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
    content.className = 'cardv3-content';
   
    [...contentCol.children].forEach((el) => {
      // Heading tags
      if (/^H[1-6]$/.test(el.tagName)) {
        const heading = document.createElement(el.tagName.toLowerCase());
        heading.className = 'cardv3-heading';
        heading.innerHTML = el.innerHTML;
        content.append(heading);
        return;
      }
   
      // Element containing a link → CTA or PDF
      const anchor = el.querySelector('a');
      if (anchor) {
        const isPdf = anchor.href?.toLowerCase().includes('.pdf');
        const a = document.createElement('a');
        a.href = anchor.href;
        a.className = isPdf ? 'cardv3-link cardv3-pdf-link' : 'cardv3-link';
        a.innerHTML = anchor.innerHTML || anchor.textContent.trim();
        if (anchor.target) a.target = anchor.target;
        content.append(a);
        return;
      }
   
      // Plain paragraph
      if (el.textContent.trim()) {
        const p = document.createElement('p');
        p.className = 'cardv3-text';
        p.textContent = el.textContent.trim();
        content.append(p);
      }
    });
   
    // ── Rebuild block ─────────────────────────────────────────
    block.textContent = '';
    block.append(bgWrap, content);
  }