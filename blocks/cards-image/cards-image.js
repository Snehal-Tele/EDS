
export default function decorate(block) {
    const row = block.querySelector(':scope > div');
    if (!row) return;
   
    const cells = [...row.children];
    if (cells.length < 2) return;
   
    const [cellA, cellB] = cells;
   
    // Detect which cell holds the image
    const cellAHasImage = !!cellA.querySelector('picture');
    const imageCell  = cellAHasImage ? cellA : cellB;
    const contentCell = cellAHasImage ? cellB : cellA;
   
    // Add layout modifier so CSS knows which side the image is on
    block.classList.add(cellAHasImage ? 'image-left' : 'image-right');
   
    // ── Image side ──────────────────────────────────────────────
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'split-banner-media';
    const picture = imageCell.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('alt', img.getAttribute('alt') || '');
      }
      mediaWrap.append(picture);
    }
   
    // ── Text side ───────────────────────────────────────────────
    const textWrap = document.createElement('div');
    textWrap.className = 'split-banner-text';
   
    [...contentCell.children].forEach((el, index) => {
      const link = el.querySelector('a');
   
      // First plain paragraph with no link → eyebrow
      if (index === 0 && el.tagName === 'P' && !link) {
        const eyebrow = document.createElement('p');
        eyebrow.className = 'split-banner-eyebrow';
        eyebrow.textContent = el.textContent.trim();
        textWrap.append(eyebrow);
        return;
      }
   
      // Heading tags → main title
      if (/^H[1-6]$/.test(el.tagName)) {
        const heading = document.createElement('h2');
        heading.className = 'split-banner-heading';
        heading.textContent = el.textContent.trim();
        textWrap.append(heading);
        return;
      }
   
      // Paragraph with a link → CTA button
      if (link) {
        const cta = document.createElement('a');
        cta.className = 'split-banner-cta';
        cta.href = link.href;
        cta.textContent = link.textContent.trim();
        textWrap.append(cta);
        return;
      }
   
      // Any other paragraph → description
      if (el.tagName === 'P' && el.textContent.trim()) {
        const desc = document.createElement('p');
        desc.className = 'split-banner-description';
        desc.textContent = el.textContent.trim();
        textWrap.append(desc);
      }
    });
   
    // ── Rebuild block ────────────────────────────────────────────
    block.textContent = '';
   
    const inner = document.createElement('div');
    inner.className = 'split-banner-inner';
   
    // Order in DOM matches visual order (CSS handles the swap via flex-direction)
    if (cellAHasImage) {
      inner.append(mediaWrap, textWrap);
    } else {
      inner.append(textWrap, mediaWrap);
    }
   
    block.append(inner);
  }