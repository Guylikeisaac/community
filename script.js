/* ============================================
   SyncUp Communities — script.js
   ============================================ */

/* ---- Community Data ---- */
const communities = [
  {
    number: "01",
    abbreviation: "TA",
    name: "Talent Acquisition",
    description: "For recruiters, talent acquisition professionals and people working across hiring.",
    link: "https://chat.whatsapp.com/BePLWJnBxUN6btKouNA3is?mode=gi_t"
  },
  {
    number: "02",
    abbreviation: "SDE",
    name: "Software Development",
    description: "For software developers, engineers and people building digital products.",
    link: "https://chat.whatsapp.com/D68qlLyjIPY10hOgXLvOxn?mode=gi_t"
  },
  {
    number: "03",
    abbreviation: "DATA",
    name: "Data",
    description: "For professionals working across data, analytics and data engineering.",
    link: "https://chat.whatsapp.com/IKfbKsinjAH11aFZTg1Na9?mode=gi_t"
  },
  {
    number: "04",
    abbreviation: "SALES",
    name: "Sales",
    description: "For sales professionals and people working across business development and revenue.",
    link: "https://chat.whatsapp.com/L6LbfwH0xldJFqYShwoIFq?mode=gi_t"
  },
  {
    number: "05",
    abbreviation: "DESIGN",
    name: "Design",
    description: "For people working across UI, UX, product and visual design.",
    link: "https://chat.whatsapp.com/IrfyrCjkgz3Ekl72mxcMpM?mode=gi_t"
  },
  {
    number: "06",
    abbreviation: "FREELANCE",
    name: "Freelance",
    description: "For independent professionals sharing opportunities, knowledge and experiences.",
    link: "https://chat.whatsapp.com/HFxuW4xFd9B9kl2OdMXraC?mode=gi_t"
  },
  {
    number: "07",
    abbreviation: "FOUNDERS",
    name: "Founders",
    description: "For founders building companies, products and lasting businesses.",
    link: "https://chat.whatsapp.com/KE9zPqyXdK6FiJQTZULpdc?mode=gi_t"
  }
];

/* ---- Render Communities ---- */
function renderCommunities() {
  const grid = document.getElementById('community-grid');
  if (!grid) return;

  grid.innerHTML = communities.map((community) => `
    <a class="community-item" href="${community.link}" target="_blank" rel="noopener noreferrer" aria-label="Join ${community.name} community" data-community="${community.abbreviation}">
      <div class="community-top">
        <span class="community-number">${community.number}</span>
        <span class="community-abbrev">${community.abbreviation}</span>
      </div>
      <h3 class="community-name">${community.name}</h3>
      <p class="community-desc">${community.description}</p>
      <span class="btn-join" aria-hidden="true">
        Join Community <span class="arrow">→</span>
      </span>
    </a>
  `).join('');
}

/* ---- 3D Community Carousel ---- */
function initializeCommunityCarousel() {
  const carousel = document.getElementById('community-grid');
  if (!carousel) return;

  const items = [...carousel.querySelectorAll('.community-item')];
  if (!items.length) return;

  let rotation = 0;
  let lastTimestamp = 0;
  let isPaused = false;

  function positionItems(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isPaused) rotation += elapsed * 0.018;

    const radiusX = Math.min(carousel.clientWidth * 0.30, 260);
    const radiusY = Math.min(carousel.clientHeight * 0.24, 190);
    const depthRadius = Math.min(carousel.clientWidth * 0.22, 220);
    const baseSize = Math.min(Math.max(carousel.clientWidth * 0.22, 190), 280);
    const angleStep = 360 / items.length;

    items.forEach((item, index) => {
      const angle = index * angleStep + rotation;
      const radians = angle * Math.PI / 180;
      const depth = Math.cos(radians);
      const x = Math.sin(radians) * radiusX;
      const y = Math.cos(radians) * radiusY;
      const scale = 0.72 + ((depth + 1) / 2) * 0.28;
      const size = baseSize * scale;

      item.style.width = `${size}px`;
      item.style.height = `${size}px`;
      item.style.left = `${carousel.clientWidth / 2 + x - size / 2}px`;
      item.style.top = `${carousel.clientHeight / 2 + y - size / 2}px`;
      item.style.zIndex = Math.round((depth + 1) * 100);
      item.style.opacity = `${0.58 + ((depth + 1) / 2) * 0.42}`;
    });

    requestAnimationFrame(positionItems);
  }

  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });
  carousel.addEventListener('focusin', () => { isPaused = true; });
  carousel.addEventListener('focusout', () => { isPaused = false; });
  positionItems(0);
  requestAnimationFrame(positionItems);
}

/* ---- Toast Notification ---- */
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Clear previous timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('visible');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    toastTimeout = null;
  }, 2200);
}

/* ---- Join Community Handler ---- */
function handleJoinCommunity(communityName) {
  showToast(`${communityName} — community link coming soon.`);
}

/* ---- Explore Communities Handler ---- */
function handleExplore() {
  const items = document.querySelectorAll('.community-item');
  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('highlight');
      setTimeout(() => {
        item.classList.remove('highlight');
      }, 600);
    }, index * 80);
  });

  // Focus the first community item
  if (items.length > 0) {
    items[0].focus();
  }
}

/* ---- Mobile Menu ---- */
function initializeMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-menu-overlay');

  if (!menuBtn || !overlay) return;

  menuBtn.addEventListener('click', () => {
    const isActive = menuBtn.classList.toggle('active');
    overlay.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  });

  // Close menu when clicking a link
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Grain Canvas ---- */
function initializeGrain() {
  const canvas = document.getElementById('grain-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Draw grain less frequently for performance
  let lastDraw = 0;
  function animate(timestamp) {
    if (timestamp - lastDraw > 100) { // ~10fps for subtle effect
      drawGrain();
      lastDraw = timestamp;
    }
    animFrame = requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  animate(0);

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      animate(0);
    }
  });
}

/* ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderCommunities();
  initializeCommunityCarousel();
  initializeMenu();
  initializeGrain();
});
