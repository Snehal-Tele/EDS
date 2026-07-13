
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Footer block for toyota.com/preferences style footer
 *
 * Footer document table structure:
 *
 * | footer                              |                              |
 * |-------------------------------------|------------------------------|
 * | [Privacy Notice](url)               | [Your Privacy Choices](url)  |
 * | [Legal Terms](url)                  | [Cookie Consent Options](url)|
 * |-------------------------------------|------------------------------|
 * | ©2026 Toyota Motor Sales, U.S.A., Inc. All information applies to U.S. vehicles only. | |
 * | The use of Olympic Marks, Terminology and Imagery is authorized...  | |
 *
 * Row 1 → links bar  (col1: left nav links | col2: right privacy links)
 * Row 2+ → copyright lines
 */

// ── Row 1: Two-column links bar ───────────────────────────────
function buildLinksBar(row) {
  const [leftCell, rightCell] = [...row.children];

  const bar = document.createElement('div');
  bar.className = 'footer-bar';

  // Left: Privacy Notice | Legal Terms
  const left = document.createElement('div');
  left.className = 'footer-bar-left';

  [...(leftCell?.querySelectorAll('a') || [])].forEach((a, i, arr) => {
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim();
    link.className = 'footer-nav-link';
    left.append(link);

    if (i < arr.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'footer-nav-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '|';
      left.append(sep);
    }
  });

  // Right: Your Privacy Choices + Cookie Consent Options
  const right = document.createElement('div');
  right.className = 'footer-bar-right';

  [...(rightCell?.querySelectorAll('a') || [])].forEach((a, i) => {
    const link = document.createElement('a');
    link.href = a.href;
    link.textContent = a.textContent.trim();

    if (i === 0) {
      // "Your Privacy Choices" — red + toggle icon
      link.className = 'footer-privacy-link';
      const icon = document.createElement('span');
      icon.className = 'footer-privacy-icon';
      icon.setAttribute('aria-hidden', 'true');
      link.append(icon);
    } else {
      // "Cookie Consent Options"
      link.className = 'footer-cookie-link';
    }

    right.append(link);
  });

  bar.append(left, right);
  return bar;
}

// ── Rows 2+: Copyright text ───────────────────────────────────
function buildCopyright(rows) {
  const wrap = document.createElement('div');
  wrap.className = 'footer-copyright';

  rows.forEach((row) => {
    const text = row.textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    p.className = 'footer-copyright-line';
    p.textContent = text;
    wrap.append(p);
  });

  return wrap;
}

// ── Main decorator ────────────────────────────────────────────
export default async function decorate(block) {
  // Load footer as fragment (standard EDS approach — keeps getMetadata)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  // Move fragment content into a wrapper div
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Find rows inside the loaded fragment
  const source = footer.querySelector('.footer') || footer;
  const rows = [...source.querySelectorAll(':scope > div')];

  if (rows.length) {
    const inner = document.createElement('div');
    inner.className = 'footer-inner';

    // Row 0 → links bar
    if (rows[0]) inner.append(buildLinksBar(rows[0]));

    // Rows 1+ → copyright
    if (rows.length > 1) inner.append(buildCopyright(rows.slice(1)));

    source.textContent = '';
    source.append(inner);
  }

  block.append(footer);
}