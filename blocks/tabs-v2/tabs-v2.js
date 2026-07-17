export default function decorate(block) {
    const rows = [...block.children];
  
    if (!rows.length) return;
  
    const wrapper = document.createElement('div');
    wrapper.className = 'tab-v2-wrapper';
  
    /* Vehicle CTA */
    const firstRow = rows.shift();
  
    const vehicleCta = document.createElement('button');
    vehicleCta.className = 'vehicle-selector';
  
    vehicleCta.innerHTML = `
        <span>${firstRow.children[0]?.textContent.trim()}</span>
        <span class="icon">${firstRow.children[1]?.textContent.trim()}</span>
    `;
  
    wrapper.append(vehicleCta);
  
    /* Tabs */
    const tabList = document.createElement('div');
    tabList.className = 'tab-v2-list';
  
    rows.forEach((row, index) => {
      const label = row.children[0]?.textContent.trim();
      const target = row.children[1]?.textContent.trim();
  
      const tab = document.createElement('button');
  
      tab.className = `tab-v2-item ${index === 0 ? 'active' : ''}`;
  
      tab.dataset.target = target;
  
      tab.innerHTML = `
        <span>${label}</span>
        ${index === 0 ? '<span class="arrow">›</span>' : ''}
      `;
  
      tab.addEventListener('click', () => {
        tabList.querySelectorAll('.tab-v2-item').forEach((item) => {
          item.classList.remove('active');
          const arrow = item.querySelector('.arrow');
          if (arrow) arrow.remove();
        });
  
        tab.classList.add('active');
  
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '›';
  
        tab.appendChild(arrow);
  
        // Optional scroll target
        const section = document.getElementById(target);
  
        if (section) {
          section.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
  
      tabList.append(tab);
    });
  
    wrapper.append(tabList);
  
    block.textContent = '';
    block.append(wrapper);
  }