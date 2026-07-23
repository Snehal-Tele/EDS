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
 
/** Build one column of the Guidelines mega-menu from a top-level <li> */
function buildMegaColumn(li) {
  const col = document.createElement('div');
  col.className = 'nav-mega-col';
 
  const nestedList = li.querySelector(':scope > ul');
  const { label, href } = getLabelAndHref(li);
 
  if (!nestedList) {
    // Simple single-link column (e.g. "Overview")
    const a = document.createElement('a');
    a.className = 'nav-mega-col-title nav-mega-col-title-link';
    a.href = href;
    a.innerHTML = `${label} <span class="nav-chevron" aria-hidden="true">&#8250;</span>`;
    col.append(a);
    return col;
  }
 
  // Column with a heading + list of links
  const heading = document.createElement('a');
  heading.className = 'nav-mega-col-title';
  heading.href = href;
  heading.innerHTML = `${label} <span class="nav-chevron" aria-hidden="true">&#8250;</span>`;
  col.append(heading);
 
  const list = document.createElement('ul');
  list.className = 'nav-mega-col-list';
 
  [...nestedList.children].forEach((item) => {
    const subList = item.querySelector(':scope > ul');
    const { label: itemLabel, href: itemHref } = getLabelAndHref(item);
 
    if (subList) {
      // Bold sub-heading (e.g. "Sonic") followed by its own links
      const subHeading = document.createElement('li');
      subHeading.className = 'nav-mega-col-subhead';
      subHeading.textContent = itemLabel;
      list.append(subHeading);
 
      [...subList.children].forEach((subItem) => {
        const { label: subLabel, href: subHref } = getLabelAndHref(subItem);
        const li2 = document.createElement('li');
        const a2 = document.createElement('a');
        a2.href = subHref;
        a2.textContent = subLabel;
        li2.append(a2);
        list.append(li2);
      });
    } else {
      const li2 = document.createElement('li');
      const a2 = document.createElement('a');
      a2.href = itemHref;
      a2.textContent = itemLabel;
      li2.append(a2);
      list.append(li2);
    }
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
<svg class="nav-search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
<span>Search</span>`;
 
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
 
  // --- Row 0: brand / logo ---
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
 
  // --- Middle: nav sections list ---
  const sections = document.createElement('ul');
  sections.className = 'nav-sections';
 
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];
    const firstCellText = cells[0]?.textContent.trim() ?? '';
    if (isDecorativeRow(firstCellText)) continue;
 
    const label = firstCellText.toLowerCase();
 
    if (label === 'search') {
      // handled after the list, appended to nav directly
      continue;
    }
 
    if (label === 'log in') {
      continue;
    }
 
    const li = document.createElement('li');
    li.className = 'nav-section';
 
    const nestedList = cells[1]?.querySelector('ul');
    const firstLink = cells[0].querySelector('a');
 
    if (nestedList) {
      // Dropdown / mega-menu item (e.g. "Guidelines")
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-dropdown-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = `${firstCellText} <span class="nav-caret" aria-hidden="true">&#94;</span>`;
 
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns(nav);
        trigger.setAttribute('aria-expanded', String(!expanded));
      });
 
      li.append(trigger, buildMegaMenu(nestedList));
      li.classList.add('nav-section-has-mega');
    } else {
      const a = document.createElement('a');
      a.className = 'nav-link';
      a.href = firstLink ? firstLink.href : '#';
      a.textContent = firstCellText;
      li.append(a);
    }
 
    sections.append(li);
  }
  nav.append(sections);
 
  // --- Search + Log In (right side actions) ---
  const actions = document.createElement('div');
  actions.className = 'nav-actions';
  actions.append(buildSearch());
 
  const loginRow = rows.find((r) => r.children[0]?.textContent.trim().toLowerCase() === 'log in');
  const loginLink = loginRow?.querySelector('a');
  const loginBtn = document.createElement('a');
  loginBtn.className = 'nav-login';
  loginBtn.href = loginLink ? loginLink.href : '#';
  loginBtn.textContent = 'Log In';
  actions.append(loginBtn);
 
  nav.append(actions);
 
  // Mobile hamburger toggle
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open', !expanded);
  });
  nav.append(hamburger);
 
  // Close dropdowns on outside click / escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns(nav);
  });
 
  block.textContent = '';
  block.append(nav);
}