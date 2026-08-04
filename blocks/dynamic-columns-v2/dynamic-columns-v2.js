export default function decorate(block) {
    const rows = [...block.children];
    const cardsWrapper = document.createElement('div');
    cardsWrapper.classList.add('cards-wrapper');
    rows.forEach((row) => {
      const cells = [...row.children];
      const card = document.createElement('div');
      card.classList.add('plan-card');
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('image-wrapper');
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('card-content');
  
      imageWrapper.append(cells[0]);
      const infoBtn = document.createElement('button');
      infoBtn.classList.add('info-btn');
      infoBtn.textContent = 'Info';
      const popupText = cells[4]?.textContent?.trim() || '';
      infoBtn.dataset.popup = popupText;
      imageWrapper.append(infoBtn);
  
      const title = cells[1];
      title.classList.add('card-title');
      const description = cells[2];
      description.classList.add('description');

      const price = cells[3];
      price.classList.add('price');
  
      contentWrapper.append(
        title,
        description,
        price,
      );
  
      card.append(
        imageWrapper,
        contentWrapper,
      );
  
      cardsWrapper.append(card);
    });
  
    block.textContent = '';
    block.append(cardsWrapper);
  
    let popup = document.querySelector('.dynamic-columns-v2-popup');
  
    if (!popup) {
      popup = document.createElement('div');
      popup.className = 'dynamic-columns-v2-popup';
  
      popup.innerHTML = `
        <div class="popup-inner">
          <div class="popup-message"></div>
          <button class="popup-close" aria-label="Close">×</button>
        </div>
      `;
  
      document.body.append(popup);
      popup
        .querySelector('.popup-close')
        .addEventListener('click', () => {
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