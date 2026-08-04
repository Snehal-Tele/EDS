import { getBlockConfig } from '../../scripts/utils/block-config.js';

function decorateColumnsCardGrid(block, contentRows) {
  block.classList.add('columns-card-grid');

  contentRows.forEach((row) => {
    [...row.children].forEach((col) => {
      // Tag column containing an image
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-img-col');
      }

      // Tag the last paragraph if it contains a link (CTA)
      const paragraphs = col.querySelectorAll('p');
      const lastPara = paragraphs[paragraphs.length - 1];
      if (lastPara && lastPara.querySelector('a')) {
        lastPara.classList.add('columns-card-grid-cta');
      }
    });
  });
}

function decorateColumnsWithPopup(block, contentRows) {
  block.classList.add('columns-with-popup');

  const cardsWrapper = document.createElement('div');
  cardsWrapper.classList.add('cards-wrapper');

  contentRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 0) return;

    const card = document.createElement('div');
    card.classList.add('plan-card');

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('card-content');

    if (cells[0]) {
      imageWrapper.append(cells[0]);
    }

    const infoBtn = document.createElement('button');
    infoBtn.classList.add('info-btn');
    infoBtn.setAttribute('type', 'button');
    infoBtn.textContent = 'Info';

    // Cell 4 contains the popup info text
    const popupText = cells[4]?.textContent?.trim() || '';
    infoBtn.dataset.popup = popupText;

    imageWrapper.append(infoBtn);

    const title = cells[1];
    if (title) title.classList.add('card-title');

    const description = cells[2];
    if (description) description.classList.add('description');

    const price = cells[3];
    if (price) price.classList.add('price');

    contentWrapper.append(
      ...(title ? [title] : []),
      ...(description ? [description] : []),
      ...(price ? [price] : []),
    );

    card.append(imageWrapper, contentWrapper);
    cardsWrapper.append(card);
  });

  // Clear existing content and render formatted cards
  block.textContent = '';
  block.append(cardsWrapper);

  // Setup Popup (Singleton Pattern attached to body)
  let popup = document.querySelector('.columns-with-popup-popup');

  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'columns-with-popup-popup';

    popup.innerHTML = `
      <div class="popup-inner">
        <div class="popup-message"></div>
        <button class="popup-close" aria-label="Close">×</button>
      </div>
    `;

    document.body.append(popup);

    popup.querySelector('.popup-close').addEventListener('click', () => {
      popup.classList.remove('show');
    });

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('show');
      }
    });
  }

  const popupMessage = popup.querySelector('.popup-message');

  block.querySelectorAll('.info-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      popupMessage.textContent = btn.dataset.popup;
      popup.classList.add('show');
    });
  });
}

function decorateColumnsStandard(block) {
  block.classList.add('columns-standard');

  const BLOCK = 'columns-standard';

  function addElementClass(el, element) {
    if (el) {
      el.classList.add(`${BLOCK}__${element}`);
    }
  }

  function decorateCard(card) {
    addElementClass(card, 'card');

    // Image (author uploads render as <picture> inside a <p>)
    const picture = card.querySelector('picture');
    if (picture) {
      const imageWrapper = picture.closest('p') || picture.parentElement;
      addElementClass(imageWrapper, 'image');
      addElementClass(picture, 'picture');
      addElementClass(picture.querySelector('img'), 'img');
    }

    // Title (authored as a heading; may or may not contain <strong>)
    addElementClass(card.querySelector('h1, h2, h3, h4, h5, h6'), 'title');

    // CTA link and its wrapping paragraph
    const link = card.querySelector('a');
    if (link) {
      addElementClass(link.closest('p') || link.parentElement, 'cta');
      addElementClass(link, 'link');
    }

    // Remaining paragraphs are body copy
    card.querySelectorAll(':scope > p').forEach((p) => {
      if (
        !p.classList.contains(`${BLOCK}__image`) &&
        !p.classList.contains(`${BLOCK}__title`) &&
        !p.classList.contains(`${BLOCK}__cta`)
      ) {
        addElementClass(p, 'text');
      }
    });
  }

  // Each authored row (`> div`) holds one or more cards (`> div > div`)
  const cards = [...block.querySelectorAll(':scope > div > div')];
  cards.forEach(decorateCard);
}

export default function decorate(block) {
  // 1. Extract Config (Brand, Class Name) — this also removes those rows from the DOM
  const { brand, className } = getBlockConfig(block);

  if (brand === 'toyota') {
    console.log('Toyota block');
  }
  if (brand === 'lexus') {
    console.log('Lexus block');
  }

  // 2. Remaining children are all content rows (config rows already removed above)
  const contentRows = [...block.children];

  // 3. Variant Check & Dispatch
  if (
    block.classList.contains('columns-standard') ||
    className === 'columns-standard'
  ) {
    decorateColumnsStandard(block);
    return;
  }

  if (
    block.classList.contains('columns-with-popup') ||
    className === 'columns-with-popup'
  ) {
    decorateColumnsWithPopup(block, contentRows);
    return;
  }

  // Default: Columns Card Grid
  decorateColumnsCardGrid(block, contentRows);
}