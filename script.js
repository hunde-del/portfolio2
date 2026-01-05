// Polished interactions: theme, nav, skills animation, certificate modal (PDF support),
// compact To-Do with localStorage, and accessible behaviors.

(function(){
  const root = document.documentElement;
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');

  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme: persist in localStorage, respect prefers-color-scheme initially
  const THEME_KEY = 'site_theme_v1';
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = storedTheme || (prefersLight ? 'light' : 'dark');
  root.setAttribute('data-theme', initial);
  if(themeToggle) {
    themeToggle.setAttribute('aria-pressed', initial === 'light');
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.setAttribute('aria-pressed', next === 'light');
      themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    });
    themeToggle.textContent = initial === 'light' ? '☀️' : '🌙';
  }

  // Mobile nav toggle
  if(navToggle && navList){
    navToggle.addEventListener('click', () => {
      const visible = navList.getAttribute('data-visible') === 'true';
      navList.setAttribute('data-visible', String(!visible));
      navToggle.setAttribute('aria-expanded', String(!visible));
    });
  }

  // Smooth internal link scroll (accessible)
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
      // close nav on mobile
      if(window.innerWidth < 900 && navList) navList.setAttribute('data-visible','false');
    }
  });

  // Animate skill bars on load/scroll into view
  const skillFills = document.querySelectorAll('.skill-fill');
  function animateSkills(){
    skillFills.forEach(fill => {
      const percent = fill.parentElement.previousElementSibling.querySelector('.skill-percent')?.dataset?.value || '';
      if(percent) fill.style.width = percent + '%';
      else fill.style.width = fill.style.width || '0';
    });
  }
  // Run on load and when section enters viewport
  animateSkills();
  const skillsSection = document.getElementById('skills');
  if(skillsSection){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if(en.isIntersecting) animateSkills(); });
    }, {threshold: .25});
    obs.observe(skillsSection);
  }

  /* =========================
     Certificate modal viewer
     - supports images and PDF urls (iframe)
     - basic focus handling and escape to close
     ========================= */
  const certModal = document.getElementById('cert-modal');
  const certBody = certModal && certModal.querySelector('.modal-body');
  const certOpen = document.getElementById('cert-modal-open');
  const certClose = certModal && certModal.querySelector('.modal-close');

  function isPDF(url){
    return url && url.split('?')[0].toLowerCase().endsWith('.pdf');
  }

  function openCert({title = 'Certificate', url = ''} = {}){
    if(!certModal) return;
    certModal.classList.remove('hidden');
    certModal.setAttribute('aria-hidden', 'false');
    // clear body
    certBody.innerHTML = '';
    if(isPDF(url)){
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = title;
      iframe.setAttribute('aria-label', title);
      certBody.appendChild(iframe);
    }else if(url){
      // attempt image
      const img = document.createElement('img');
      img.src = url;
      img.alt = title;
      certBody.appendChild(img);
    }else{
      certBody.textContent = 'No preview available.';
    }
    certOpen.href = url || '#';
    certOpen.style.display = url ? '' : 'none';
    // focus close button
    certClose && certClose.focus();
    // trap focus (simple)
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
    if(e.key === 'Escape') closeCert();
  });

  /* Focus trap helpers (simple) */
  let lastFocusedEl = null;
  function trapFocus(container){
    lastFocusedEl = document.activeElement;
    const focusable = container.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(first) first.focus();
    container.addEventListener('keydown', handleTrap);
    function handleTrap(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    container._trapHandler = handleTrap;
  }
  function releaseFocusTrap(){
    if(!certModal) return;
    certModal.removeEventListener('keydown', certModal._trapHandler);
    if(lastFocusedEl) lastFocusedEl.focus();
  }

  /* =========================
     To-Do app (compact & professional)
     ========================= */
  const TODO_KEY = 'todo_tasks_v2';
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const clearAllBtn = document.getElementById('clear-all');

  let tasks = [];
  let filter = 'all';

  function uid(){ return (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,8); }

  function loadTasks(){
    try{ tasks = JSON.parse(localStorage.getItem(TODO_KEY)) || []; }catch(e){ tasks=[]; }
  }
  function saveTasks(){ localStorage.setItem(TODO_KEY, JSON.stringify(tasks)); }

  function addTask(text){
    const t = (text||'').trim();
    if(!t) return;
    tasks.unshift({id:uid(), text:t, completed:false, created:Date.now()});
    saveTasks(); render();
  }
  function toggleComplete(id){ tasks = tasks.map(x=> x.id===id ? {...x, completed:!x.completed} : x); saveTasks(); render(); }
  function deleteTask(id){ tasks = tasks.filter(x=> x.id!==id); saveTasks(); render(); }
  function clearCompleted(){ tasks = tasks.filter(x=> !x.completed); saveTasks(); render(); }
  function clearAll(){ tasks = []; saveTasks(); render(); }
  function editTask(id, text){ const t=text.trim(); if(!t){ deleteTask(id); return;} tasks = tasks.map(x=> x.id===id ? {...x, text:t} : x); saveTasks(); render(); }

  function filtered(){ if(filter==='active') return tasks.filter(t=>!t.completed); if(filter==='completed') return tasks.filter(t=>t.completed); return tasks; }

  function render(){
    todoList.innerHTML = '';
    const list = filtered();
    if(list.length===0){
      const li = document.createElement('li'); li.className='todo-item muted'; li.textContent='No tasks — add something quick.'; todoList.appendChild(li);
    }else{
      list.forEach(task=>{
        const li = document.createElement('li'); li.className='todo-item'; li.dataset.id=task.id;
        li.innerHTML = `
          <button class="toggle ${task.completed? 'checked':''}" aria-pressed="${task.completed? 'true':'false'}">${task.completed? '✓':''}</button>
          <div class="todo-text ${task.completed? 'completed':''}" tabindex="0">${escapeHtml(task.text)}</div>
          <div class="todo-actions">
            <button class="edit" aria-label="Edit">✎</button>
            <button class="delete" aria-label="Delete">🗑</button>
          </div>
        `;
        todoList.appendChild(li);
      });
    }
    const left = tasks.filter(t=> !t.completed).length;
    itemsLeft.textContent = `${left} item${left!==1?'s':''} left`;
  }

  function escapeHtml(s){ const d=document.createElement('div'); d.textContent = s; return d.innerHTML; }

  if(todoForm){
    todoForm.addEventListener('submit', (e)=>{
      e.preventDefault(); addTask(todoInput.value); todoInput.value=''; todoInput.focus();
    });
  }

  if(todoList){
    todoList.addEventListener('click', (e)=>{
      const li = e.target.closest('li[data-id]');
      if(!li) return;
      const id = li.dataset.id;
      if(e.target.closest('.toggle')){ toggleComplete(id); return; }
      if(e.target.closest('.delete')){ deleteTask(id); return; }
      if(e.target.closest('.edit')){ startEdit(li, id); return; }
    });

    todoList.addEventListener('dblclick', (e)=>{
      const el = e.target.closest('.todo-text');
      const li = e.target.closest('li[data-id]');
      if(el && li) startEdit(li, li.dataset.id);
    });

    function startEdit(li, id){
      const textEl = li.querySelector('.todo-text');
      const current = textEl.textContent;
      const input = document.createElement('input'); input.type='text'; input.value=current; input.className='inline-edit';
      textEl.replaceWith(input); input.focus(); input.select();
      function finish(save){ input.replaceWith(textEl); if(save) editTask(id, input.value); textEl.textContent = input.value; }
      input.addEventListener('blur', ()=> finish(true), {once:true});
      input.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); finish(true); } else if(ev.key==='Escape'){ ev.preventDefault(); finish(false); } });
    }
  }

  filterButtons.forEach(btn => btn.addEventListener('click', ()=> {
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); filter = btn.dataset.filter; render();
  }));
  if(clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);
  if(clearAllBtn) clearAllBtn.addEventListener('click', ()=> { if(confirm('Clear all tasks?')) clearAll(); });

  loadTasks(); render();

  // small accessibility: close modal on Escape and close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(navList && navList.getAttribute('data-visible') === 'true') navList.setAttribute('data-visible','false');
      if(certModal && !certModal.classList.contains('hidden')) closeCert();
    }
  });

  // Expose a small debug API
  window.__portfolio = { addTask, toggleComplete, deleteTask, get tasks(){ return tasks; } };

})();
