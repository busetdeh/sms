/**
 * Sky Multirotor Squad - Main JavaScript Engine
 * Provides responsiveness, telemetry widgets, interactive modals, flight utilities,
 * dynamic event calendar with Supabase integration, and realtime synchronization.
 */

import {
  getSupabaseEvents,
  getSupabasePilots,
  getSupabaseSpots,
  getSupabaseGallery,
  submitSupabaseContact,
  subscribeToTable
} from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initParallax();
  initTelemetryStatus();
  initFlightCalculator();
  initModals();
  initFilterTabs();
  initEventCalendar();
  initContactForm();
  initDynamicPilots();
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

  const capacityInput = document.getElementById('calc-capacity');
  const droneTypeSelect = document.getElementById('calc-type');
  const flightStyleSelect = document.getElementById('calc-style');
  const resultTime = document.getElementById('calc-result-time');
  const resultAmp = document.getElementById('calc-result-amp');
  const resultRecommendation = document.getElementById('calc-result-rec');

  function calculate() {
    const capacity = parseFloat(capacityInput.value) || 1300;
    const droneType = droneTypeSelect.value;
    const flightStyle = flightStyleSelect.value;

    let baseDraw = 20;
    if (droneType === 'cinewhoop') baseDraw = 14;
    else if (droneType === 'fpv5') baseDraw = 22;
    else if (droneType === 'cinelifter') baseDraw = 45;
    else if (droneType === 'longrange') baseDraw = 8;
    else if (droneType === 'aeromodel') baseDraw = 12;

    let styleMultiplier = 1.0;
    if (flightStyle === 'chill') styleMultiplier = 0.75;
    else if (flightStyle === 'racing') styleMultiplier = 1.65;
    else if (flightStyle === 'cinematic') styleMultiplier = 0.85;
    else if (flightStyle === 'freestyle') styleMultiplier = 1.25;

    const totalAverageAmp = baseDraw * styleMultiplier;
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

      filterBtns.forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold');
        b.classList.add('bg-surface-container', 'text-on-surface-variant');
      });

      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
      btn.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');

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

