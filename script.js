document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Thank you for reaching out! I will get back to you soon.');
    this.reset();
});
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Thank you for reaching out! I will get back to you soon.');
    this.reset();
});

// Existing contact form code stays here...

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        this.textContent = '☀️ Light Mode';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        this.textContent = '🌙 Dark Mode';
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Remember dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('dark-mode-toggle').textContent = '☀️ Light Mode';
}

// ---- Project Filter/Search Start ----
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const searchInput = document.getElementById('project-search');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Highlight
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const tags = card.getAttribute('data-tags');
            if (filter === 'all' || tags.includes(filter)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
// default selection
if (filterButtons[0]) filterButtons[0].classList.add('active');

// Search filter
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        const search = this.value.toLowerCase();
        projectCards.forEach(card => {
            let text = card.innerText.toLowerCase();
            card.style.display = text.includes(search) ? '' : 'none';
        });
    });
}

// ---- Project Modal Popup Start ----
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// Array of your project details (edit/add as needed)
const projects = [
    {
        title: "Portfolio Website",
        desc: "A modern portfolio site built with HTML, CSS, and JS. Responsive, interactive, and beautifully designed.",
        img: "portfolio-screenshot.png", // put your image file in the project folder!
        tags: "Web, JavaScript",
        link: "https://hunde-del.github.io/portfolio/"
    },
    {
        title: "Graphic Design Gallery",
        desc: "Collection of personal digital art and design works. Features gallery view and cool CSS effects.",
        img: "design-screenshot.png",
        tags: "Design",
        link: "#"
    }
];

// Function to open the modal and fill with project info
function openModal(idx) {
    const p = projects[idx];
    modalBody.innerHTML = `
        <h2>${p.title}</h2>
        <img src="${p.img}" alt="${p.title}" style="width:100%;max-width:350px;display:block;margin:18px auto 12px;border-radius:7px;">
        <p style="margin-bottom:8px;">${p.desc}</p>
        <span class="project-tags">${p.tags}</span><br>
        ${p.link !== "#" ? `<a href="${p.link}" target="_blank" style="color:#0057b7;">Visit Project &rarr;</a>` : ""}
    `;
    modal.style.display = "block";
}

// Close modal
if (closeModalBtn) {
    closeModalBtn.onclick = () => (modal.style.display = "none");
}
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
};
// ---- Project Modal Popup End ----

// Project Data Array
const modalProjects = [
  {
    title: "Personal Portfolio Site",
    desc: "Responsive one-page website with a modern hero, about, skills, and project showcase. Features modal popups and smooth scroll.",
    img: "portfolio_thumb.jpg",
    badges: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/yourusername/portfolio",
    live: "#"
  },
  {
    title: "Forum REST API",
    desc: "Full-featured REST API for an online forum—users, auth, threads, roles, JWT, and documentation.",
    img: "forum_api_thumb.jpg",
    badges: ["Node.js", "Express", "JWT"],
    github: "https://github.com/yourusername/forum-api",
    live: "#"
  }
  // Add more as needed!
];

function showProjectModal(idx) {
  const p = modalProjects[idx];
  document.getElementById("modal-body").innerHTML = `
    <h2>${p.title}</h2>
    <img src="${p.img}" alt="${p.title}" style="width:100%;max-width:340px;margin-top:18px;border-radius:8px;">
    <p style="margin:10px 0 8px 0;">${p.desc}</p>
    <div style="margin-bottom:10px;">
      ${p.badges.map(b=>`<span class="badge">${b}</span>`).join(' ')}
    </div>
    <a href="${p.github}" target="_blank" class="btn" style="margin-right:8px;">GitHub</a>
    ${p.live !== "#" ? `<a href="${p.live}" target="_blank" class="btn-outline">Live</a>` : ""}
  `;
  document.getElementById("project-modal").style.display = "block";
}
document.getElementById("close-modal").onclick = () => (document.getElementById("project-modal").style.display = "none");
window.onclick = (e) => {
  if (e.target == document.getElementById("project-modal")) document.getElementById("project-modal").style.display = "none";
};

document.getElementById("contact-form").onsubmit = function(e) {
    e.preventDefault();
    alert("Thank you for reaching out! I'll reply as soon as possible.");
    this.reset();
};

// Reveal-on-scroll for sections
const sections = document.querySelectorAll('.section');
function revealSections() {
  for (let sec of sections) {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      sec.classList.add('visible');
    }
  }
}
window.addEventListener('scroll', revealSections);
window.addEventListener('load', revealSections);

// ---- Project Filter/Search End ----
