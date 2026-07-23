function cellText(cell) {
  return cell.textContent.trim();
}
 
function buildBrand(row) {
  const brand = document.createElement('div');
  brand.className = 'header-brand';
 
  const cell = row.children[0];
  const picture = cell.querySelector('picture');
  const link = document.createElement('a');
  link.className = 'header-brand-link';
  link.href = '/';
  link.setAttribute('aria-label', 'Home');
 
  if (picture) link.append(picture);
 
  const text = cellText(cell);
  if (text) {
    const span = document.createElement('span');
    span.className = 'header-brand-text';
    span.textContent = text;
    link.append(span);
  }
 
  brand.append(link);
  return brand;
}
 
/** Recursively turns an authored <ul> into mega-menu columns/sub-groups. */
function buildMegaColumns(topList) {
  const wrapper = document.createElement('div');
  wrapper.className = 'header-mega-columns';
 
  [...topList.children].forEach((li) => {
    const column = document.createElement('div');
    column.className = 'header-mega-column';
 
    const nestedList = li.querySelector(':scope > ul');
    const headingText = nestedList
      ? li.childNodes[0].textContent.trim()
      : cellText(li);
    const headingLink = li.querySelector(':scope > a');
 
    const heading = document.createElement(headingLink ? 'a' : 'span');
    heading.className = 'header-mega-heading';
    if (headingLink) heading.href = headingLink.href;
    else heading.href = '#';
    heading.innerHTML = `<span>${headingText}</span>${CHEVRON_RIGHT}`;
    column.append(heading);
 
    if (nestedList) {
      column.append(buildSubgroup(nestedList));
    }
 
    wrapper.append(column);
  });
 
  return wrapper;
}
 
/** Renders a flat sub-list, promoting any deeper-nested <li> to its own heading. */
function buildSubgroup(list) {
  const ul = document.createElement('ul');
  ul.className = 'header-mega-sublist';
 
  [...list.children].forEach((li) => {
    const deeperList = li.querySelector(':scope > ul');
 
    if (deeperList) {
      const subHeadingText = li.childNodes[0].textContent.trim();
      const subHeading = document.createElement('p');
      subHeading.className = 'header-mega-subheading';
      subHeading.textContent = subHeadingText;
      ul.append(subHeading);
      ul.append(buildSubgroup(deeperList));
      return;
    }
 
    const item = document.createElement('li');
    const existingLink = li.querySelector('a');
    const a = document.createElement('a');
    a.href = existingLink ? existingLink.href : '#';
    a.textContent = cellText(li);
    item.append(a);
    ul.append(item);
  });
 
  return ul;
}
 
function buildDropdown(labelCell, listCell) {
  const li = document.createElement('li');
  li.className = 'header-nav-item header-dropdown';
 
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'header-dropdown-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = `<span>${cellText(labelCell)}</span>${CHEVRON_DOWN}`;
 
  const panel = document.createElement('div');
  panel.className = 'header-dropdown-panel';
  const list = listCell.querySelector(':scope > ul');
  if (list) panel.append(buildMegaColumns(list));
 
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('is-open', !expanded);
  });
 
  li.append(button, panel);
  return li;
}
 
function buildSimpleLink(cell) {
  const li = document.createElement('li');
  li.className = 'header-nav-item';
 
  const existingLink = cell.querySelector('a');
  const a = document.createElement('a');
  a.href = existingLink ? existingLink.href : '#';
  a.textContent = cellText(cell);
  a.className = 'header-link';
 
  li.append(a);
  return li;
}
 
function buildLoginPill(cell) {
  const li = document.createElement('li');
  li.className = 'header-nav-item header-login-item';
 
  const existingLink = cell.querySelector('a');
  const a = document.createElement('a');
  a.href = existingLink ? existingLink.href : '#';
  a.textContent = cellText(cell);
  a.className = 'header-pill';
 
  li.append(a);
  return li;
}
 
function buildSearchIcon() {
  const li = document.createElement('li');
  li.className = 'header-nav-item header-search-item';
  li.innerHTML = `<span class="header-search-static">${SEARCH_ICON}<span>Search</span></span>`;
  return li;
}
 
function buildNavToggle() {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-nav-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = HAMBURGER_ICON;
  return toggle;
}
 
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
 
  const nav = document.createElement('nav');
  nav.className = 'header-nav';
  nav.append(buildBrand(rows[0]));
 
  const navWrapper = document.createElement('div');
  navWrapper.className = 'header-nav-wrapper';
 
  const ul = document.createElement('ul');
  ul.className = 'header-nav-list';
 
  const mobileList = document.createElement('ul');
  mobileList.className = 'header-mobile-list';
 
  rows.slice(1).forEach((row) => {
    const [firstCell, secondCell] = row.children;
    if (!firstCell) return;
 
    let text = cellText(firstCell);
    const mobileOnly = /^\(mobile\)/i.test(text);
    text = text.replace(/^\(mobile\)\s*/i, '');
 
    const hasMegaMenu = secondCell && secondCell.querySelector('ul');
    const isSearch = text.toLowerCase() === 'search';
    const isLogin = text.toLowerCase() === 'log in';
 
    // Desktop nav (mega-menu items skip mobile-only rows automatically below)
    if (!mobileOnly) {
      if (hasMegaMenu) ul.append(buildDropdown(firstCell, secondCell));
      else if (isSearch) ul.append(buildSearchIcon());
      else if (isLogin) ul.append(buildLoginPill(firstCell));
      else ul.append(buildSimpleLink(firstCell));
    }
 
    // Mobile off-canvas menu: everything except the search row, plus
    // "(mobile)"-flagged rows, in the order authored.
    if (!isSearch) {
      const mobileLi = document.createElement('li');
      mobileLi.className = 'header-mobile-item';
      if (isLogin) mobileLi.classList.add('header-mobile-login');
      if (mobileOnly) mobileLi.classList.add('header-mobile-support');
 
      const existingLink = firstCell.querySelector('a');
      const a = document.createElement('a');
      a.href = existingLink ? existingLink.href : '#';
      a.className = 'header-mobile-link';
      a.innerHTML = `<span>${text}</span>`;
      if (hasMegaMenu) a.innerHTML += CHEVRON_RIGHT;
 
      mobileLi.append(a);
      mobileList.append(mobileLi);
    }
  });
 
  navWrapper.append(ul);
  nav.append(navWrapper);
 
  // Mobile controls: search icon + hamburger (becomes X when open)
  const mobileControls = document.createElement('div');
  mobileControls.className = 'header-mobile-controls';
  mobileControls.innerHTML = `<button type="button" class="header-mobile-search" aria-label="Search">${SEARCH_ICON}</button>`;
  const navToggle = buildNavToggle();
  mobileControls.append(navToggle);
  nav.append(mobileControls);
 
  // Mobile off-canvas panel
  const mobilePanel = document.createElement('div');
  mobilePanel.className = 'header-mobile-panel';
  mobilePanel.append(mobileList);
  nav.append(mobilePanel);
 
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.innerHTML = expanded ? HAMBURGER_ICON : CLOSE_ICON;
    mobilePanel.classList.toggle('is-open', !expanded);
    document.body.classList.toggle('header-menu-open', !expanded);
  });
 
  block.textContent = '';
  block.append(nav);
 
  // Close any open mega-menu when clicking outside it
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      nav.querySelectorAll('.header-dropdown-toggle[aria-expanded="true"]').forEach((el) => {
        el.setAttribute('aria-expanded', 'false');
      });
      nav.querySelectorAll('.header-dropdown-panel.is-open').forEach((el) => {
        el.classList.remove('is-open');
      });
    }
  });
}