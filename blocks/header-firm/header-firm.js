export default function decorate(block) {
    const rows = [...block.children];
  
    if (rows.length < 2) return;
  
    const logoRow = rows[0];
    const titleRow = rows[1];
  
    const logoLink = logoRow.querySelector('a');
    const titleLink = titleRow.querySelector('a');
  
    const picture = logoRow.querySelector('picture');
  
    // Use authored URL
    const href = logoLink?.href || titleLink?.href || '#';
  
    const link = document.createElement('a');
    link.href = href;
    link.className = 'header-firm-link';
  
    if (picture) {
      link.append(picture);
    }
  
    const titleEl = document.createElement('span');
    titleEl.className = 'header-firm-title';
    titleEl.textContent = titleLink
      ? titleLink.textContent.trim()
      : titleRow.textContent.trim();
  
    link.append(titleEl);
  
    block.replaceChildren(link);
  }