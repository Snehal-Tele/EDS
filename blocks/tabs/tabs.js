import { getBlockConfig } from '../../scripts/utils/block-config.js';

/* ==========================================================================
   Tabs V1 Logic
   ========================================================================== */
function decorateTabsV1(block) {
  block.classList.add('tabs-v1');
  const links = [...block.querySelectorAll('a')];
  const isInEditor = window.self !== window.top;

  if (block.parentElement) {
    block.parentElement.classList.add('tabs-v1-wrapper');
  }

  links.forEach((link) => {
    const wrapper = link.closest(':scope > div, div');

    if (wrapper) {
      wrapper.classList.add('tabs-item');
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) return;

      const offset = block.classList.contains('is-fixed') ? block.offsetHeight : 0;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });

  const sections = links
    .map((link) => ({
      wrapper: link.closest('.tabs-item'),
      section: document.getElementById(
        link.getAttribute('href')?.replace('#', ''),
      ),
    }))
    .filter((item) => item.section);

  function setActive(wrapper) {
    block.querySelectorAll('.tabs-item').forEach((tab) => {
      tab.classList.remove('active');
    });

    if (wrapper) {
      wrapper.classList.add('active');

      if (window.innerWidth <= 768 && wrapper.parentElement) {
        requestAnimationFrame(() => {
          wrapper.parentElement.scrollIntoView({
            behavior: 'auto',
            inline: 'nearest',
            block: 'nearest',
          });
        });
      }
    }
  }

  function updateActiveTab() {
    const scrollPos = window.scrollY + block.offsetHeight + 20;
    let current = null;

    sections.forEach((item) => {
      if (item.section.offsetTop <= scrollPos) {
        current = item;
      }
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 5
    ) {
      current = sections[sections.length - 1];
    }

    setActive(current ? current.wrapper : null);
  }

  if (isInEditor) return;

  const placeholder = document.createElement('div');
  placeholder.className = 'tabs-v1-placeholder';
  block.parentNode.insertBefore(placeholder, block);

  let start = 0;
  let end = Number.MAX_SAFE_INTEGER;

  function calculateBounds() {
    start = block.getBoundingClientRect().top + window.scrollY;
    const lastSection = sections[sections.length - 1]?.section;

    if (lastSection) {
      const rect = lastSection.getBoundingClientRect();
      end = rect.bottom + window.scrollY - block.offsetHeight;
    }

    updateSticky();
  }

  function updateSticky() {
    const h = block.offsetHeight;

    if (window.scrollY >= start && window.scrollY < end) {
      block.classList.add('is-fixed');
      placeholder.classList.add('is-active');
      placeholder.style.height = `${h}px`;
    } else {
      block.classList.remove('is-fixed');
      placeholder.classList.remove('is-active');
      placeholder.style.height = '';
    }
  }

  function onScroll() {
    updateSticky();
    updateActiveTab();
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      calculateBounds();
      onScroll();
    }, 200);
  });

  window.addEventListener('resize', () => {
    calculateBounds();
    onScroll();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  setTimeout(() => {
    calculateBounds();
    onScroll();
  }, 200);
}

/* ==========================================================================
   Tabs V2 Logic
   ========================================================================== */
function decorateTabsV2(block) {
  block.classList.add('tabs-v2');

  const tabNav = document.createElement('div');
  tabNav.classList.add('tabs-v2-nav');

  const scrollGroup = document.createElement('div');
  scrollGroup.classList.add('tabs-v2-scroll-group');

  const rows = [...block.children];

  rows.forEach((row, index) => {
    if (index === 0) {
      const linkCell = row.children[0];
      const iconCell = row.children[1];

      if (linkCell) {
        const vehicleBtn = document.createElement('div');
        vehicleBtn.classList.add('tabs-v2-item', 'select-vehicle');

        const anchor =
          linkCell.querySelector('a') || document.createElement('span');
        if (!linkCell.querySelector('a')) {
          anchor.textContent = linkCell.textContent.trim();
        }
        anchor.classList.add('tabs-v2-link');

        const plusIcon = document.createElement('span');
        plusIcon.classList.add('icon-plus');
        plusIcon.textContent = iconCell ? iconCell.textContent.trim() : '+';

        anchor.appendChild(plusIcon);
        vehicleBtn.appendChild(anchor);
        tabNav.appendChild(vehicleBtn);
      }
      return;
    }

    const tabCell = row.children[0];
    if (tabCell) {
      const tabItem = document.createElement('div');
      tabItem.classList.add('tabs-v2-item');

      const anchor =
        tabCell.querySelector('a') || document.createElement('a');
      if (!tabCell.querySelector('a')) {
        anchor.textContent = tabCell.textContent.trim();
        anchor.href = '#';
      }
      anchor.classList.add('tabs-v2-link');

      const textSpan = document.createElement('span');
      textSpan.classList.add('tabs-text');
      textSpan.textContent = anchor.textContent;
      anchor.textContent = '';
      anchor.appendChild(textSpan);

      const arrowSpan = document.createElement('span');
      arrowSpan.classList.add('hover-arrow');
      arrowSpan.innerHTML = '&gt;';
      anchor.appendChild(arrowSpan);

      tabItem.appendChild(anchor);
      scrollGroup.appendChild(tabItem);
    }
  });

  tabNav.appendChild(scrollGroup);
  block.textContent = '';
  block.appendChild(tabNav);
}

/* ==========================================================================
   Tabs V3 Logic
   ========================================================================== */
function decorateTabsV3(block) {
  block.classList.add('tab-v3');
  const links = [...block.querySelectorAll('a')];
  const isInEditor = window.self !== window.top;

  if (block.parentElement) {
    block.parentElement.classList.add('tab-v3-wrapper');
  }

  links.forEach((link) => {
    const wrapper = link.closest(':scope > div, div');

    if (wrapper) {
      wrapper.classList.add('tab-item');
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) return;

      const offset = block.classList.contains('is-fixed') ? block.offsetHeight : 0;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });

  const sections = links
    .map((link) => ({
      wrapper: link.closest('.tab-item'),
      section: document.getElementById(
        link.getAttribute('href')?.replace('#', ''),
      ),
    }))
    .filter((item) => item.section);

  function setActive(wrapper) {
    block.querySelectorAll('.tab-item').forEach((tab) => {
      tab.classList.remove('active');
    });

    if (wrapper) {
      wrapper.classList.add('active');

      if (window.innerWidth <= 768 && wrapper.parentElement) {
        requestAnimationFrame(() => {
          wrapper.parentElement.scrollIntoView({
            behavior: 'auto',
            inline: 'nearest',
            block: 'nearest',
          });
        });
      }
    }
  }

  function updateActiveTab() {
    const scrollPos = window.scrollY + block.offsetHeight + 20;
    let current = null;

    sections.forEach((item) => {
      if (item.section.offsetTop <= scrollPos) {
        current = item;
      }
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 5
    ) {
      current = sections[sections.length - 1];
    }

    setActive(current ? current.wrapper : null);
  }

  if (isInEditor) return;

  const placeholder = document.createElement('div');
  placeholder.className = 'tab-v3-placeholder';
  block.parentNode.insertBefore(placeholder, block);

  let start = 0;
  let end = Number.MAX_SAFE_INTEGER;

  function calculateBounds() {
    start = block.getBoundingClientRect().top + window.scrollY;
    const lastSection = sections[sections.length - 1]?.section;

    if (lastSection) {
      const rect = lastSection.getBoundingClientRect();
      end = rect.bottom + window.scrollY - block.offsetHeight;
    }

    updateSticky();
  }

  function updateSticky() {
    const h = block.offsetHeight;

    if (window.scrollY >= start && window.scrollY < end) {
      block.classList.add('is-fixed');
      placeholder.classList.add('is-active');
      placeholder.style.height = `${h}px`;
    } else {
      block.classList.remove('is-fixed');
      placeholder.classList.remove('is-active');
      placeholder.style.height = '';
    }
  }

  function onScroll() {
    updateSticky();
    updateActiveTab();
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      calculateBounds();
      onScroll();
    }, 200);
  });

  window.addEventListener('resize', () => {
    calculateBounds();
    onScroll();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  setTimeout(() => {
    calculateBounds();
    onScroll();
  }, 200);
}

/* ==========================================================================
   Main Block Decorator
   ========================================================================== */
export default function decorate(block) {
  // 1. Get configuration meta
  const { brand, className } = getBlockConfig(block);

  if (brand === 'toyota') {
    console.log('Toyota tabs block');
  }
  if (brand === 'lexus') {
    console.log('Lexus tabs block');
  }

  // 2. Clean out configuration metadata rows before processing block elements
  const configRowsCount = (brand ? 1 : 0) + (className ? 1 : 0);
  const rows = [...block.children];
  rows.slice(0, configRowsCount).forEach((row) => row.remove());

  // 3. Variant Check & Routing
  if (
    block.classList.contains('tabs-v2') ||
    className === 'tabs-v2'
  ) {
    decorateTabsV2(block);
    return;
  }

  if (
    block.classList.contains('tabs-v3') ||
    block.classList.contains('tab-v3') ||
    className === 'tabs-v3' ||
    className === 'tab-v3'
  ) {
    decorateTabsV3(block);
    return;
  }

  // Default: Tabs V1
  decorateTabsV1(block);
}
