
export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
 
  const cells = [...row.children];
  const [textCell, imageCell] = cells;
 
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
 
  // ── Text side ──────────────────────────────────────────────
  const textWrap = document.createElement('div');
  textWrap.className = 'toyota-card-text';
 
  let headingEl = null;
  const lines = [...textCell.children].filter((el) => el.textContent.trim());
 
  lines.forEach((el, index) => {
    const link = el.querySelector('a');
 
    if (index === 0 && !link) {
      const heading = document.createElement('h2');
      heading.className = 'toyota-card-heading';
      heading.textContent = el.textContent.trim();
      textWrap.append(heading);
      headingEl = heading;
 
      // Mobile inline divider — visible only on mobile via CSS
      const mobileDivider = document.createElement('div');
      mobileDivider.className = 'toyota-card-divider-mobile';
      textWrap.append(mobileDivider);
      return;
    }

    const desc = document.createElement('p');
    desc.className = 'toyota-card-description';
    desc.textContent = el.textContent.trim();
    textWrap.append(desc);
  });
 
  // ── Desktop full-width divider (block level) ───────────────
  const desktopDivider = document.createElement('div');
  desktopDivider.className = 'toyota-card-divider';
 
  // ── Rebuild — image FIRST in DOM ───────────────────────────
  // Mobile  (flex-direction: column)      → image top, text bottom
  // Desktop (flex-direction: row-reverse) → text left, image right
  const inner = document.createElement('div');
  inner.className = 'toyota-card-inner';
  inner.append(mediaWrap, textWrap); // image first
 
  block.textContent = '';
  block.append(inner, desktopDivider);
 
  // Position desktop divider below heading
  const positionDivider = () => {
    if (!headingEl || window.innerWidth <= 768) return;
    const blockTop      = block.getBoundingClientRect().top + window.scrollY;
    const headingBottom = headingEl.getBoundingClientRect().bottom + window.scrollY;
    desktopDivider.style.top = `${headingBottom - blockTop + 8}px`;
  };
 
  requestAnimationFrame(positionDivider);
  window.addEventListener('resize', positionDivider);
}