/* -------------------------------------------------------------------------- */
/* Full Function Interactive Event Calendar with Supabase Integration         */
/* -------------------------------------------------------------------------- */
function initEventCalendar() {
  const calendarGrid = document.getElementById('cal-days-grid');
  if (!calendarGrid) return;

  const monthTitleEl = document.getElementById('cal-month-title');
  const prevBtn = document.getElementById('cal-prev-btn');
  const nextBtn = document.getElementById('cal-next-btn');
  const todayBtn = document.getElementById('cal-today-btn');
  const eventCountEl = document.getElementById('cal-event-count');
  const eventsContainer = document.getElementById('cal-events-container');
  const listTitleEl = document.getElementById('cal-list-title');
  const resetFilterBtn = document.getElementById('cal-reset-filter-btn');

  const MONTH_NAMES = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  // Fallback Local Events
  let EVENTS = [
    {
      id: 'ev-1',
      date: '2026-05-15',
      displayDate: '15 Mei 2026',
      badge: '15 MEI',
      title: 'Regional FPV Race Banten 2026',
      category: 'KOMPETISI',
      categoryBadge: 'bg-primary-container text-on-primary',
      location: 'Sirkuit Ecopark Citra Garden BMW, Serang',
      time: '08:00 - 17:00 WIB',
      description: 'Kompetisi balap drone FPV tingkat regional yang mempertemukan pilot-pilot terbaik di Sirkuit Citra BMW. Kategori: 5" Open Pro & 3.5" Beginner Class.',
      slots: '8 Slot Tersisa'
    },
    {
      id: 'ev-2',
      date: '2026-05-24',
      displayDate: '24 Mei 2026',
      badge: '24 MEI',
      title: 'Fun Fly & Setup Gate FPV Mingguan',
      category: 'GATHERING',
      categoryBadge: 'bg-surface-bright text-white',
      location: 'Ecopark Citra Garden BMW, Serang',
      time: '14:30 - 18:00 WIB',
      description: 'Latihan bersama setup LED gate, uji timing system LapRF, dan terbang santai sambil sharing seputar perakitan drone.',
      slots: 'Terbuka Untuk Umum (Gratis)'
    },
    {
      id: 'ev-3',
      date: '2026-06-07',
      displayDate: '07 Juni 2026',
      badge: '07 JUN',
      title: 'Fixed Wing & Aeromodeling Sunday Fly',
      category: 'AEROMODEL',
      categoryBadge: 'bg-surface-bright text-white',
      location: 'Bandara Banten Fly Zone / Citra BMW',
      time: '07:00 - 11:30 WIB',
      description: 'Sesi terbang khusus pesawat sayap tetap (Fixed Wing), Glider, Bixler, dan pesawat model skala dengan runway luas.',
      slots: 'Bawa Pesawat / Spectator'
    },
    {
      id: 'ev-4',
      date: '2026-06-22',
      displayDate: '22 Juni 2026',
      badge: '22 JUN',
      title: 'Charity Flight Mission Pulau Sangiang',
      category: 'CHARITY',
      categoryBadge: 'bg-primary-container text-on-primary',
      location: 'Pulau Sangiang, Selat Sunda',
      time: '2 Hari 1 Malam (Camp & Fly)',
      description: 'Misi terbang amal penggalangan dana sosial sekaligus dokumentasi sinematik aerial panorama keindahan alam Pulau Sangiang.',
      slots: 'Pendaftaran Terbuka'
    },
    {
      id: 'ev-5',
      date: '2026-07-12',
      displayDate: '12 Juli 2026',
      badge: '12 JUL',
      title: 'Workshop Betaflight 4.5 & PID Tuning',
      category: 'WORKSHOP',
      categoryBadge: 'bg-surface-bright text-white',
      location: 'SMS Basecamp, Kramatwatu, Serang',
      time: '13:00 - 17:00 WIB',
      description: 'Bedah tuntas konfigurasi filter gyro, D-term, RPM filtering, ELRS 3.x, dan tuning responsif tanpa osilasi motor panas.',
      slots: 'Maks 15 Peserta'
    },
    {
      id: 'ev-6',
      date: '2026-08-10',
      displayDate: '10 Agustus 2026',
      badge: '10 AGU',
      title: 'Aero-Tech & Drone Assembly Meetup',
      category: 'TEKNOLOGI',
      categoryBadge: 'bg-surface-bright text-white',
      location: 'SMS Workshop & Lab Serang',
      time: '10:00 - 16:00 WIB',
      description: 'Pertemuan teknis membahas inovasi motor brushless, soldering aman, manajemen voltase baterai LiPo/Li-Ion, dan 3D printing custom TPU parts.',
      slots: 'Gratis Anggota'
    },
    {
      id: 'ev-7',
      date: '2026-08-17',
      displayDate: '17 Agustus 2026',
      badge: '17 AGU',
      title: 'Pengibaran Bendera Merah Putih di Udara',
      category: 'SPECIAL',
      categoryBadge: 'bg-primary-container text-on-primary',
      location: 'Pantai Anyer & Ecopark Citra BMW',
      time: '08:00 - 12:00 WIB',
      description: 'Formasi terbang spektakuler membawa bendera merah putih oleh skuad multirotor dan pesawat aeromodeling memperingati HUT Kemerdekaan RI.',
      slots: 'All Members Mandatory Fly'
    }
  ];

  // Calendar State
  let currentYear = 2026;
  let currentMonth = 4; // May (0-indexed)
  let selectedDateStr = null; // YYYY-MM-DD format

  function formatSupabaseEvent(dbEvent) {
    const d = new Date(dbEvent.date);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const shortMonth = month.substring(0, 3);
    const isSpecial = dbEvent.category === 'KOMPETISI' || dbEvent.category === 'SPECIAL' || dbEvent.category === 'CHARITY';

    return {
      id: dbEvent.id,
      date: dbEvent.date,
      displayDate: `${day} ${month} ${year}`,
      badge: dbEvent.badge || `${day < 10 ? '0' : ''}${day} ${shortMonth}`,
      title: dbEvent.title,
      category: dbEvent.category || 'GATHERING',
      categoryBadge: isSpecial ? 'bg-primary-container text-on-primary' : 'bg-surface-bright text-white',
      location: dbEvent.location || 'Ecopark Citra Garden BMW, Serang',
      time: dbEvent.time || '08:00 - Selesai WIB',
      description: dbEvent.description || '',
      slots: dbEvent.slots || 'Terbuka Untuk Umum',
      maps_url: dbEvent.maps_url
    };
  }

  // Load from Supabase asynchronously
  async function loadSupabaseEventsData() {
    const data = await getSupabaseEvents();
    if (data && data.length > 0) {
      EVENTS = data.map(formatSupabaseEvent);
      renderCalendar();
      renderEventList();
    }
  }

  function getEventsForMonth(year, month) {
    return EVENTS.filter(ev => {
      const [y, m] = ev.date.split('-');
      return parseInt(y) === year && parseInt(m) - 1 === month;
    });
  }

  function getEventsForDate(dateStr) {
    return EVENTS.filter(ev => ev.date === dateStr);
  }

  function renderCalendar() {
    if (monthTitleEl) {
      monthTitleEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    }

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const monthEvents = getEventsForMonth(currentYear, currentMonth);
    if (eventCountEl) {
      eventCountEl.textContent = `${monthEvents.length} Event Bulan Ini`;
    }

    calendarGrid.innerHTML = '';

    // Prev Month Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dayEl = document.createElement('div');
      dayEl.className = 'py-2 sm:py-2.5 text-on-surface-variant/30 text-xs sm:text-sm select-none';
      dayEl.textContent = dayNum;
      calendarGrid.appendChild(dayEl);
    }

    // Current Month Days
    const today = new Date();
    const isCurrentActualMonth = (today.getFullYear() === currentYear && today.getMonth() === currentMonth);
    const todayDateNum = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dayStr);
      const hasEvent = dayEvents.length > 0;
      const isSelected = (selectedDateStr === dayStr);
      const isToday = isCurrentActualMonth && (todayDateNum === day);

      const dayButton = document.createElement('button');
      dayButton.type = 'button';
      dayButton.setAttribute('data-date', dayStr);

      let classes = 'relative py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center ';

      if (isSelected) {
        classes += 'bg-primary-container text-on-primary font-bold shadow-[0_0_12px_rgba(255,199,0,0.6)] scale-105 z-10';
      } else if (hasEvent) {
        classes += 'bg-primary-container/20 text-primary-container border border-primary-container/60 hover:bg-primary-container hover:text-on-primary font-bold';
      } else if (isToday) {
        classes += 'border border-outline text-white hover:bg-surface-container-high';
      } else {
        classes += 'text-on-surface hover:bg-surface-container-high/80 hover:text-primary-container';
      }

      dayButton.className = classes;
      dayButton.textContent = day;

      if (hasEvent && !isSelected) {
        const dot = document.createElement('span');
        dot.className = 'absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_6px_rgba(255,199,0,0.8)]';
        dayButton.appendChild(dot);
      }

      dayButton.addEventListener('click', () => {
        if (selectedDateStr === dayStr) {
          selectedDateStr = null;
        } else {
          selectedDateStr = dayStr;
        }
        renderCalendar();
        renderEventList();
      });

      calendarGrid.appendChild(dayButton);
    }

    // Next Month Days
    const totalRendered = firstDayIndex + daysInMonth;
    const remainingSlots = (totalRendered <= 35) ? (35 - totalRendered) : (42 - totalRendered);

    for (let nextDay = 1; nextDay <= remainingSlots; nextDay++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'py-2 sm:py-2.5 text-on-surface-variant/30 text-xs sm:text-sm select-none';
      dayEl.textContent = nextDay;
      calendarGrid.appendChild(dayEl);
    }
  }

  function renderEventList() {
    if (!eventsContainer) return;
    eventsContainer.innerHTML = '';

    let displayedEvents = [];

    if (selectedDateStr) {
      displayedEvents = getEventsForDate(selectedDateStr);
      const [y, m, d] = selectedDateStr.split('-');
      const formattedDate = `${parseInt(d)} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
      if (listTitleEl) listTitleEl.textContent = `AGENDA TANGGAL: ${formattedDate}`;
      if (resetFilterBtn) resetFilterBtn.classList.remove('hidden');
    } else {
      displayedEvents = getEventsForMonth(currentYear, currentMonth);
      if (listTitleEl) listTitleEl.textContent = `DAFTAR AGENDA ${MONTH_NAMES[currentMonth]} ${currentYear}`;
      if (resetFilterBtn) resetFilterBtn.classList.add('hidden');
    }

    if (displayedEvents.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'p-6 rounded-lg bg-surface-container border border-surface-variant text-center flex flex-col items-center justify-center gap-3';
      emptyCard.innerHTML = `
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/60">event_busy</span>
        <div>
          <h4 class="text-white font-bold font-stats-lg text-base mb-1">Tidak Ada Jadwal Resmi Khusus</h4>
          <p class="text-on-surface-variant text-xs max-w-md mx-auto">
            ${selectedDateStr ? 'Tidak ada kompetisi/gathering resmi pada tanggal ini.' : 'Belum ada agenda besar terjadwal untuk bulan ini.'} 
            Gathering santai mingguan SMS tetap berlangsung setiap <strong>Minggu pagi / sore</strong> di Markas Ecopark Citra Garden BMW.
          </p>
        </div>
        <button onclick="openModal('join-modal')" class="mt-2 text-xs font-label-caps text-primary-container border border-primary-container px-4 py-2 hover:bg-primary-container hover:text-on-primary transition-all font-bold slant-btn">
          IKUT TERBANG MINGGUAN
        </button>
      `;
      eventsContainer.appendChild(emptyCard);
      return;
    }

    displayedEvents.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container border border-surface-variant hover:border-primary-container/60 transition-all group rounded-lg shadow-md';
      
      card.innerHTML = `
        <div class="flex-grow">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="${ev.categoryBadge} font-label-caps text-[10px] px-2 py-0.5 font-bold rounded-sm">${ev.badge}</span>
            <span class="text-[10px] font-label-caps text-primary-container border border-primary-container/30 px-2 py-0.5 rounded-sm">${ev.category}</span>
            <span class="text-[11px] text-on-surface-variant/80 font-label-caps ml-auto sm:ml-0 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">schedule</span> ${ev.time}
            </span>
          </div>
          <h3 class="text-white font-bold font-stats-lg text-base sm:text-lg group-hover:text-primary-container transition-colors mb-1">
            ${ev.title}
          </h3>
          <p class="text-on-surface-variant text-xs sm:text-sm font-body-md line-clamp-2 mb-2 leading-relaxed">
            ${ev.description}
          </p>
          <div class="flex items-center gap-1 text-[11px] font-label-caps text-on-surface-variant/80">
            <span class="material-symbols-outlined text-xs text-primary-container">location_on</span>
            <span>${ev.location}</span>
          </div>
        </div>

        <div class="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-variant/60">
          <button data-event-id="${ev.id}" class="cal-detail-btn w-full sm:w-auto text-primary-container border border-primary-container px-4 py-2 font-label-caps text-xs hover:bg-primary-container hover:text-on-primary transition-all font-bold slant-btn flex items-center justify-center gap-1">
            DETAIL &amp; RSVP
          </button>
        </div>
      `;

      eventsContainer.appendChild(card);
    });

    eventsContainer.querySelectorAll('.cal-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const evId = btn.getAttribute('data-event-id');
        const evData = EVENTS.find(e => e.id === evId);
        if (evData) openEventModal(evData);
      });
    });
  }

  function openEventModal(eventData) {
    const modalCategory = document.getElementById('event-modal-category');
    const modalTitle = document.getElementById('event-modal-title');
    const modalDate = document.getElementById('event-modal-date');
    const modalTime = document.getElementById('event-modal-time');
    const modalLocation = document.getElementById('event-modal-location');
    const modalDesc = document.getElementById('event-modal-desc');
    const modalRsvpBtn = document.getElementById('event-modal-rsvp-btn');
    const modalMapsBtn = document.getElementById('event-modal-maps-btn');

    if (modalCategory) modalCategory.textContent = eventData.category;
    if (modalTitle) modalTitle.textContent = eventData.title;
    if (modalDate) modalDate.textContent = eventData.displayDate;
    if (modalTime) modalTime.textContent = eventData.time;
    if (modalLocation) modalLocation.textContent = eventData.location;
    if (modalDesc) modalDesc.textContent = eventData.description;

    if (modalRsvpBtn) {
      const msg = encodeURIComponent(`Halo Admin Sky Multirotor Squad, saya ingin mendaftar / bertanya seputar acara "${eventData.title}" (${eventData.displayDate}).`);
      modalRsvpBtn.href = `https://wa.me/6287772272928?text=${msg}`;
    }

    if (modalMapsBtn) {
      const mapTarget = eventData.maps_url || `https://maps.google.com/?q=${encodeURIComponent(eventData.location)}`;
      modalMapsBtn.href = mapTarget;
    }

    if (window.openModal) {
      window.openModal('event-modal');
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      selectedDateStr = null;
      renderCalendar();
      renderEventList();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      selectedDateStr = null;
      renderCalendar();
      renderEventList();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentYear = 2026;
      currentMonth = 4;
      selectedDateStr = '2026-05-15';
      renderCalendar();
      renderEventList();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      selectedDateStr = null;
      renderCalendar();
      renderEventList();
    });
  }

  // Realtime subscription to events table
  subscribeToTable('events', () => {
    console.log('Realtime event update received from Supabase!');
    loadSupabaseEventsData();
  });

  // Initial local render + Async Supabase fetch
  renderCalendar();
  renderEventList();
  loadSupabaseEventsData();
}

