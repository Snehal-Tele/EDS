
export default function decorate(block) {
    const link = block.querySelector('a');
    const picture = block.querySelector('picture');
   
    if (!link) return;
   
    // preserve original text and href before rebuilding
    const linkText = link.textContent.trim();
    const linkHref = link.getAttribute('href');
   
    // build new anchor structure
    const newLink = document.createElement('a');
    newLink.className = 'headerv2-link';
    newLink.setAttribute('href', linkHref);
   
    if (picture) {
      const iconWrapper = document.createElement('span');
      iconWrapper.className = 'headerv2-icon';
      iconWrapper.append(picture);
      newLink.append(iconWrapper);
    }
   
    const title = document.createElement('span');
    title.className = 'headerv2-title';
    title.textContent = linkText;
    newLink.append(title);
   
    // clear block and insert new markup
    block.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'headerv2-wrapper';
    wrapper.append(newLink);
    block.append(wrapper);
  }