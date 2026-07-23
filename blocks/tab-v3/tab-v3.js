export default function decorate(block) {
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
      const target = targetId
        ? document.getElementById(targetId)
        : null;

      if (!target) {
        return;
      }

      const offset = block.classList.contains('is-fixed')
        ? block.offsetHeight
        : 0;

      window.scrollTo({
        top:
          target.getBoundingClientRect().top +
          window.scrollY -
          offset,
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

      if (window.innerWidth <= 768) {
        requestAnimationFrame(() => {
          block.scrollTo({
            left:
              wrapper.offsetLeft -
              block.clientWidth / 2 +
              wrapper.clientWidth / 2,
            behavior: 'smooth',
          });
        });
      }
    }
  }

  function updateActiveTab() {
    const scrollPos =
      window.scrollY + block.offsetHeight + 20;

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

  if (isInEditor) {
    return;
  }

  const placeholder = document.createElement('div');
  placeholder.className = 'tab-v3-placeholder';

  block.parentNode.insertBefore(
    placeholder,
    block,
  );

  let start = 0;
  let end = Number.MAX_SAFE_INTEGER;

  function calculateBounds() {
    start =
      block.getBoundingClientRect().top +
      window.scrollY;

    const lastSection =
      sections[sections.length - 1]?.section;

    if (lastSection) {
      const rect =
        lastSection.getBoundingClientRect();

      end =
        rect.bottom +
        window.scrollY -
        block.offsetHeight;
    }

    updateSticky();
  }

  function updateSticky() {
    const h = block.offsetHeight;

    if (
      window.scrollY >= start &&
      window.scrollY < end
    ) {
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

  window.addEventListener('scroll', onScroll, {
    passive: true,
  });

  setTimeout(() => {
    calculateBounds();
    onScroll();
  }, 200);
}