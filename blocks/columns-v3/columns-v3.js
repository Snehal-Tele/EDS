const BLOCK = 'columns-v3';

/**
 * Adds a BEM element class (`block__element`) to a node, if present.
 * @param {Element|null} el The element to decorate
 * @param {string} element The BEM element name
 */
function addElementClass(el, element) {
  if (el) {
    el.classList.add(`${BLOCK}__${element}`);
  }
}

/**.
 * @param {Element} card The card element
 */
function decorateCard(card) {
  addElementClass(card, 'card');

  // Image (author uploads render as <picture> inside a <p>).
  const picture = card.querySelector('picture');
  if (picture) {
    const imageWrapper = picture.closest('p');
    addElementClass(imageWrapper, 'image');
    addElementClass(picture, 'picture');
    addElementClass(picture.querySelector('img'), 'img');
  }

  // Title (authored as a heading; may or may not contain <strong>).
  addElementClass(card.querySelector('h1, h2, h3, h4, h5, h6'), 'title');

  // CTA link and its wrapping paragraph.
  const link = card.querySelector('a');
  if (link) {
    addElementClass(link.closest('p'), 'cta');
    addElementClass(link, 'link');
  }

  // Remaining paragraphs are body copy.
  card.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.classList.contains(`${BLOCK}__image`)
      && !p.classList.contains(`${BLOCK}__title`)
      && !p.classList.contains(`${BLOCK}__cta`)) {
      addElementClass(p, 'text');
    }
  });
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Each authored row (`> div`) holds one or more cards (`> div > div`).
  const cards = [...block.querySelectorAll(':scope > div > div')];
  cards.forEach(decorateCard);
}
