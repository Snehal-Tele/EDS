
export default function decorate(block) {
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-brand-content';
   
    [...block.children].forEach((row) => {
      const cells = [...row.children];
      const picture = row.querySelector('picture');
      const links = [...row.querySelectorAll('a')];
      const text = row.textContent.trim();
   
      // ── Logo + wordmark row ──────────────────────────────
      if (picture) {
        const logoRow = document.createElement('div');
        logoRow.className = 'footer-brand-logo-row';
   
        const iconCell = cells.find((c) => c.querySelector('picture'));
        const wordmarkCell = cells.find((c) => c !== iconCell);
   
        if (iconCell) {
          iconCell.classList.add('footer-brand-icon');
          logoRow.append(iconCell);
        }
        if (wordmarkCell) {
          wordmarkCell.classList.add('footer-brand-wordmark');
          logoRow.append(wordmarkCell);
        }
        wrapper.append(logoRow);
        return;
      }
   
      // ── Links row (Privacy Notice | Legal Terms) ─────────
      if (links.length) {
        const linksRow = document.createElement('div');
        linksRow.className = 'footer-brand-links';
        links.forEach((a, i) => {
          a.classList.add('footer-brand-link');
          linksRow.append(a);
          if (i < links.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'footer-brand-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.textContent = '|';
            linksRow.append(sep);
          }
        });
        wrapper.append(linksRow);
        return;
      }
   
      // ── Copyright row (contains ©) ────────────────────────
      if (text.includes('©')) {
        const p = document.createElement('p');
        p.className = 'footer-brand-copyright';
        p.textContent = text;
        wrapper.append(p);
        return;
      }
   
      // ── Disclaimer row (anything else with text) ──────────
      if (text) {
        const p = document.createElement('p');
        p.className = 'footer-brand-disclaimer';
        p.textContent = text;
        wrapper.append(p);
      }
    });
   
    block.replaceChildren(wrapper);
  }