
export default function decorate(block) {
    const row = block.querySelector(':scope > div');
    if (!row) return;
   
    const cells = [...row.children];
    const [textCell, imageCell] = cells;
   
    // ── Text side ──────────────────────────────────────────────
    const textWrap = document.createElement('div');
    textWrap.className = 'toyota-card-text';
   
    const lines = [...textCell.children].filter((el) => el.textContent.trim());
   
    lines.forEach((el, index) => {
      const link = el.querySelector('a');
   
      // First line → heading
      if (index === 0 && !link) {
        const heading = document.createElement('h2');
        heading.className = 'toyota-card-heading';
        heading.textContent = el.textContent.trim();
        textWrap.append(heading);
        return;
      }
   
      // Link → CTA (optional)
      if (link) {
        const cta = document.createElement('a');
        cta.className = 'toyota-card-cta';
        cta.href = link.href;
        cta.textContent = link.textContent.trim();
        textWrap.append(cta);
        return;
      }
   
      // ALL other paragraphs → description (appended one after another)
      const desc = document.createElement('p');
      desc.className = 'toyota-card-description';
      desc.textContent = el.textContent.trim();
      textWrap.append(desc);
    });
   
    // ── Image side ─────────────────────────────────────────────
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'toyota-card-media';
   
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
    inner.className = 'toyota-card-inner';
    inner.append(textWrap, mediaWrap);
   
    block.textContent = '';
    block.append(inner);
  }
   