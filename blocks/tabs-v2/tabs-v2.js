export default function decorate(block) {
  const tabNav = document.createElement('div');
  tabNav.classList.add('tabs-v2-nav');

  // Create a sub-container specifically for the scrollable right-side tabs
  const scrollGroup = document.createElement('div');
  scrollGroup.classList.add('tabs-v2-scroll-group');

  const rows = [...block.children];

  rows.forEach((row, index) => {
    // Handle the first row (Select A Vehicle) - stays separate
    if (index === 0) {
      const linkCell = row.children[0];
      const iconCell = row.children[1];
      
      if (linkCell) {
        const vehicleBtn = document.createElement('div');
        vehicleBtn.classList.add('tabs-v2-item', 'select-vehicle');
        
        const anchor = linkCell.querySelector('a') || document.createElement('span');
        if (!linkCell.querySelector('a')) anchor.textContent = linkCell.textContent.trim();
        anchor.classList.add('tabs-v2-link');

        const plusIcon = document.createElement('span');
        boxIcon = iconCell ? iconCell.textContent.trim() : '+';
        plusIcon.classList.add('icon-plus');
        plusIcon.textContent = boxIcon;

        anchor.appendChild(plusIcon);
        vehicleBtn.appendChild(anchor);
        tabNav.appendChild(vehicleBtn);
      }
      return;
    }

    // Handle subsequent rows (Tabs) - pushed into the scroll group
    const tabCell = row.children[0];
    if (tabCell) {
      const tabItem = document.createElement('div');
      tabItem.classList.add('tabs-v2-item');

      const anchor = tabCell.querySelector('a') || document.createElement('a');
      if (!tabCell.querySelector('a')) {
        anchor.textContent = tabCell.textContent.trim();
        anchor.href = '#'; 
      }
      anchor.classList.add('tabs-v2-link');

      // Wrap text
      const textSpan = document.createElement('span');
      textSpan.classList.add('tabs-text');
      textSpan.textContent = anchor.textContent;
      anchor.textContent = '';
      anchor.appendChild(textSpan);

      // Append hover arrow
      const arrowSpan = document.createElement('span');
      arrowSpan.classList.add('hover-arrow');
      arrowSpan.innerHTML = '&gt;';
      anchor.appendChild(arrowSpan);

      tabItem.appendChild(anchor);
      scrollGroup.appendChild(tabItem);
    }
  });

  tabNav.appendChild(scrollGroup);
  block.textContent = '';
  block.appendChild(tabNav);
}