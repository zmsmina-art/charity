/* ══════════════════════════════════════════════════════
   ECLAT BEGINNINGS — Frontend Logic
   ══════════════════════════════════════════════════════ */

// ─── Scroll Reveal ───
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
        if (siblings && siblings.length > 1) {
          const idx = Array.from(siblings).indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.1}s`;
        }
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ─── Nav Scroll State ───
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  lastScroll = scrollY;
}, { passive: true });

// ─── Mobile Nav Toggle ───
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ─── Counter Animation ───
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.impact__number').forEach((el) => counterObserver.observe(el));

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.round(easedProgress * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Add a "+" suffix for larger numbers
      el.textContent = target.toLocaleString() + '+';
    }
  }

  requestAnimationFrame(update);
}

// ─── Program Detail Toggle ───
function toggleProgramDetail(id, btn) {
  const detail = document.getElementById(id);
  const isOpen = detail.classList.contains('open');

  // Close all open details first
  document.querySelectorAll('.program-detail.open').forEach((el) => {
    el.classList.remove('open');
  });

  // Toggle the clicked one (if it wasn't already open)
  if (!isOpen) {
    detail.classList.add('open');
    // Make inner content visible for reveal animation
    const inner = detail.querySelector('.program-detail__inner');
    if (inner) inner.classList.add('visible');
    // Scroll into view after a brief delay for the animation
    setTimeout(() => {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

// Make toggleProgramDetail available globally
window.toggleProgramDetail = toggleProgramDetail;

// ─── Smooth anchor scrolling with offset ───
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
