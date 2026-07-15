
export default function decorate(block) {
    // Extract rows from the authoring table matrix
    const rows = [...block.children];
    
    // Clear layout wrapper markup
    block.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'footer-brand-container';
  
    rows.forEach((row) => {
      const [keyCol, valueCol] = [...row.children];
      if (!keyCol || !valueCol) return;
  
      const key = keyCol.textContent.trim().toLowerCase();
  
      // 1. Logo Handling
      if (key === 'logo') {
        const logoWrap = document.createElement('div');
        logoWrap.className = 'footer-brand-logo';
        logoWrap.innerHTML = valueCol.innerHTML;
        container.append(logoWrap);
      }
      
      // 2. Main Text Disclaimer Handling
      else if (key === 'disclaimer') {
        const textWrap = document.createElement('p');
        textWrap.className = 'footer-brand-disclaimer';
        textWrap.textContent = valueCol.textContent.trim();
        container.append(textWrap);
      }
      
      // 3. Copyright Row Handling
      else if (key === 'copyright') {
        const copyWrap = document.createElement('p');
        copyWrap.className = 'footer-brand-copyright';
        copyWrap.textContent = valueCol.textContent.trim();
        container.append(copyWrap);
      }
      
      // 4. Fine Print Utility Links Handling
      else if (key === 'links') {
        const linksWrap = document.createElement('div');
        linksWrap.className = 'footer-brand-links';
        
        const anchors = [...valueCol.querySelectorAll('a')];
        anchors.forEach((anchor, index) => {
          const a = document.createElement('a');
          a.href = anchor.href;
          a.textContent = anchor.textContent;
          a.className = 'footer-brand-link';
          linksWrap.append(a);
  
          // Append decorative separator pipe if it's not the last link
          if (index < anchors.length - 1) {
            const sep = document.createElement('span');
            sep.className = 'footer-brand-sep';
            sep.textContent = '|';
            linksWrap.append(sep);
          }
        });
        container.append(linksWrap);
      }
    });
  
    block.append(container);
  }