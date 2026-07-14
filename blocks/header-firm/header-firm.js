export default function decorate(block) {
    const link = block.querySelector('a');
    const picture = block.querySelector('picture');
   
    if (!link) return;
   
    // preserve original text and href before rebuilding
    const linkText = link.textContent.trim();
    const linkHref = link.getAttribute('href');
   
    // build new anchor structure
    const newLink = document.createElement('a');
    newLink.className = 'header-firm-link';
    newLink.setAttribute('href', linkHref);
   
    if (picture) {
      const iconWrapper = document.createElement('span');
      iconWrapper.className = 'header-firm-icon';
      iconWrapper.append(picture);
      newLink.append(iconWrapper);
    }
   
    const title = document.createElement('span');
    title.className = 'header-firm-title';
    title.textContent = linkText;
    newLink.append(title);
   
    // clear block and insert new markup
    block.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'header-firm-wrapper';
    wrapper.append(newLink);
    block.append(wrapper);
  }