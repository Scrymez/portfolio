gsap.registerPlugin(ScrollTrigger);

/* ==================== PRELOADER ==================== */
function runPreloader() {
  const fill = document.getElementById('preloaderFill');
  const preloader = document.getElementById('preloader');

  gsap.to(fill, {
    width: '100%',
    duration: 1,
    ease: 'power2.inOut',
    onComplete: () => {
      preloader.classList.add('done');
      animateHero();
    }
  });
}

if (document.readyState === 'complete') {
  runPreloader();
} else {
  window.addEventListener('load', runPreloader);
}

/* ==================== HERO ENTRANCE ==================== */
function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 })
    .to('.hero-title .line', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, '-=0.4')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
}

/* ==================== SCROLL PROGRESS ==================== */
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

/* ==================== CUSTOM CURSOR ==================== */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .magnetic').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    follower.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    follower.classList.remove('hovered');
  });
});

/* ==================== MAGNETIC BUTTONS ==================== */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ==================== PARALLAX ORBS ==================== */
document.querySelectorAll('.orb').forEach(orb => {
  const speed = parseFloat(orb.dataset.speed) || 0.3;
  gsap.to(orb, {
    yPercent: 50 * speed * 2,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
});

window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);
  document.querySelectorAll('.orb').forEach(orb => {
    const speed = parseFloat(orb.dataset.speed) || 0.3;
    gsap.to(orb, {
      x: x * 60 * speed,
      y: y * 60 * speed,
      duration: 1.2,
      ease: 'power2.out'
    });
  });
});

/* ==================== SCROLL REVEALS ==================== */
gsap.utils.toArray('.reveal-up').forEach(el => {
  // hero elements are animated by the entrance timeline
  if (el.closest('.hero')) return;

  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
});

/* ==================== COUNTERS ==================== */
gsap.utils.toArray('.stat-num').forEach(el => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const obj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.floor(obj.val) + suffix;
        }
      });
    }
  });
});

/* ==================== SECTION TITLE PARALLAX ==================== */
gsap.utils.toArray('.section-title').forEach(el => {
  gsap.fromTo(el, { backgroundPositionX: '0%' }, {
    backgroundPositionX: '0%',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
  });
});

/* ==================== MAGIC SPOTLIGHT ==================== */
document.querySelectorAll('.magic-spotlight').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

/* ==================== LIGHTBOX ==================== */
(() => {
  const images = Array.from(document.querySelectorAll('.case-media img'));
  if (!images.length) return;

  const lightbox = document.getElementById('lightbox');
  const stage = document.getElementById('lightboxStage');
  const img = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');

  let index = 0;
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  function applyTransform() {
    img.style.transform = `scale(${scale}) translate(${posX}px, ${posY}px)`;
    stage.classList.toggle('zoomed', scale > 1);
  }

  function resetZoom() {
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform();
  }

  function show(i) {
    index = (i + images.length) % images.length;
    resetZoom();
    img.src = images[index].src;
    img.alt = images[index].alt || '';
    counter.textContent = `${index + 1} / ${images.length}`;
  }

  function open(i) {
    show(i);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  images.forEach((el, i) => {
    el.addEventListener('click', () => open(i));
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));

  lightbox.querySelector('.lightbox-backdrop').addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // zoom on scroll
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    scale = Math.min(4, Math.max(1, scale + delta));
    if (scale === 1) { posX = 0; posY = 0; }
    applyTransform();
  }, { passive: false });

  // double-click to toggle zoom
  img.addEventListener('dblclick', () => {
    if (scale > 1) {
      resetZoom();
    } else {
      scale = 2.5;
      applyTransform();
    }
  });

  // drag to pan when zoomed
  stage.addEventListener('mousedown', (e) => {
    if (scale === 1) return;
    isDragging = true;
    stage.classList.add('dragging');
    dragStartX = e.clientX - posX * scale;
    dragStartY = e.clientY - posY * scale;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = (e.clientX - dragStartX) / scale;
    posY = (e.clientY - dragStartY) / scale;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    stage.classList.remove('dragging');
  });
})();

/* ==================== MOBILE MENU ==================== */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});