/* -------------------------------------------------------------------------- */
/* Contact Form & Member Registration Submission to Supabase                */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const alertEl = document.getElementById('contact-alert');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const phone = document.getElementById('contact-phone')?.value || '';
    const interest = document.getElementById('contact-interest')?.value || 'FPV Freestyle';
    const message = document.getElementById('contact-message')?.value || '';

    if (!name || !phone) {
      alert('Mohon lengkapi Nama dan Nomor WhatsApp.');
      return;
    }

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined text-sm animate-spin">sync</span>
        MENGIRIM PESAN...
      `;
    }

    // Submit to Supabase
    const result = await submitSupabaseContact({
      name,
      email,
      phone_wa: phone,
      interest_type: interest,
      message,
      created_at: new Date().toISOString()
    });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }

    if (alertEl) {
      alertEl.classList.remove('hidden');
      alertEl.className = 'p-4 rounded mb-4 font-label-caps text-xs ' + (result.success ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-yellow-500/20 border border-yellow-500 text-yellow-300');
      alertEl.innerHTML = result.success
        ? '✅ Pesan & Pendaftaran berhasil dikirim ke database Skuad! Tim kami akan segera menghubungi Anda.'
        : '⚠️ Pesan tercatat offline. Silakan langsung chat admin via WhatsApp di bawah.';
    }

    // Also offer WhatsApp direct open
    const waText = encodeURIComponent(`Halo Admin Sky Multirotor Squad, saya ${name} (${interest}) ingin bergabung / bertanya: ${message}`);
    const directWaUrl = `https://wa.me/6287772272928?text=${waText}`;

    setTimeout(() => {
      if (confirm('Buka WhatsApp sekarang untuk konfirmasi langsung dengan Admin SMS?')) {
        window.open(directWaUrl, '_blank');
      }
    }, 500);

    contactForm.reset();
  });
}

