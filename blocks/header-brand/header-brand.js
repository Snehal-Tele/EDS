function isDecorativeRow(cellText) {
  return cellText === '';
}

function getLabelAndHref(element) {
  const link = element.querySelector(':scope > a, :scope > p > a, :scope > strong > a, :scope > div > a');
  if (link) {
    return { label: link.textContent.trim(), href: link.href };
  }
  
  let text = '';
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'UL') {
      text += node.textContent;
    }
  });
  
  return { label: text.trim(), href: '#' };
}

function getRightChevronSVG() {
  return `
    <span class="right-chevron" aria-hidden="true">
      <svg viewBox="0 0 8 12">
        <path d="M1 1l5 5-5 5" />
      </svg>
    </span>
  `;
}

function buildMegaGroup(li) {
  const group = document.createElement('div');
  group.className = 'nav-mega-group';

  const nestedList = li.querySelector(':scope > ul');
  const { label, href } = getLabelAndHref(li);

  const title = document.createElement('a');
  title.className = 'nav-mega-group-title';
  title.href = href;
  title.innerHTML = `<span>${label}</span>${getRightChevronSVG()}`;
  group.append(title);

  if (nestedList) {
    const list = document.createElement('ul');
    list.className = 'nav-mega-group-list';

    [...nestedList.children].forEach((item) => {
      const { label: itemLabel, href: itemHref } = getLabelAndHref(item);
      const liItem = document.createElement('li');
      const aItem = document.createElement('a');
      aItem.href = itemHref;
      aItem.textContent = itemLabel;
      liItem.append(aItem);
      list.append(liItem);
    });

    group.append(list);
  }

  return group;
}

function buildMegaMenu(sourceList) {
  const mega = document.createElement('div');
  mega.className = 'nav-mega';
  
  const inner = document.createElement('div');
  inner.className = 'nav-mega-inner';

  [...sourceList.children].forEach((topLi) => {
    const col = document.createElement('div');
    col.className = 'nav-mega-col';

    const hasSubCategories = topLi.querySelector(':scope > ul');
    const { label } = getLabelAndHref(topLi);

    if (hasSubCategories && !label) {
      [...hasSubCategories.children].forEach((subLi) => {
        col.append(buildMegaGroup(subLi));
      });
    } else {
      col.append(buildMegaGroup(topLi));
    }

    inner.append(col);
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
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span class="search-text">Search</span>
  `;

  wrapper.append(btn);
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

  // --- Mobile Drawer Shell (2 Panels for Drill-down) ---
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';

  const panels = document.createElement('div');
  panels.className = 'mobile-panels';

  const rootPanel = document.createElement('div');
  rootPanel.className = 'mobile-panel panel-root';
  const rootList = document.createElement('ul');
  rootList.className = 'mobile-menu-list';
  rootPanel.append(rootList);

  const subPanel = document.createElement('div');
  subPanel.className = 'mobile-panel panel-sub';
  
  const subHeader = document.createElement('div');
  subHeader.className = 'mobile-sub-header';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'mobile-back-btn';
  backBtn.innerHTML = '&#8249;';

  const subTitle = document.createElement('span');
  subTitle.className = 'mobile-sub-title';

  subHeader.append(backBtn, subTitle);
  
  const subList = document.createElement('ul');
  subList.className = 'mobile-menu-list';
  subPanel.append(subHeader, subList);

  backBtn.addEventListener('click', () => {
    drawer.classList.remove('sub-open');
  });

  panels.append(rootPanel, subPanel);
  drawer.append(panels);

  // Parse items from table
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];
    const firstCellText = cells[0]?.textContent.trim() ?? '';
    if (isDecorativeRow(firstCellText)) continue;

    const label = firstCellText.toLowerCase();
    if (label === 'search' || label === 'log in') continue;

    const nestedList = cells[1]?.querySelector('ul');
    const firstLink = cells[0].querySelector('a');

    // Desktop
    const li = document.createElement('li');
    li.className = 'nav-section';

    if (nestedList) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-dropdown-trigger';
      trigger.setAttribute('aria-expanded', 'false');
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

    // Mobile
    const mLi = document.createElement('li');
    if (nestedList) {
      const mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.innerHTML = `<span>${firstCellText}</span><span class="mobile-chevron">&#8250;</span>`;
      
      mBtn.addEventListener('click', () => {
        subTitle.textContent = firstCellText;
        subList.innerHTML = '';

        [...nestedList.children].forEach((topLi) => {
          const { label: subLabel, href: subHref } = getLabelAndHref(topLi);
          const sLi = document.createElement('li');
          const sA = document.createElement('a');
          sA.href = subHref;
          sA.textContent = subLabel;
          sLi.append(sA);
          subList.append(sLi);
        });

        drawer.classList.add('sub-open');
      });

      mLi.append(mBtn);
    } else {
      const mA = document.createElement('a');
      mA.href = firstLink ? firstLink.href : '#';
      mA.textContent = firstCellText;
      mLi.append(mA);
    }
    rootList.append(mLi);
  }

  // Support + FAQs and Log In mobile links
  const loginRow = rows.find((r) => r.children[0]?.textContent.trim().toLowerCase() === 'log in');
  const loginLink = loginRow?.querySelector('a');

  const mLoginLi = document.createElement('li');
  const mLoginA = document.createElement('a');
  mLoginA.href = loginLink ? loginLink.href : '#';
  mLoginA.textContent = 'Log In';
  mLoginLi.append(mLoginA);
  rootList.append(mLoginLi);

  nav.append(sections);

  // Right Side Actions (Search, Log In, Mobile Hamburger/Close toggle)
  const actions = document.createElement('div');
  actions.className = 'nav-actions';
  actions.append(buildSearch());

  const loginBtn = document.createElement('a');
  loginBtn.className = 'nav-login';
  loginBtn.href = loginLink ? loginLink.href : '#';
  loginBtn.textContent = 'Log In';
  actions.append(loginBtn);

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle Navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `
    <div class="icon-menu">
      <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
    </div>
    <div class="icon-close">&#10005;</div>
  `;

  const toggleMobileMenu = () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isExpanded));
    nav.classList.toggle('nav-open', !isExpanded);
    document.body.classList.toggle('nav-menu-open', !isExpanded);
    if (isExpanded) {
      drawer.classList.remove('sub-open');
    }
  };

  hamburger.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', toggleMobileMenu);

  actions.append(hamburger);
  nav.append(actions);
  nav.append(drawer);
  nav.append(overlay);

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