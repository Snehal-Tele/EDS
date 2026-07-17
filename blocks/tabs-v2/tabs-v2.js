export default function decorate(block) {
    const tabNav = document.createElement('div');
    tabNav.classList.add('tabs-v2-nav');
  
    const rows = [...block.children];
  
    rows.forEach((row, index) => {
      // Handle the first row (Select A Vehicle)
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
          plusIcon.classList.add('icon-plus');
          plusIcon.textContent = iconCell ? iconCell.textContent.trim() : '+';
  
          anchor.appendChild(plusIcon);
          vehicleBtn.appendChild(anchor);
          tabNav.appendChild(vehicleBtn);
        }
        return;
      }
  
      // Handle all subsequent rows (Tabs)
      const tabCell = row.children[0];
      if (tabCell) {
        const tabItem = document.createElement('div');
        tabItem.classList.add('tabs-v2-item');
        
        if (index === 1) {
          tabItem.classList.add('tabs-right-group-start');
        }
  
        const anchor = tabCell.querySelector('a') || document.createElement('a');
        if (!tabCell.querySelector('a')) {
          anchor.textContent = tabCell.textContent.trim();
          anchor.href = '#'; 
        }
        anchor.classList.add('tabs-v2-link');
  
        // Wrap raw text to keep dimensions stable
        const textSpan = document.createElement('span');
        textSpan.classList.add('tabs-text');
        textSpan.textContent = anchor.textContent;
        anchor.textContent = ''; // Clear text
        anchor.appendChild(textSpan);
  
        // Append the absolute-positioned hover arrow
        const arrowSpan = document.createElement('span');
        arrowSpan.classList.add('hover-arrow');
        arrowSpan.innerHTML = '&gt;';
        anchor.appendChild(arrowSpan);
  
        tabItem.appendChild(anchor);
        tabNav.appendChild(tabItem);
      }
    });
  
    block.textContent = '';
    block.appendChild(tabNav);
  }