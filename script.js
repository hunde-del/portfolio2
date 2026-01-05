// Theme, nav, smooth scroll, skill animations and certificate modal viewer.
// To keep the site professional and focused we removed the To-Do app.

(function(){
  const root = document.documentElement;
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');

  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme persistence
  const THEME_KEY = 'site_theme_v1';
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = storedTheme || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initial);
  if(themeToggle) {
    themeToggle.setAttribute('aria-pressed', initial === 'light');
    themeToggle.textContent = initial === 'light' ? '☀️' : '🌙';
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.setAttribute('aria-pressed', next === 'light');
      themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    });
  }

  // Mobile nav toggle
  if(navToggle && navList){
    navToggle.addEventListener('click', () => {
      const visible = navList.getAttribute('data-visible') === 'true';
      navList.setAttribute('data-visible', String(!visible));
      navToggle.setAttribute('aria-expanded', String(!visible));
    });
  }

  // Smooth internal link scrolling
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    if(!id) return;
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
      el.setAttribute('tabindex','-1');
      el.focus({preventScroll:true});
      window.setTimeout(()=> el.removeAttribute('tabindex'), 1000);
      if(window.innerWidth < 900 && navList) navList.setAttribute('data-visible','false');
    }
  });

  // Animate skills when in view
  const skillFills = document.querySelectorAll('.skill-fill');
  function animateSkills(){
    skillFills.forEach(fill => {
      const percentEl = fill.parentElement.previousElementSibling.querySelector('.skill-percent');
      const percent = percentEl ? percentEl.dataset.value : null;
      if(percent) fill.style.width = percent + '%';
    });
  }
  // Observe skills section
  const skillsSection = document.getElementById('skills');
  if(skillsSection){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if(en.isIntersecting) animateSkills(); });
    }, {threshold: .25});
    obs.observe(skillsSection);
  } else {
    // fallback
    animateSkills();
  }

  /* Certificate modal viewer */
  const certModal = document.getElementById('cert-modal');
  const certBody = certModal && certModal.querySelector('.modal-body');
  const certOpen = document.getElementById('cert-modal-open');
  const certClose = certModal && certModal.querySelector('.modal-close');

  function isPDF(url){
    return url && url.split('?')[0].toLowerCase().endsWith('.pdf');
  }

  function openCert({title='Certificate', url=''} = {}){
    if(!certModal) return;
    certModal.classList.remove('hidden');
    certModal.setAttribute('aria-hidden','false');
    certBody.innerHTML = '';
    if(isPDF(url)){
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = title;
      iframe.setAttribute('aria-label', title);
      certBody.appendChild(iframe);
    } else if(url){
      const img = document.createElement('img');
      img.src = url;
      img.alt = title;
      certBody.appendChild(img);
    } else {
      certBody.textContent = 'No preview available.';
    }
    certOpen.href = url || '#';
    certOpen.style.display = url ? '' : 'none';
    certClose && certClose.focus();
    trapFocus(certModal);
  }

  function closeCert(){
    if(!certModal) return;
    certModal.classList.add('hidden');
    certModal.setAttribute('aria-hidden','true');
    certBody.innerHTML = '';
    releaseFocusTrap();
  }

  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-cert');
    if(viewBtn){
      const card = viewBtn.closest('.cert-card');
      const url = card?.dataset?.certUrl || '';
      const title = card?.querySelector('h3')?.textContent || 'Certificate';
      openCert({title, url});
    }
    if(e.target.closest('.modal-close') || e.target === certModal) closeCert();
  });

  if(certClose) certClose.addEventListener('click', closeCert);

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(certModal && !certModal.classList.contains('hidden')) closeCert();
      if(navList && navList.getAttribute('data-visible') === 'true') navList.setAttribute('data-visible','false');
    }
  });

  // Simple focus trap for modal
  let lastFocused = null;
  function trapFocus(container){
    lastFocused = document.activeElement;
    const focusable = container.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(first) first.focus();
    function handle(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    container._trap = handle;
    container.addEventListener('keydown', handle);
  }
  function releaseFocusTrap(){
    if(!certModal) return;
    certModal.removeEventListener('keydown', certModal._trap);
    if(lastFocused) lastFocused.focus();
  }

})();
