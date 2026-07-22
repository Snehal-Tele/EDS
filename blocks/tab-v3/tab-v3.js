export default function decorate(block) {
  // Create tab list container
  const ul = document.createElement('ul');
  ul.classList.add('tab-v3-list');
  ul.setAttribute('role', 'tablist');

  // Process rows from table content
  const rows = [...block.children];

  rows.forEach((row, index) => {
    const cell = row.firstElementChild;
    if (!cell) return;

    const li = document.createElement('li');
    li.classList.add('tab-v3-item');
    li.setAttribute('role', 'presentation');

    // Extract link or text content
    const link = cell.querySelector('a');
    let tabBtn;

    if (link) {
      tabBtn = link;
      tabBtn.classList.add('tab-v3-btn');
    } else {
      tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.className = 'tab-v3-btn';
      tabBtn.textContent = cell.textContent.trim();
    }

    tabBtn.setAttribute('role', 'tab');
    
    // Set active state (default to first tab or match active URL)
    const isCurrentPage = link && (window.location.pathname === new URL(link.href, window.location.origin).pathname);
    if (isCurrentPage || (index === 0 && !rows.some(r => r.querySelector('a')?.href === window.location.href))) {
      tabBtn.classList.add('active');
      tabBtn.setAttribute('aria-selected', 'true');
    } else {
      tabBtn.setAttribute('aria-selected', 'false');
    }

    li.appendChild(tabBtn);
    ul.appendChild(li);
  });

  // Replace block content with formatted list
  block.textContent = '';
  block.appendChild(ul);
}