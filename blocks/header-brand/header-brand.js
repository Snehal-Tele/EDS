export default function decorate(block) {
    const rows = [...block.children];
    const [logoRow, ...navRows] = rows;
   
    const brandLink = buildBrandLink(logoRow);
    const navItems = navRows.map(parseNavRow);
   
    const bar = document.createElement('div');
    bar.className = 'header-brand-bar';
   
    const desktopNav = buildDesktopNav(navItems);
    const mobileTriggers = buildMobileTriggers();
    const mobileMenu = buildMobileMenu(brandLink.cloneNode(true), navItems);
   
    bar.append(brandLink, desktopNav, mobileTriggers);
   
    block.replaceChildren(bar, mobileMenu);
   
    wireInteractions(block, desktopNav, mobileTriggers, mobileMenu);
  }
   
  // ── Parsing helpers ───────────────────────────────────────────
   
  function buildBrandLink(logoRow) {
    const cells = logoRow ? [...logoRow.children] : [];
    const iconCell = cells.find((c) => c.querySelector('picture'));
    const wordmarkCell = cells.find((c) => c !== iconCell);
   
    const link = document.createElement('a');
    link.href = '/';
    link.className = 'header-brand-logo-row';
    link.setAttribute('aria-label', 'Toyota home');
   
    if (iconCell) {
      iconCell.classList.add('header-brand-icon');
      link.append(iconCell);
    }
    if (wordmarkCell) {
      wordmarkCell.classList.add('header-brand-wordmark');
      link.append(wordmarkCell);
    }
    return link;
  }
   
  function firstLineText(row) {
    const clone = row.cloneNode(true);
    const ul = clone.querySelector('ul');
    if (ul) ul.remove();
    return clone.textContent.trim();
  }
   
  function parseChildList(ul) {
    return [...ul.children].map((li) => {
      const link = li.querySelector(':scope > a');
      const childUl = li.querySelector(':scope > ul');
      const clone = li.cloneNode(true);
      const nestedUl = clone.querySelector('ul');
      if (nestedUl) nestedUl.remove();
      const label = link ? link.textContent.trim() : clone.textContent.trim();
      const href = link ? link.getAttribute('href') : '#';
      return {
        label,
        href,
        children: childUl ? parseChildList(childUl) : [],
      };
    });
  }
   
  function parseNavRow(row) {
    const nestedList = row.querySelector('ul');
    const text = row.textContent.trim();
   
    if (nestedList) {
      const columns = [...nestedList.children].map((li) => {
        const link = li.querySelector(':scope > a');
        const childUl = li.querySelector(':scope > ul');
        const clone = li.cloneNode(true);
        const nestedUl = clone.querySelector('ul');
        if (nestedUl) nestedUl.remove();
        const label = link ? link.textContent.trim() : clone.textContent.trim();
        const href = link ? link.getAttribute('href') : '#';
        return {
          label,
          href,
          items: childUl ? parseChildList(childUl) : [],
        };
      });
      return { type: 'trigger', label: firstLineText(row), columns };
    }
   
    const directLink = row.querySelector('a');
    if (directLink) {
      return { type: 'link', label: directLink.textContent.trim(), href: directLink.getAttribute('href') };
    }
   
    return { type: 'button', label: text };
  }
   
  // ── Desktop nav + mega-menu ────────────────────────────────────
   
  function buildDesktopNav(navItems) {
    const nav = document.createElement('nav');
    nav.className = 'header-brand-nav';
   
    const linksWrap = document.createElement('div');
    linksWrap.className = 'header-brand-nav-links';
   
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'header-brand-actions';
   
    navItems.forEach((item) => {
      if (item.type === 'link') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-nav-link';
        btn.textContent = item.label;
        if (item.href) {
          btn.addEventListener('click', () => {
            window.location.href = item.href;
          });
        }
        // Downloads goes with the primary links; Search/Log In are buttons (below)
        linksWrap.append(btn);
        return;
      }
   
      if (item.type === 'trigger') {
        const wrap = document.createElement('div');
        wrap.className = 'header-brand-trigger-wrap';
   
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-nav-trigger';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `<span>${item.label}</span><span class="header-brand-chevron" aria-hidden="true"></span>`;
   
        const megaMenu = buildMegaMenu(item.columns);
        wrap.append(btn, megaMenu);
        linksWrap.append(wrap);
        return;
      }
   
      // button type: Search / Log In / etc.
      const lower = item.label.toLowerCase();
   
      if (lower.includes('search')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-search-btn';
        btn.innerHTML = `<span class="header-brand-search-icon" aria-hidden="true"></span><span>${item.label}</span>`;
        actionsWrap.append(btn);
        return;
      }
   
      if (lower.includes('log in') || lower.includes('login')) {
        const wrap = document.createElement('div');
        wrap.className = 'header-brand-account-wrap';
   
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-login-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = item.label;
   
        const panel = document.createElement('div');
        panel.className = 'header-brand-account-panel';
        panel.innerHTML = `
  <p class="header-brand-account-welcome">Welcome back</p>
  <a class="header-brand-account-link" href="/downloads#myDownloads">Go To My Downloads</a>
  <a class="header-brand-account-link" href="/account">My Account</a>
  <button type="button" class="header-brand-account-logout">Log Out</button>
        `;
   
        btn.addEventListener('click', () => {
          const isOpen = wrap.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', String(isOpen));
        });
   
        wrap.append(btn, panel);
        actionsWrap.append(wrap);
        return;
      }
   
      // fallback for any other unrecognized action row
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'header-brand-login-btn';
      btn.textContent = item.label;
      actionsWrap.append(btn);
    });
   
    nav.append(linksWrap, actionsWrap);
    return nav;
  }
   
  function buildMegaMenu(columns) {
    const menu = document.createElement('div');
    menu.className = 'header-brand-megamenu';
   
    const grid = document.createElement('div');
    grid.className = 'header-brand-megamenu-grid';
   
    columns.forEach((col) => {
      const colEl = document.createElement('div');
      colEl.className = 'header-brand-megamenu-column';
   
      const heading = document.createElement('a');
      heading.href = col.href || '#';
      heading.className = 'header-brand-megamenu-heading';
      heading.innerHTML = `<span>${col.label}</span>${col.items.length ? '<span class="header-brand-chevron-right" aria-hidden="true"></span>' : ''}`;
      colEl.append(heading);
   
      col.items.forEach((subItem) => {
        if (subItem.children.length) {
          const subHeading = document.createElement('p');
          subHeading.className = 'header-brand-megamenu-subheading';
          subHeading.textContent = subItem.label;
          colEl.append(subHeading);
          subItem.children.forEach((child) => colEl.append(buildMegaMenuLink(child)));
        } else {
          colEl.append(buildMegaMenuLink(subItem));
        }
      });
   
      grid.append(colEl);
    });
   
    menu.append(grid);
    return menu;
  }
   
  function buildMegaMenuLink(item) {
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.className = 'header-brand-megamenu-link';
    a.textContent = item.label;
    return a;
  }
   
  // ── Mobile: hamburger + search triggers, and overlay menu ─────
   
  function buildMobileTriggers() {
    const wrap = document.createElement('div');
    wrap.className = 'header-brand-mobile-actions';
   
    const searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'header-brand-mobile-search-btn';
    searchBtn.setAttribute('aria-label', 'Search');
    searchBtn.innerHTML = '<span class="header-brand-search-icon" aria-hidden="true"></span>';
   
    const hamburger = document.createElement('button');
    hamburger.type = 'button';
    hamburger.className = 'header-brand-hamburger';
    hamburger.setAttribute('aria-label', 'Open menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
   
    wrap.append(searchBtn, hamburger);
    return wrap;
  }
   
  function buildMobileMenu(brandLinkClone, navItems) {
    const overlay = document.createElement('div');
    overlay.className = 'header-brand-mobile-menu';
    overlay.hidden = true;
   
    const header = document.createElement('div');
    header.className = 'header-brand-mobile-menu-header';
   
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'header-brand-mobile-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<span></span><span></span>';
   
    header.append(brandLinkClone, closeBtn);
   
    const list = document.createElement('div');
    list.className = 'header-brand-mobile-list';
   
    navItems.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'header-brand-mobile-item';
   
      if (item.type === 'link') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-mobile-link';
        btn.textContent = item.label;
        if (item.href) {
          btn.addEventListener('click', () => {
            window.location.href = item.href;
          });
        }
        row.append(btn);
      } else if (item.type === 'trigger') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-mobile-trigger';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `<span>${item.label}</span><span class="header-brand-chevron-right" aria-hidden="true"></span>`;
   
        const submenu = document.createElement('div');
        submenu.className = 'header-brand-mobile-submenu';
        submenu.hidden = true;
   
        item.columns.forEach((col) => {
          const colHeading = document.createElement('a');
          colHeading.href = col.href || '#';
          colHeading.className = 'header-brand-mobile-submenu-heading';
          colHeading.textContent = col.label;
          submenu.append(colHeading);
   
          col.items.forEach((subItem) => {
            if (subItem.children.length) {
              const subHeading = document.createElement('p');
              subHeading.className = 'header-brand-mobile-submenu-subheading';
              subHeading.textContent = subItem.label;
              submenu.append(subHeading);
              subItem.children.forEach((child) => submenu.append(buildMobileSubLink(child)));
            } else {
              submenu.append(buildMobileSubLink(subItem));
            }
          });
        });
   
        btn.addEventListener('click', () => {
          const isOpen = submenu.hidden;
          submenu.hidden = !isOpen;
          btn.setAttribute('aria-expanded', String(isOpen));
          row.classList.toggle('is-open', isOpen);
        });
   
        row.append(btn, submenu);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-brand-mobile-button';
        btn.textContent = item.label;
        row.append(btn);
      }
   
      list.append(row);
    });
   
    overlay.append(header, list);
    return overlay;
  }
   
  function buildMobileSubLink(item) {
    const a = document.createElement('a');
    a.href = item.href || '#';
    a.className = 'header-brand-mobile-submenu-link';
    a.textContent = item.label;
    return a;
  }
   
  // ── Wire up open/close interactions ───────────────────────────
   
  function wireInteractions(block, desktopNav, mobileTriggers, mobileMenu) {
    // desktop mega-menu triggers
    [...desktopNav.querySelectorAll('.header-brand-nav-trigger')].forEach((btn) => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('.header-brand-trigger-wrap');
        const isOpen = wrap.classList.contains('is-open');
   
        // close any other open triggers first
        [...desktopNav.querySelectorAll('.header-brand-trigger-wrap.is-open')].forEach((openWrap) => {
          openWrap.classList.remove('is-open');
          openWrap.querySelector('.header-brand-nav-trigger').setAttribute('aria-expanded', 'false');
        });
   
        if (!isOpen) {
          wrap.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
   
    // close mega-menu / account panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!block.contains(e.target)) {
        [...desktopNav.querySelectorAll('.header-brand-trigger-wrap.is-open')].forEach((wrap) => {
          wrap.classList.remove('is-open');
          wrap.querySelector('.header-brand-nav-trigger').setAttribute('aria-expanded', 'false');
        });
        const accountWrap = desktopNav.querySelector('.header-brand-account-wrap.is-open');
        if (accountWrap) {
          accountWrap.classList.remove('is-open');
          accountWrap.querySelector('.header-brand-login-btn').setAttribute('aria-expanded', 'false');
        }
      }
    });
   
    // mobile hamburger open/close
    const hamburger = mobileTriggers.querySelector('.header-brand-hamburger');
    const closeBtn = mobileMenu.querySelector('.header-brand-mobile-close');
   
    const openMobileMenu = () => {
      mobileMenu.hidden = false;
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMobileMenu = () => {
      mobileMenu.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
   
    hamburger.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);
   
    // Escape key closes whichever is open
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!mobileMenu.hidden) closeMobileMenu();
      [...desktopNav.querySelectorAll('.header-brand-trigger-wrap.is-open')].forEach((wrap) => {
        wrap.classList.remove('is-open');
        wrap.querySelector('.header-brand-nav-trigger').setAttribute('aria-expanded', 'false');
      });
    });
  }