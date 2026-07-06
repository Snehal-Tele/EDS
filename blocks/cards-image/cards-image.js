export default function decorate(block) {
    const rows = [...block.children];
   
    // ── Section heading ─────────────────────────────────────────
    // First row: single cell spanning both columns = the section heading
    const headingRow = rows[0];
    const headingText = headingRow?.textContent.trim();
   
    const sectionHeading = document.createElement('h2');
    sectionHeading.className = 'info-cards-heading';
    sectionHeading.textContent = headingText;
   
    // ── Card rows ─────────────────────────────────────────────────
    const grid = document.createElement('ul');
    grid.className = 'info-cards-grid';
   
    rows.slice(1).forEach((row) => {
      const cells = [...row.children];
      const [imageCell, contentCell] = cells;
   
      if (!imageCell || !contentCell) return;
   
      const li = document.createElement('li');
      li.className = 'info-cards-item';
   
      // Image
      const picture = imageCell.querySelector('picture');
      if (picture) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'info-cards-image';
        const img = picture.querySelector('img');
        if (img) img.setAttribute('loading', 'lazy');
        imgWrap.append(picture);
        li.append(imgWrap);
      }
   
      // Content
      const content = document.createElement('div');
      content.className = 'info-cards-content';
   
      const children = [...contentCell.children];
   
      children.forEach((el, index) => {
        const link = el.querySelector('a');
   
        // First element → card heading
        if (index === 0) {
          const heading = document.createElement('h3');
          heading.className = 'info-cards-title';
          heading.textContent = el.textContent.trim();
          content.append(heading);
          return;
        }
   
        // Element with a link → CTA
        if (link) {
          const cta = document.createElement('a');
          cta.className = 'info-cards-cta';
          cta.href = link.href;
          cta.textContent = link.textContent.trim();
          content.append(cta);
          return;
        }
   
        // Everything else → description
        if (el.textContent.trim()) {
          const desc = document.createElement('p');
          desc.className = 'info-cards-description';
          desc.textContent = el.textContent.trim();
          content.append(desc);
        }
      });
   
      li.append(content);
      grid.append(li);
    });
   
    // ── Rebuild block ─────────────────────────────────────────────
    block.textContent = '';
    block.append(sectionHeading, grid);
  }