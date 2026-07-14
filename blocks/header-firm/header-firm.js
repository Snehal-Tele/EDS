export default function decorate(block) {
    const picture = block.querySelector('picture');
    const link = block.querySelector('a');
    const fallbackParagraph = block.querySelector('p:not(:has(picture))');
   
    const wrapper = document.createElement('div');
    wrapper.className = 'header-firm-inner';
   
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'header-firm-icon';
    if (picture) {
      const img = picture.querySelector('img');
      if (img) img.setAttribute('loading', 'eager');
      iconWrapper.append(picture);
    }
   
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'header-firm-title';
    if (link) {
      // keep it as a real link (for a11y / actual navigation) but let CSS
      // handle the visual styling instead of default browser link styles
      titleWrapper.append(link);
    } else if (fallbackParagraph) {
      titleWrapper.append(fallbackParagraph);
    }
   
    wrapper.append(iconWrapper, titleWrapper);
    block.replaceChildren(wrapper);
  }