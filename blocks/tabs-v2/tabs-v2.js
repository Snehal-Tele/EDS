export default function decorate(block) {
    // Create navigation container
    const tabNav = document.createElement('div');
    tabNav.classList.add('tab-v2-nav');
  
    const rows = [...block.children];
  
    rows.forEach((row, index) => {
      // Handle the first row uniquely (Select A Vehicle + Plus icon)
      if (index === 0) {
        const linkCell = row.children[0];
        const iconCell = row.children[1];
        
        if (linkCell) {
          const vehicleBtn = document.createElement('div');
          vehicleBtn.classList.add('tab-v2-item', 'select-vehicle');
          
          // Grab the authored anchor link if present, or just text
          const anchor = linkCell.querySelector('a') || document.createElement('span');
          if (!linkCell.querySelector('a')) anchor.textContent = linkCell.textContent.trim();
          anchor.classList.add('tab-v2-link');
  
          // Add the "+" icon span
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
        tabItem.classList.add('tab-v2-item');
  
        const anchor = tabCell.querySelector('a') || document.createElement('a');
        if (!tabCell.querySelector('a')) {
          anchor.textContent = tabCell.textContent.trim();
          anchor.href = '#'; // Fallback if not authored as a link
        }
        anchor.classList.add('tab-v2-link');
  
        // Set the first actual tab ("Connected Services") as active by default
        if (index === 1) {
          anchor.classList.add('active');
          // Optional: Add the subtle white right chevron logic seen in the image
          const chevron = document.createElement('span');
          chevron.classList.add('icon-chevron');
          chevron.innerHTML = ' &gt;';
          anchor.appendChild(chevron);
        }
  
        tabItem.appendChild(anchor);
        tabNav.appendChild(tabItem);
      }
    });
  
    // Replace original table DOM structure with refined navigation bar
    block.textContent = '';
    block.appendChild(tabNav);
  
    // Simple active state switching for the tab anchors
    tabNav.querySelectorAll('.tab-v2-item:not(.select-vehicle) .tab-v2-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        // If they are local anchor switches, prevent default behavior
        if (link.getAttribute('href').startsWith('#')) {
          e.preventDefault();
        }
        tabNav.querySelectorAll('.tab-v2-link').forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }