export default function decorate(block) {
     // Get the single row of data containing the two columns
    const row = block.firstElementChild;
    if (!row) return;
  
    row.classList.add('media-block-wrapper');
  
    // Destructure the two main columns (Image and Content)
    const [imageCol, contentCol] = [...row.children];
  
    if (imageCol) imageCol.classList.add('media-block-image');
    
    if (contentCol) {
      contentCol.classList.add('media-block-content');
  
      // Handle the Eyebrow text (assuming it's the first text element, like a paragraph or small heading)
      const firstElement = contentCol.firstElementChild;
      if (firstElement && firstElement.tagName === 'P' && !firstElement.querySelector('picture, a')) {
        firstElement.classList.add('media-block-eyebrow');
      }
  
      // Wrap buttons/links to apply the pill style safely
      const links = contentCol.querySelectorAll('a');
      links.forEach((link) => {
        link.classList.add('button', 'primary', 'pill-button');
      });
    }
  }