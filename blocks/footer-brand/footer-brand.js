export default function decorate(block) {
    const rows = [...block.children];
  
    if (rows.length < 5) return;
  
    const logoRow = rows[0];
    const disclaimerRow = rows[1];
    const copyrightRow = rows[2];
    const privacyRow = rows[3];
    const legalRow = rows[4];
  
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-brand-wrapper';
  
    /* Logo */
  
    const logoContainer = document.createElement('div');
    logoContainer.className = 'footer-brand-logo';
  
    const picture = logoRow.querySelector('picture');
  
    if (picture) {
      logoContainer.append(picture);
    }
  
    /* Disclaimer */
  
    const disclaimer = document.createElement('p');
    disclaimer.className = 'footer-brand-disclaimer';
    disclaimer.textContent = disclaimerRow.textContent.trim();
  
    /* Copyright */
  
    const copyright = document.createElement('p');
    copyright.className = 'footer-brand-copyright';
    copyright.textContent = copyrightRow.textContent.trim();
  
    /* Links */
  
    const links = document.createElement('div');
    links.className = 'footer-brand-links';
  
    const privacyLink = privacyRow.querySelector('a');
    const legalLink = legalRow.querySelector('a');
  
    if (privacyLink) {
      privacyLink.classList.add('footer-brand-link');
      links.append(privacyLink);
    }
  
    if (privacyLink && legalLink) {
      const separator = document.createElement('span');
      separator.className = 'footer-brand-separator';
      separator.textContent = '|';
      links.append(separator);
    }
  
    if (legalLink) {
      legalLink.classList.add('footer-brand-link');
      links.append(legalLink);
    }
  
    wrapper.append(
      logoContainer,
      disclaimer,
      copyright,
      links,
    );
  
    block.innerHTML = '';
    block.append(wrapper);
  }