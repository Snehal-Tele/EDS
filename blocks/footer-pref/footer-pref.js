/*
 * Footer Pref block
 * Place at: /blocks/footer-pref/footer-pref.js
 *
 * ── Document table structure (in your /footer file) ─────────
 *
 * | footer-pref                                        |                               |
 * |----------------------------------------------------|-------------------------------|
 * | [Privacy Notice](url)  [Legal Terms](url)          | [Your Privacy Choices](url)   |
 * |                                                    | [Cookie Consent Options](url) |
 * | ©2026 Toyota Motor Sales, U.S.A., Inc...           |                               |
 * | The use of Olympic Marks, Terminology...            |                               |
 *
 * Row 1  → Links bar  (col1 = left nav | col2 = right privacy links)
 * Row 2+ → Copyright lines
 */

export default function decorate(block) {
    const rows = [...block.children];
    if (!rows.length) return;
  
    // ── Row 0 → Links bar ─────────────────────────────────────
    const linksRow = rows[0];
    const [leftCell, rightCell] = [...linksRow.children];
  
    const bar = document.createElement('div');
    bar.className = 'footer-pref-bar';
  
    // Left — "Privacy Notice | Legal Terms"
    const barLeft = document.createElement('div');
    barLeft.className = 'footer-pref-bar-left';
  
    const leftLinks = [...(leftCell?.querySelectorAll('a') || [])];
    leftLinks.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      link.className = 'footer-pref-nav-link';
      barLeft.append(link);
  
      // Pipe separator between links
      if (i < leftLinks.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'footer-pref-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        barLeft.append(sep);
      }
    });
  
    // Right — "Your Privacy Choices" + "Cookie Consent Options"
    const barRight = document.createElement('div');
    barRight.className = 'footer-pref-bar-right';
  
    const rightLinks = [...(rightCell?.querySelectorAll('a') || [])];
    rightLinks.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      // First link = red "Your Privacy Choices" with toggle icon
      // Second link = gray "Cookie Consent Options"
      link.className = i === 0 ? 'footer-pref-privacy-link' : 'footer-pref-cookie-link';
      barRight.append(link);
    });
  
    bar.append(barLeft, barRight);
  
    // ── Rows 1+ → Copyright lines ─────────────────────────────
    const copyright = document.createElement('div');
    copyright.className = 'footer-pref-copyright';
  
    rows.slice(1).forEach((row) => {
      const text = row.textContent.trim();
      if (!text) return;
      const p = document.createElement('p');
      p.className = 'footer-pref-copy-line';
      p.textContent = text;
      copyright.append(p);
    });
  
    // ── Rebuild block ──────────────────────────────────────────
    block.textContent = '';
    block.append(bar, copyright);
  }