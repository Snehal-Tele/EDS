
export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
 
  const cells = [...row.children];
  const [imageCell, textCell] = cells; // image is col 1, text is col 2
 
  // ── Image side (col 1) ─────────────────────────────────────
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
 
  // ── Text side (col 2) ──────────────────────────────────────
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

 
    // All other paragraphs → description
    const desc = document.createElement('p');
    desc.className = 'toyota-card-description';
    desc.textContent = el.textContent.trim();
    textWrap.append(desc);
  });
 
  // ── Rebuild block ───────────────────────────────────────────
  // DOM order: mediaWrap first (image), textWrap second (text)
  // CSS row-reverse on desktop flips to: text LEFT, image RIGHT
  // Mobile: natural order = image TOP, text BOTTOM
  const inner = document.createElement('div');
  inner.className = 'toyota-card-inner';
  inner.append(mediaWrap, textWrap);
 
  block.textContent = '';
  block.append(inner);
}