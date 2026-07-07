
export default function decorate(block) {
    const rows = [...block.children];
   
    let sectionHeading = null;
    const cardRows = [];
   
    rows.forEach((row) => {
      const cells = [...row.children];
      const firstCell = cells[0];
      const hasPicture = firstCell && !!firstCell.querySelector('picture');
   
      if (!hasPicture) {
        // No image → this is the section heading row
        const text = row.textContent.trim();
        if (text) {
          sectionHeading = document.createElement('h2');
          sectionHeading.className = 'cards-image-heading';
          sectionHeading.textContent = text;
        }
      } else {
        // Has image → card row
        cardRows.push(row);
      }
    });
   
    // ── Build grid ────────────────────────────────────────────────
    const grid = document.createElement('ul');
    grid.className = 'cards-image-grid';
   
    cardRows.forEach((row) => {
      const cells = [...row.children];
      const [imageCell, contentCell] = cells;
   
      const li = document.createElement('li');
      li.className = 'cards-image-item';
   
      // Image
      const picture = imageCell.querySelector('picture');
      if (picture) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'cards-image-media';
        const img = picture.querySelector('img');
        if (img) {
          img.setAttribute('loading', 'lazy');
          img.removeAttribute('width');
          img.removeAttribute('height');
        }
        imgWrap.append(picture);
        li.append(imgWrap);
      }
   
      // Content
      const content = document.createElement('div');
      content.className = 'cards-image-content';
   
      const lines = [...contentCell.children].filter(
        (el) => el.textContent.trim() || el.querySelector('a')
      );
   
      lines.forEach((el, index) => {
        const link = el.querySelector('a');
   
        if (index === 0) {
          // First line → card title
          const title = document.createElement('h3');
          title.className = 'cards-image-title';
          title.textContent = el.textContent.trim();
          content.append(title);
          return;
        }
   
        if (link) {
          // Line with link → CTA
          const cta = document.createElement('a');
          cta.className = 'cards-image-cta';
          cta.href = link.href;
          cta.textContent = link.textContent.trim();
          content.append(cta);
          return;
        }
   
        // Middle lines → description
        const desc = document.createElement('p');
        desc.className = 'cards-image-description';
        desc.textContent = el.textContent.trim();
        content.append(desc);
      });
   
      li.append(content);
      grid.append(li);
    });
   
    // ── Rebuild block ─────────────────────────────────────────────
    block.textContent = '';
   
    // Inner wrapper constrains content width while the block bg bleeds full-width
    const inner = document.createElement('div');
    inner.className = 'cards-image-inner';
   
    if (sectionHeading) inner.append(sectionHeading);
    inner.append(grid);
    block.append(inner);
  }