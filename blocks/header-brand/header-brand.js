function isDecorativeRow(cellText) {
  return cellText === '';
}

function getLabelAndHref(li) {
  const directLink = li.querySelector(':scope > a, :scope > p > a, :scope > strong > a, :scope > div > a');
  if (directLink) {
    return { label: directLink.textContent.trim(), href: directLink.href };
  }
  for (const node of li.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'UL') continue;
    const text = node.textContent?.trim();
    if (text) return { label: text, href: '#' };
  }
  return { label: '', href: '#' };
}

/** Build Mega Menu Column */
function buildMegaColumn(li) {
  const col = document.createElement('div');
  col.className = 'nav-mega-col';

  const nestedList = li.querySelector(':scope > ul');
  const { label, href } = getLabelAndHref(li);

  if (!nestedList) {
    const a = document.createElement('a');
    a.className = 'nav-mega-col-title nav-mega-col-title-link';
    a.href = href;
    a.textContent = label;
    col.append(a);
    return col;
  }

  const heading = document.createElement('a');
  heading.className = 'nav-mega-col-title';
  heading.href = href;
  heading.textContent = label;
  col.append(heading);

  const list = document.createElement('ul');
  list.className = 'nav-mega-col-list';

  [...nestedList.children].forEach((item) => {
    const { label: itemLabel, href: itemHref } = getLabelAndHref(item);
    const liItem = document.createElement('li');
    const aItem = document.createElement('a');
    aItem.href = itemHref;
    aItem.textContent = itemLabel;
    liItem.append(aItem);
    list.append(liItem);
  });

  col.append(list);
  return col;
}

function buildMegaMenu(sourceList) {
  const mega = document.createElement('div');
  mega.className = 'nav-mega';
  const inner = document.createElement('div');
  inner.className = 'nav-mega-inner';

  [...sourceList.children].forEach((topLi) => {
    inner.append(buildMegaColumn(topLi));
  });

  mega.append(inner);
  return mega;
}

function closeAllDropdowns(nav) {
  nav.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-search-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Search');
  btn.innerHTML = `
    <svg class="nav-search-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span class="search-text">Search</span>
  `;

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'nav-search-input';
  input.placeholder = 'Search brand.toyota.com';

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    wrapper.classList.toggle('nav-search-open', !expanded);
    if (!expanded) input.focus();
  });

  wrapper.append(btn, input);
  return wrapper;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const nav = document.createElement('nav');
  nav.className = 'nav-brand';
  nav.setAttribute('aria-label', 'Brand site header');

  const overlay = document.createElement('div');
  overlay.className = 'nav-mobile-overlay';

  // --- Row 0: Logo ---
  const brandRow = rows[0];
  if (brandRow) {
    const brandWrap = document.createElement('a');
    brandWrap.className = 'nav-logo';
    brandWrap.href = '/';
    brandWrap.setAttribute('aria-label', 'Toyota home');

    const picture = brandRow.querySelector('picture');
    if (picture) brandWrap.append(picture.cloneNode(true));

    const brandText = [...brandRow.querySelectorAll('div')]
      .map((d) => d.textContent.trim())
      .find((t) => t && !picture?.closest('div')?.textContent.includes(t));

    if (brandText) {
      const span = document.createElement('span');
      span.className = 'nav-logo-text';
      span.textContent = brandText;
      brandWrap.append(span);
    }
    nav.append(brandWrap);
  }

  // --- Desktop Navigation Bar ---
  const sections = document.createElement('ul');
  sections.className = 'nav-sections';

  // --- Mobile Drawer Menu ---
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  const mobileList = document.createElement('ul');
  mobileList.className = 'mobile-menu-list';

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];
    const firstCellText = cells[0]?.textContent.trim() ?? '';
    if (isDecorativeRow(firstCellText)) continue;

    const label = firstCellText.toLowerCase();

    // Skip utility items from center navigation bar
    if (label === 'search' || label === 'log in') continue;

    const nestedList = cells[1]?.querySelector('ul');
    const firstLink = cells[0].querySelector('a');

    // Build Desktop Section Node
    const li = document.createElement('li');
    li.className = 'nav-section';

    if (nestedList) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-dropdown-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      // SVG chevron arrow matching the original Toyota site
      trigger.innerHTML = `
        ${firstCellText}
        <span class="nav-caret" aria-hidden="true">
          <svg viewBox="0 0 12 8">
            <path d="M1 1l5 5 5-5" />
          </svg>
        </span>
      `;

      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns(nav);
        trigger.setAttribute('aria-expanded', String(!expanded));
      });

      li.append(trigger, buildMegaMenu(nestedList));
    } else {
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = firstLink ? firstLink.href : '#';
      a.textContent = firstCellText;
      li.append(a);
    }
    sections.append(li);

    // Build Mobile Item Node
    const mLi = document.createElement('li');
    if (nestedList) {
      const mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.innerHTML = `<span>${firstCellText}</span><span class="mobile-chevron">&#8250;</span>`;
      mLi.append(mBtn);
    } else {
      const mA = document.createElement('a');
      mA.href = firstLink ? firstLink.href : '#';
      mA.textContent = firstCellText;
      mLi.append(mA);
    }
    mobileList.append(mLi);
  }

  // Mobile Log In Link
  const loginRow = rows.find((r) => r.children[0]?.textContent.trim().toLowerCase() === 'log in');
  const loginLink = loginRow?.querySelector('a');
  const mLoginLi = document.createElement('li');
  const mLoginA = document.createElement('a');
  mLoginA.href = loginLink ? loginLink.href : '#';
  mLoginA.textContent = 'Log In';
  mLoginLi.append(mLoginA);
  mobileList.append(mLoginLi);

  drawer.append(mobileList);
  nav.append(sections);

  // --- Right-Side Actions ---
  const actions = document.createElement('div');
  actions.className = 'nav-actions';
  actions.append(buildSearch());

  // Desktop Login Pill Button
  const loginBtn = document.createElement('a');
  loginBtn.className = 'nav-login';
  loginBtn.href = loginLink ? loginLink.href : '#';
  loginBtn.textContent = 'Log In';
  actions.append(loginBtn);

  // Mobile Hamburger Menu Button
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle Navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `
    <div class="icon-menu">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="icon-close">&#10005;</div>
  `;

  const toggleMobileMenu = () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isExpanded));
    nav.classList.toggle('nav-open', !isExpanded);
    document.body.classList.toggle('nav-menu-open', !isExpanded);
  };

  hamburger.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', toggleMobileMenu);

  actions.append(hamburger);
  nav.append(actions);
  nav.append(drawer);
  nav.append(overlay);

  // Global Event Handlers
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns(nav);
      if (nav.classList.contains('nav-open')) toggleMobileMenu();
    }
  });

  block.textContent = '';
  block.append(nav);
}