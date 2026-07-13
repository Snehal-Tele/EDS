import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// domains used to detect social links and label them for accessibility
const SOCIAL_NETWORKS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  'x.com': 'X',
  twitter: 'X',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
};

/**
 * Returns the matching social network label for a URL, or null.
 * @param {string} href
 */
function socialNetworkFor(href) {
  const match = Object.keys(SOCIAL_NETWORKS).find((key) => href.includes(key));
  return match ? SOCIAL_NETWORKS[match] : null;
}

/**
 * Decorates the social section: converts links into icon links with labels
 * and ensures they open safely in a new tab.
 * @param {Element} section
 */
function decorateSocial(section) {
  section.querySelectorAll('a').forEach((link) => {
    const network = socialNetworkFor(link.href);
    const label = network || link.textContent.trim();
    link.setAttribute('aria-label', label);
    link.setAttribute('title', label);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    if (network) {
      // hide the text label, expose an icon hook scoped by network name
      link.classList.add('social-link', `social-${network.toLowerCase()}`);
      link.textContent = '';
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // decorate each authored section by its Section Metadata "Style" class
  const socialSection = footer.querySelector('.social');
  if (socialSection) decorateSocial(socialSection);

  block.append(footer);
}
