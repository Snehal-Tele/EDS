export default function decorate(block) {
    const row = block.querySelector(':scope > div');
    if (!row) return;
   
    const cells = [...row.children];
    const [textCell, imageCell] = cells;
   
    // ── Text side ──────────────────────────────────────────────
    const textWrap = document.createElement('div');
    textWrap.className = 'text-image-text';
   
    [...textCell.children].forEach((el) => {
      // Heading
      if (/^H[1-6]$/.test(el.tagName)) {
        const heading = document.createElement('h2');
        heading.className = 'text-image-heading';
        heading.textContent = el.textContent.trim();
        textWrap.append(heading);
   
        // Gray divider line directly after heading
        const divider = document.createElement('hr');
        divider.className = 'text-image-divider';
        textWrap.append(divider);
        return;
      }
   
      // Link → CTA (optional)
      const link = el.querySelector('a');
      if (link) {
        const cta = document.createElement('a');
        cta.className = 'text-image-cta';
        cta.href = link.href;
        cta.textContent = link.textContent.trim();
        textWrap.append(cta);
        return;
      }
   
      // Paragraph → description
      if (el.textContent.trim()) {
        const desc = document.createElement('p');
        desc.className = 'text-image-description';
        desc.textContent = el.textContent.trim();
        textWrap.append(desc);
      }
    });
   
    // ── Image side ─────────────────────────────────────────────
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'text-image-media';
   
    const picture = imageCell?.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.setAttribute('loading', 'lazy');
        img.removeAttribute('width');
        img.removeAttribute('height');
      }
      mediaWrap.append(picture);
    }
   
    // ── Rebuild block ───────────────────────────────────────────
    const inner = document.createElement('div');
    inner.className = 'text-image-inner';
    inner.append(textWrap, mediaWrap);
   
    block.textContent = '';
    block.append(inner);
  }