export default function decorate(block) {
    const tabs = [...block.querySelectorAll('a')];
  
    const nav = document.createElement('div');
    nav.className = 'tab-v3-nav';
  
    tabs.forEach((tab, index) => {
      const button = document.createElement('button');
      button.className = 'tab-v3-btn';
      button.textContent = tab.textContent;
  
      if (index === 0) {
        button.classList.add('active');
      }
  
      button.addEventListener('click', () => {
        document
          .querySelectorAll('.tab-v3-btn')
          .forEach((btn) => btn.classList.remove('active'));
  
        button.classList.add('active');
  
        const target = document.querySelector(
          tab.getAttribute('href'),
        );
  
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
  
      nav.append(button);
    });
  
    block.textContent = '';
    block.append(nav);
  
    const sections = tabs
      .map((tab) => document.querySelector(tab.getAttribute('href')))
      .filter(Boolean);
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
  
            document
              .querySelectorAll('.tab-v3-btn')
              .forEach((btn) => {
                btn.classList.remove('active');
  
                if (
                  btn.textContent.trim() ===
                  tabs.find(
                    (t) => t.getAttribute('href') === `#${activeId}`,
                  )?.textContent.trim()
                ) {
                  btn.classList.add('active');
                }
              });
          }
        });
      },
      {
        threshold: 0.4,
      },
    );
  
    sections.forEach((section) => observer.observe(section));
  }