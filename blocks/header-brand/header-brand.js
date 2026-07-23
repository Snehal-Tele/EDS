function isDecorativeRow(cellText) {
  return cellText === '';
}

function getLabelAndHref(li) {
  const directLink = li.querySelector(
    ':scope > a, :scope > p > a, :scope > strong > a, :scope > div > a',
  );

  if (directLink) {
    return {
      label: directLink.textContent.trim(),
      href: directLink.href,
    };
  }

  for (const node of li.childNodes) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName === 'UL'
    ) {
      continue;
    }

    const text = node.textContent?.trim();

    if (text) {
      return {
        label: text,
        href: '#',
      };
    }
  }

  return {
    label: '',
    href: '#',
  };
}

function buildMegaColumn(li) {
  const col = document.createElement('div');
  col.className = 'nav-mega-col';

  const nestedList = li.querySelector(':scope > ul');

  const { label, href } = getLabelAndHref(li);

  if (!nestedList) {
    const a = document.createElement('a');

    a.className =
      'nav-mega-col-title nav-mega-col-title-link';

    a.href = href;

    a.innerHTML = `
      ${label}
      <span class="nav-chevron" aria-hidden="true">›</span>
    `;

    col.append(a);

    return col;
  }

  const heading = document.createElement('a');

  heading.className = 'nav-mega-col-title';
  heading.href = href;

  heading.innerHTML = `
    ${label}
    <span class="nav-chevron" aria-hidden="true">›</span>
  `;

  col.append(heading);

  const list = document.createElement('ul');
  list.className = 'nav-mega-col-list';

  [...nestedList.children].forEach((item) => {
    const subList = item.querySelector(':scope > ul');

    const {
      label: itemLabel,
      href: itemHref,
    } = getLabelAndHref(item);

    if (subList) {
      const subHeading = document.createElement('li');

      subHeading.className = 'nav-mega-col-subhead';
      subHeading.textContent = itemLabel;

      list.append(subHeading);

      [...subList.children].forEach((subItem) => {
        const {
          label: subLabel,
          href: subHref,
        } = getLabelAndHref(subItem);

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
  nav
    .querySelectorAll(
      '.nav-dropdown-trigger[aria-expanded="true"]',
    )
    .forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
}

function buildSearch() {
  const wrapper = document.createElement('div');

  wrapper.className = 'nav-search';

  const btn = document.createElement('button');

  btn.type = 'button';
  btn.className = 'nav-search-static';

  btn.setAttribute('aria-label', 'Search');

  btn.innerHTML = `
    <svg
      class="nav-search-icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;

  wrapper.append(btn);

  return wrapper;
}

export default async function decorate(block) {
  const rows = [...block.children];

  const nav = document.createElement('nav');

  nav.className = 'nav-brand';

  const brandRow = rows[0];

  if (brandRow) {
    const brandWrap = document.createElement('a');

    brandWrap.className = 'nav-logo';
    brandWrap.href = '/';

    const picture = brandRow.querySelector('picture');

    if (picture) {
      brandWrap.append(picture.cloneNode(true));
    }

    nav.append(brandWrap);
  }

  const sections = document.createElement('ul');

  sections.className = 'nav-sections';

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];

    const cells = [...row.children];

    const firstCellText =
      cells[0]?.textContent.trim() ?? '';

    if (isDecorativeRow(firstCellText)) {
      continue;
    }

    const label = firstCellText.toLowerCase();

    if (label === 'search') {
      continue;
    }

    const li = document.createElement('li');

    li.className = 'nav-section';

    if (label === 'log in') {
      const loginLink = cells[0].querySelector('a');

      const a = document.createElement('a');

      a.className = 'nav-link';

      a.href = loginLink ? loginLink.href : '#';

      a.textContent = 'Log In';

      li.append(a);

      sections.append(li);

      continue;
    }

    const nestedList = cells[1]?.querySelector('ul');

    const firstLink = cells[0].querySelector('a');

    if (nestedList) {
      const trigger = document.createElement('button');

      trigger.type = 'button';
      trigger.className = 'nav-dropdown-trigger';

      trigger.setAttribute(
        'aria-expanded',
        'false',
      );

      trigger.innerHTML = `
        ${firstCellText}
        <span class="nav-caret">›</span>
      `;

      trigger.addEventListener('click', () => {
        const expanded =
          trigger.getAttribute(
            'aria-expanded',
          ) === 'true';

        if (window.innerWidth <= 768) {
          trigger.setAttribute(
            'aria-expanded',
            String(!expanded),
          );
        } else {
          closeAllDropdowns(nav);

          trigger.setAttribute(
            'aria-expanded',
            String(!expanded),
          );
        }
      });

      li.append(
        trigger,
        buildMegaMenu(nestedList),
      );

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

  const actions = document.createElement('div');

  actions.className = 'nav-actions';

  actions.append(buildSearch());

  nav.append(actions);

  const hamburger = document.createElement('button');

  hamburger.type = 'button';

  hamburger.className = 'nav-hamburger';

  hamburger.setAttribute(
    'aria-expanded',
    'false',
  );

  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  hamburger.addEventListener('click', () => {
    const expanded =
      hamburger.getAttribute(
        'aria-expanded',
      ) === 'true';

    hamburger.setAttribute(
      'aria-expanded',
      String(!expanded),
    );

    nav.classList.toggle(
      'nav-open',
      !expanded,
    );

    if (expanded) {
      closeAllDropdowns(nav);
    }
  });

  nav.append(hamburger);

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeAllDropdowns(nav);
    }
  });

  block.textContent = '';

  block.append(nav);
}