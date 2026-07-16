
export default function decorate(block) {
    const guidelineRow = [...block.children].find((row) =>
      row.textContent.trim().includes('Guidelines')
    );
   
    if (!guidelineRow) return;
   
    guidelineRow.classList.add('nav-guidelines');
   
    const trigger = guidelineRow.querySelector('p');
    if (!trigger) return;
   
    trigger.classList.add('guidelines-trigger');
   
    const sourceList = guidelineRow.querySelector('ul');
    if (!sourceList) return;
   
    const megaMenu = document.createElement('div');
    megaMenu.className = 'guidelines-mega-menu';
   
    [...sourceList.children].forEach((item) => {
      const column = document.createElement('div');
      column.className = 'mega-column';
   
      const parentLink = item.querySelector(':scope > a');
   
      if (parentLink) {
        const heading = document.createElement('h3');
   
        heading.innerHTML = `
          ${parentLink.href}
            ${parentLink.textContent}
            <span class="arrow">›</span>
          </a>
        `;
   
        column.appendChild(heading);
      }
   
      const childList = item.querySelector(':scope > ul');
   
      if (childList) {
        const newList = document.createElement('ul');
   
        [...childList.children].forEach((child) => {
          newList.appendChild(child.cloneNode(true));
        });
   
        column.appendChild(newList);
      }
   
      megaMenu.appendChild(column);
    });
   
    guidelineRow.appendChild(megaMenu);
   
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
   
      guidelineRow.classList.toggle('open');
    });
   
    document.addEventListener('click', (e) => {
      if (!guidelineRow.contains(e.target)) {
        guidelineRow.classList.remove('open');
      }
    });
  }