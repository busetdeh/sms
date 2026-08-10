/**
 * Sky Multirotor Squad - Main JavaScript Engine
 * Provides responsiveness, telemetry widgets, interactive modals, and flight utilities.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initParallax();
  initTelemetryStatus();
  initFlightCalculator();
  initModals();
  initFilterTabs();
});

/* -------------------------------------------------------------------------- */
/* Navbar & Scroll Behavior                                                   */
/* -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('nav');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('bg-surface/95', 'backdrop-blur-md', 'shadow-lg');
    } else {
      navbar.classList.remove('bg-surface/95', 'backdrop-blur-md', 'shadow-lg');
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* Mobile Drawer Menu                                                         */
/* -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const openBtn = document.getElementById('open-menu-btn');
  const closeBtn = document.getElementById('close-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');

  if (!drawer) return;

  function toggleMenu(open) {
    if (open) {
      drawer.classList.add('open');
      if (overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
      }
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
      }
      document.body.style.overflow = '';
    }
  }

  if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
  if (overlay) overlay.addEventListener('click', () => toggleMenu(false));

  // Close when clicking nav links inside drawer
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* -------------------------------------------------------------------------- */
/* Hero Parallax Effect                                                       */
/* -------------------------------------------------------------------------- */
function initParallax() {
  const parallaxBg = document.getElementById('parallax-bg');
  if (!parallaxBg) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxBg.style.transform = `scale(1.15) translate3d(0, ${scrollY * 0.35}px, 0)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* Live Telemetry Flight Status (Simulation based on Serang, Banten HQ)      */
/* -------------------------------------------------------------------------- */
function initTelemetryStatus() {
  const windEl = document.getElementById('telemetry-wind');
  const satEl = document.getElementById('telemetry-sat');
  const kpEl = document.getElementById('telemetry-kp');
  const statusEl = document.getElementById('telemetry-status');

  if (!windEl) return;

  // Base realistic simulation
  const conditions = [
    { wind: '8 km/h NW', sat: '18 Sats (3D Fix)', kp: 'KP 1.8 (Good)', status: 'FLYING CONDITIONS OPTIMAL', good: true },
    { wind: '11 km/h W', sat: '20 Sats (Galileo/GPS)', kp: 'KP 2.1 (Good)', status: 'FLYING CONDITIONS OPTIMAL', good: true },
    { wind: '14 km/h SW', sat: '16 Sats (3D Fix)', kp: 'KP 2.4 (Good)', status: 'MODERATE BREEZE - CAUTION FREESTYLE', good: true }
  ];

  let currentIdx = 0;

  function updateTelemetry() {
    const current = conditions[currentIdx];
    if (windEl) windEl.textContent = current.wind;
    if (satEl) satEl.textContent = current.sat;
    if (kpEl) kpEl.textContent = current.kp;
    if (statusEl) {
      statusEl.textContent = current.status;
      statusEl.className = current.good ? 'text-green-400 font-label-caps' : 'text-yellow-400 font-label-caps';
    }
    currentIdx = (currentIdx + 1) % conditions.length;
  }

  updateTelemetry();
  setInterval(updateTelemetry, 12000);
}

/* -------------------------------------------------------------------------- */
/* LiPo Flight Time & Battery Estimator Tool                                  */
/* -------------------------------------------------------------------------- */
function initFlightCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) return;

  const capacityInput = document.getElementById('calc-capacity'); // in mAh
  const droneTypeSelect = document.getElementById('calc-type');
  const flightStyleSelect = document.getElementById('calc-style');
  const resultTime = document.getElementById('calc-result-time');
  const resultAmp = document.getElementById('calc-result-amp');
  const resultRecommendation = document.getElementById('calc-result-rec');

  function calculate() {
    const capacity = parseFloat(capacityInput.value) || 1300;
    const droneType = droneTypeSelect.value;
    const flightStyle = flightStyleSelect.value;

    // Average current draw lookup in Amperes
    let baseDraw = 20; // 5 inch freestyle average
    if (droneType === 'cinewhoop') baseDraw = 14;
    else if (droneType === 'fpv5') baseDraw = 22;
    else if (droneType === 'cinelifter') baseDraw = 45;
    else if (droneType === 'longrange') baseDraw = 8;
    else if (droneType === 'aeromodel') baseDraw = 12;

    // Multiplier for flight style
    let styleMultiplier = 1.0;
    if (flightStyle === 'chill') styleMultiplier = 0.75;
    else if (flightStyle === 'racing') styleMultiplier = 1.65;
    else if (flightStyle === 'cinematic') styleMultiplier = 0.85;
    else if (flightStyle === 'freestyle') styleMultiplier = 1.25;

    const totalAverageAmp = baseDraw * styleMultiplier;
    // 80% rule for LiPo battery safety
    const usableCapacityAh = (capacity * 0.80) / 1000;
    const flightTimeMinutes = (usableCapacityAh / totalAverageAmp) * 60;

    const mins = Math.floor(flightTimeMinutes);
    const secs = Math.round((flightTimeMinutes - mins) * 60);

    if (resultTime) resultTime.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    if (resultAmp) resultAmp.textContent = `~${totalAverageAmp.toFixed(1)} A avg`;
    if (resultRecommendation) {
      if (mins < 3) {
        resultRecommendation.textContent = '⚡ Agresif! Gunakan alarm voltage/OSD di 3.6V per cell untuk menghindari sag.';
      } else if (mins > 10) {
        resultRecommendation.textContent = '✈️ Efisiensi mantap! Cocok untuk cruising and exploration.';
      } else {
        resultRecommendation.textContent = '🎯 Setting seimbang antara power, manuver, dan durasi baterai.';
      }
    }
  }

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  calculate();
}

/* -------------------------------------------------------------------------- */
/* Modal Viewer System                                                        */
/* -------------------------------------------------------------------------- */
function initModals() {
  const modalBackdrops = document.querySelectorAll('.modal-backdrop');

  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  modalBackdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalBackdrops.forEach(modal => {
        if (modal.classList.contains('active')) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Filter Tabs (Articles / Gallery)                                           */
/* -------------------------------------------------------------------------- */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const filterItems = document.querySelectorAll('.filter-item');

  if (!filterBtns.length || !filterItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');

      // Update button active states
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold');
        b.classList.add('bg-surface-container', 'text-on-surface-variant');
      });

      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
      btn.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');

      // Filter elements
      filterItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
          item.style.display = '';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });
    });
  });
}