/* -------------------------------------------------------------------------- */
/* Dynamic Pilots Roster (pages/tentang-kami.html)                             */
/* -------------------------------------------------------------------------- */
async function initDynamicPilots() {
  const container = document.getElementById('pilots-grid-container');
  const countBadge = document.getElementById('pilots-count-badge');
  if (!container) return;

  async function renderPilots() {
    const pilots = await getSupabasePilots();
    if (!pilots || pilots.length === 0) return;

    if (countBadge) {
      countBadge.textContent = `${pilots.length} ACTIVE PILOTS`;
    }

    container.innerHTML = '';
    pilots.forEach(pilot => {
      const card = document.createElement('div');
      card.className = 'bg-surface-container hud-border p-3 sm:p-md flex flex-col items-center text-center group hover:border-primary-container transition-colors relative overflow-hidden rounded shadow-lg';
      card.innerHTML = `
        <div class="w-full h-1 bg-primary-container absolute top-0 left-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <img class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover mb-2 sm:mb-sm border-2 border-primary-container/40 group-hover:border-primary-container group-hover:scale-105 transition-all shadow-md" alt="${pilot.name} - Pilot Sky Multirotor Squad" src="${pilot.photo_url || '/logo.png'}"/>
        <h3 class="font-stats-lg text-base sm:text-lg md:text-xl text-white mb-0.5 sm:mb-xs font-bold">${pilot.name}</h3>
        <span class="bg-surface text-primary-container font-label-caps text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 uppercase mb-1.5 sm:mb-sm rounded border border-surface-variant font-bold leading-tight">${pilot.division}</span>
        <p class="font-label-caps text-on-surface-variant text-[10px] sm:text-xs leading-tight sm:leading-normal">${pilot.interests || 'Pilot Skuad'}</p>
      `;
      container.appendChild(card);
    });
  }

  subscribeToTable('pilots', () => {
    renderPilots();
  });

  renderPilots();
}
