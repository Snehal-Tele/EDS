
 
export default function decorate(block) {
    const rows = [...block.children];
    if (!rows.length) return;
   
    const barLeft  = document.createElement('div');
    barLeft.className = 'footer-pref-bar-left';
   
    const barRight = document.createElement('div');
    barRight.className = 'footer-pref-bar-right';
   
    const copyright = document.createElement('div');
    copyright.className = 'footer-pref-copyright';
   
    const leftLinksAll  = [];
    const rightItemsAll = []; // stores { text, href } — href is null for plain text
   
    rows.forEach((row) => {
      const cells = [...row.children];
      const [colA, colB] = cells;
      const colAHasLink = colA && colA.querySelector('a');
   
      if (colAHasLink) {
        // ── Links bar row ──────────────────────────────────
        // Collect left links
        colA.querySelectorAll('a').forEach((a) => leftLinksAll.push(a));
   
        // Collect right items — link OR plain text
        if (colB) {
          const rightLink = colB.querySelector('a');
          const rightText = colB.textContent.trim();
   
          if (rightLink) {
            // It's a link
            rightItemsAll.push({ text: rightLink.textContent.trim(), href: rightLink.href });
          } else if (rightText) {
            // It's plain text (no href)
            rightItemsAll.push({ text: rightText, href: null });
          }
        }
      } else {
        // ── Copyright row ──────────────────────────────────
        const text = row.textContent.trim();
        if (text) {
          const p = document.createElement('p');
          p.className = 'footer-pref-copy-line';
          p.textContent = text;
          copyright.append(p);
        }
      }
    });
   
    // ── Build left nav with pipe separators ───────────────────
    leftLinksAll.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      link.className = 'footer-pref-nav-link';
      barLeft.append(link);
   
      if (i < leftLinksAll.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'footer-pref-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '|';
        barLeft.append(sep);
      }
    });
   
    // ── Build right items ─────────────────────────────────────
    // Index 0 = "Your Privacy Choices" (red + icon)
    // Index 1 = "Cookie Consent Options" (gray — link or plain text)
    rightItemsAll.forEach(({ text, href }, i) => {
      if (i === 0) {
        // Always an <a> (Your Privacy Choices)
        const link = document.createElement('a');
        link.href = href || '#';
        link.textContent = text;
        link.className = 'footer-pref-privacy-link';
        barRight.append(link);
      } else if (href) {
        // Plain link (Cookie Consent Options as link)
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        link.className = 'footer-pref-cookie-link';
        barRight.append(link);
      } else {
        // Plain text (Cookie Consent Options as non-link)
        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'footer-pref-cookie-link';
        barRight.append(span);
      }
    });
   
    // ── Assemble & rebuild ────────────────────────────────────
    const bar = document.createElement('div');
    bar.className = 'footer-pref-bar';
    bar.append(barLeft, barRight);
   
    block.textContent = '';
    block.append(bar, copyright);
  }
   