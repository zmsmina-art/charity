/* ══════════════════════════════════════════════════════
   HARBOUR OF HOPE — Frontend Logic
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

// ─── Donation Interactivity ───
const freqBtns = document.querySelectorAll('.donate__freq-btn');
const amountBtns = document.querySelectorAll('.donate__amount-btn');
const customInput = document.getElementById('customAmount');
const impactNote = document.getElementById('impactNote');

let selectedFrequency = 'one-time';
let selectedAmount = 50;

const impactMessages = {
  25: '<strong>$25</strong> provides school supplies for a child for an entire semester.',
  50: '<strong>$50</strong> provides meals for a family of four for an entire week.',
  100: '<strong>$100</strong> covers one month of after-school tutoring for a student.',
  250: '<strong>$250</strong> provides emergency housing assistance for a family in crisis.',
};

freqBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    freqBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFrequency = btn.dataset.freq;
    renderPayPalButtons();
  });
});

amountBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    amountBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    customInput.value = '';
    selectedAmount = parseInt(btn.dataset.amount, 10);
    updateImpactNote();
    renderPayPalButtons();
  });
});

customInput.addEventListener('input', () => {
  if (customInput.value) {
    amountBtns.forEach((b) => b.classList.remove('active'));
    selectedAmount = parseInt(customInput.value, 10) || 0;
    updateImpactNote();
    renderPayPalButtons();
  }
});

customInput.addEventListener('focus', () => {
  amountBtns.forEach((b) => b.classList.remove('active'));
});

function updateImpactNote() {
  if (impactMessages[selectedAmount]) {
    impactNote.innerHTML = impactMessages[selectedAmount];
  } else if (selectedAmount > 0) {
    impactNote.innerHTML = `<strong>$${selectedAmount.toLocaleString()}</strong> helps us continue building a brighter future for families in need.`;
  } else {
    impactNote.innerHTML = 'Every dollar makes a meaningful difference.';
  }
}

// ─── PayPal Integration ───
let paypalButtonsRendered = false;

function renderPayPalButtons() {
  const container = document.getElementById('paypal-button-container');

  // Check if PayPal SDK loaded
  if (typeof paypal === 'undefined') {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--color-warm-gray); font-size: 0.9rem;">
        <p style="margin-bottom: 8px;">PayPal is loading...</p>
        <p style="font-size: 0.8rem; opacity: 0.7;">If buttons don't appear, check your PayPal Client ID in index.html</p>
      </div>
    `;
    return;
  }

  // Clear previous buttons
  container.innerHTML = '';

  const amount = selectedAmount || 50;
  const isMonthly = selectedFrequency === 'monthly';

  if (isMonthly) {
    // For monthly/subscription, we show a simplified donate button
    // Note: Full subscription support requires a PayPal plan ID
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'donate',
        height: 48,
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString(),
              currency_code: 'CAD',
            },
            description: `Harbour of Hope — Monthly Donation of $${amount} CAD`,
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING',
          },
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          showDonationSuccess(details.payer.name.given_name, amount);
        });
      },
      onError: function (err) {
        console.error('PayPal error:', err);
      },
    }).render('#paypal-button-container');
  } else {
    // One-time donation
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'donate',
        height: 48,
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString(),
              currency_code: 'CAD',
            },
            description: `Harbour of Hope — One-Time Donation of $${amount} CAD`,
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING',
          },
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          showDonationSuccess(details.payer.name.given_name, amount);
        });
      },
      onError: function (err) {
        console.error('PayPal error:', err);
      },
    }).render('#paypal-button-container');
  }
}

function showDonationSuccess(name, amount) {
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = `
    <div style="text-align: center; padding: 24px; background: rgba(107, 143, 113, 0.08); border-radius: 16px;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B8F71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <h3 style="font-family: var(--font-display); color: var(--color-deep-forest); margin-bottom: 8px;">
        Thank you${name ? ', ' + name : ''}!
      </h3>
      <p style="color: var(--color-warm-gray); font-size: 0.92rem;">
        Your generous donation of <strong>$${amount} CAD</strong> will make a real difference.
        A receipt will be sent to your email.
      </p>
    </div>
  `;
}

// Initial PayPal render after a short delay for SDK loading
setTimeout(renderPayPalButtons, 1500);

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
