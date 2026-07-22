export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const [textCell, imageCell] = cells;

  // ── Image side ─────────────────────────────────────────────
  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'cards-v1-media';

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
  textWrap.className = 'cards-v1-text';

  let headingEl = null;
  const lines = [...textCell.children].filter((el) => el.textContent.trim());

  lines.forEach((el, index) => {
    const link = el.querySelector('a');

    if (index === 0 && !link) {
      const heading = document.createElement('h2');
      heading.className = 'cards-v1-heading';
      heading.textContent = el.textContent.trim();
      textWrap.append(heading);
      headingEl = heading;

      // Mobile inline divider — visible only on mobile via CSS
      const mobileDivider = document.createElement('div');
      mobileDivider.className = 'cards-v1-divider-mobile';
      textWrap.append(mobileDivider);
      return;
    }

    if (link) {
      const cta = document.createElement('a');
      cta.className = 'cards-v1-cta';
      cta.href = link.href;
      cta.textContent = link.textContent.trim();
      textWrap.append(cta);
      return;
    }

    const desc = document.createElement('p');
    desc.className = 'cards-v1-description';
    desc.textContent = el.textContent.trim();
    textWrap.append(desc);
  });

  // ── Desktop full-width divider ─────────────────────────────
  const desktopDivider = document.createElement('div');
  desktopDivider.className = 'cards-v1-divider';

  // ── Rebuild DOM ────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'cards-v1-inner';
  inner.append(mediaWrap, textWrap);

  block.textContent = '';
  block.append(inner, desktopDivider);

  // Position desktop divider dynamically below the heading element
  const positionDivider = () => {
    if (!headingEl || window.innerWidth <= 768) return;
    const blockTop = block.getBoundingClientRect().top;
    const headingBottom = headingEl.getBoundingClientRect().bottom;
    desktopDivider.style.top = `${headingBottom - blockTop + 8}px`;
  };

  requestAnimationFrame(positionDivider);
  window.addEventListener('resize', positionDivider);
}