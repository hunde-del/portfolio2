// Lightweight JS: theme toggle, mobile nav, smooth scroll, small accessibility helpers

(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  const yearEl = document.getElementById('year');

  // Set year in footer
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize theme from localStorage or prefers-color-scheme
  const stored = localStorage.getItem('theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = stored || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initialTheme);

  // Update toggle aria state
  if(themeToggle){
    themeToggle.setAttribute('aria-pressed', initialTheme === 'light' ? 'true' : 'false');
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeToggle.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
    });
  }

  // Mobile nav toggle
  if(navToggle && navList){
    navToggle.addEventListener('click', () => {
      const visible = navList.getAttribute('data-visible') === 'true';
      navList.setAttribute('data-visible', String(!visible));
      navToggle.setAttribute('aria-expanded', String(!visible));
      // update label for screen readers
      navToggle.setAttribute('aria-label', visible ? 'Open menu' : 'Close menu');
    });

    // Close nav when a link is clicked (mobile)
    navList.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if(a && window.innerWidth <= 800){
        navList.setAttribute('data-visible', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll for internal links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const targetId = a.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      // update focus for accessibility
      target.setAttribute('tabindex','-1');
      target.focus({preventScroll:true});
      window.setTimeout(()=> target.removeAttribute('tabindex'), 1000);
    }
  });

  // Basic keyboard escape to close nav
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(navList && navList.getAttribute('data-visible') === 'true'){
        navList.setAttribute('data-visible','false');
        navToggle.setAttribute('aria-expanded','false');
      }
    }
  });
})();
