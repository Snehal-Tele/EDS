
export default function decorate(block) {
    const rows = [...block.children];
  
    if (rows.length < 2) return;
  
    const logoRow = rows[0];
    const titleRow = rows[1];
  
    const picture = logoRow.querySelector('picture');
    const title = titleRow.textContent.trim();
  
    const link = document.createElement('a');
    link.href = '/';
    link.classList.add('header-firm-link');
  
    if (picture) {
      link.append(picture);
    }
  
    const titleEl = document.createElement('span');
    titleEl.classList.add('header-firm-title');
    titleEl.textContent = title;
  
    link.append(titleEl);
  
    block.textContent = '';
    block.append(link);
  }