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
    const rightLinksAll = [];
  
    rows.forEach((row) => {
      const cells = [...row.children];
      const [colA, colB] = cells;
      const colAHasLink = colA && colA.querySelector('a');
  
      if (colAHasLink) {
        // Links bar row — collect left and right links
        colA.querySelectorAll('a').forEach((a) => leftLinksAll.push(a));
        if (colB) colB.querySelectorAll('a').forEach((a) => rightLinksAll.push(a));
      } else {
        // Copyright row — plain text
        const text = row.textContent.trim();
        if (text) {
          const p = document.createElement('p');
          p.className = 'footer-pref-copy-line';
          p.textContent = text;
          copyright.append(p);
        }
      }
    });
  
    // Build left nav with pipe separators
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
  
    // Build right links (0 = privacy, 1 = cookie)
    rightLinksAll.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      link.className = i === 0 ? 'footer-pref-privacy-link' : 'footer-pref-cookie-link';
      barRight.append(link);
    });
  
    const bar = document.createElement('div');
    bar.className = 'footer-pref-bar';
    bar.append(barLeft, barRight);
  
    block.textContent = '';
    block.append(bar, copyright);
  }