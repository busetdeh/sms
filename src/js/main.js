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
  initDynamicSpots();
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
/* Hero Parallax Effect (Scroll + Mouse 3D Depth)                             */
/* -------------------------------------------------------------------------- */
function initParallax() {
  const parallaxBg = document.getElementById('parallax-bg');
  const heroContent = document.getElementById('hero-parallax-content') || document.querySelector('.hero-slant .relative.z-10');
  if (!parallaxBg) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let scrollY = window.scrollY;

  // Mouse Move 3D Parallax Tracking
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetMouseX = (e.clientX - cx) / cx; // -1 to 1
    targetMouseY = (e.clientY - cy) / cy; // -1 to 1
  }, { passive: true });

  // Scroll Listener
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // Device orientation / Gyro tilt on mobile
  if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        targetMouseX = Math.max(-1, Math.min(1, e.gamma / 30));
        targetMouseY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }
    }, { passive: true });
  }

  function updateHeroParallax() {
    if (scrollY < window.innerHeight * 1.2) {
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Background moves smoothly with scroll + mouse translation
      const bgY = scrollY * 0.35 + mouseY * 15;
      const bgX = mouseX * 15;
      parallaxBg.style.transform = `scale(1.15) translate3d(${bgX.toFixed(2)}px, ${bgY.toFixed(2)}px, 0)`;

      // Foreground content has slight counter-balance depth
      if (heroContent) {
        const contentY = scrollY * 0.08 + mouseY * -6;
        const contentX = mouseX * -6;
        heroContent.style.transform = `translate3d(${contentX.toFixed(2)}px, ${contentY.toFixed(2)}px, 0)`;
      }
    }
    requestAnimationFrame(updateHeroParallax);
  }

  requestAnimationFrame(updateHeroParallax);
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
      id: 'ev-speelwijk',
      date: '2026-10-17',
      end_date: '2026-10-18',
      displayDate: '17 - 18 Oktober 2026',
      badge: '17-18 OKT',
      title: 'Fly Through History - Benteng Speelwijk Drone Fest',
      category: 'KOMPETISI',
      categoryBadge: 'bg-primary-container text-on-primary',
      location: 'Benteng Speelwijk, Banten Lama',
      time: '08:00 - 17:00 WIB (2 Hari)',
      description: 'Kompetisi balap FPV menembus reruntuhan cagar budaya Benteng Speelwijk abad ke-17. Kategori: Racing FPV, Cinematic Heritage & Long Range.',
      slots: 'Slot Pilot Terbuka',
      custom_link: '/sms-fly-through-history'
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
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-indexed
  let selectedDateStr = null; // YYYY-MM-DD format

  function formatSupabaseEvent(dbEvent) {
    const d = new Date(dbEvent.date);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const shortMonth = month.substring(0, 3);
    const isSpecial = dbEvent.category === 'KOMPETISI' || dbEvent.category === 'SPECIAL' || dbEvent.category === 'CHARITY';

    let displayDate = `${day} ${month} ${year}`;
    if (dbEvent.end_date && dbEvent.end_date !== dbEvent.date) {
      const endD = new Date(dbEvent.end_date);
      const endDay = endD.getDate();
      const endMonth = MONTH_NAMES[endD.getMonth()];
      const endYear = endD.getFullYear();
      if (endMonth === month && endYear === year) {
        displayDate = `${day} - ${endDay} ${month} ${year}`;
      } else {
        displayDate = `${day} ${month} - ${endDay} ${endMonth} ${endYear}`;
      }
    }

    return {
      id: dbEvent.id,
      date: dbEvent.date,
      end_date: dbEvent.end_date || null,
      displayDate,
      badge: dbEvent.badge || `${day < 10 ? '0' : ''}${day} ${shortMonth}`,
      title: dbEvent.title,
      category: dbEvent.category || 'GATHERING',
      categoryBadge: isSpecial ? 'bg-primary-container text-on-primary' : 'bg-surface-bright text-white',
      location: dbEvent.location || 'Ecopark Citra Garden BMW, Serang',
      time: dbEvent.time || '08:00 - Selesai WIB',
      description: dbEvent.description || '',
      slots: dbEvent.slots || 'Terbuka Untuk Umum',
      maps_url: dbEvent.maps_url,
      custom_link: dbEvent.custom_link || ''
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
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return EVENTS.filter(ev => {
      const evStart = ev.date;
      const evEnd = ev.end_date || ev.date;
      return evStart <= monthEnd && evEnd >= monthStart;
    });
  }

  function getEventsForDate(dateStr) {
    return EVENTS.filter(ev => {
      const evStart = ev.date;
      const evEnd = ev.end_date || ev.date;
      return dateStr >= evStart && dateStr <= evEnd;
    });
  }

  function getNextUpcomingEvent() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return [...EVENTS]
      .filter(ev => (ev.end_date || ev.date) >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
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
    const actualToday = new Date();
    const isCurrentActualMonth = (actualToday.getFullYear() === currentYear && actualToday.getMonth() === currentMonth);
    const todayDateNum = actualToday.getDate();

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

    const nextEvent = !selectedDateStr ? getNextUpcomingEvent() : null;
    if (nextEvent) {
      const nextCard = document.createElement('div');
      nextCard.className = 'p-4 sm:p-5 rounded-lg border-2 border-primary-container bg-primary-container/10 shadow-[0_0_20px_rgba(255,199,0,0.16)] relative overflow-hidden';
      nextCard.innerHTML = `
        <div class="absolute top-0 right-0 px-3 py-1 bg-primary-container text-on-primary text-[10px] font-label-caps font-bold tracking-widest rounded-bl">NEXT EVENT</div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-0 sm:pr-24">
          <div class="flex-grow">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="${nextEvent.categoryBadge} font-label-caps text-[10px] px-2 py-0.5 font-bold rounded-sm">${nextEvent.badge}</span>
              <span class="text-[10px] font-label-caps text-primary-container border border-primary-container/50 px-2 py-0.5 rounded-sm">${nextEvent.category}</span>
            </div>
            <h3 class="text-white font-bold font-stats-lg text-base sm:text-lg mb-1">${nextEvent.title}</h3>
            <p class="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-2">${nextEvent.displayDate} · ${nextEvent.time}</p>
            <div class="flex items-center gap-1 text-[11px] font-label-caps text-on-surface-variant/80">
              <span class="material-symbols-outlined text-xs text-primary-container">location_on</span>
              <span>${nextEvent.location}</span>
            </div>
          </div>
          <button data-event-id="${nextEvent.id}" class="cal-detail-btn w-full sm:w-auto text-on-primary bg-primary-container border border-primary-container px-4 py-2 font-label-caps text-xs hover:bg-yellow-400 transition-all font-bold slant-btn flex items-center justify-center gap-1">
            DETAIL &amp; RSVP
          </button>
        </div>
      `;
      eventsContainer.appendChild(nextCard);
      displayedEvents = displayedEvents.filter(ev => ev.id !== nextEvent.id);
    }

    if (displayedEvents.length === 0 && !nextEvent) {
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
    const modalCustomLinkBtn = document.getElementById('event-modal-custom-link-btn');

    if (modalCategory) modalCategory.textContent = eventData.category;
    if (modalTitle) modalTitle.textContent = eventData.title;
    if (modalDate) modalDate.textContent = eventData.displayDate;
    if (modalTime) modalTime.textContent = eventData.time;
    if (modalLocation) modalLocation.textContent = eventData.location;
    if (modalDesc) modalDesc.textContent = eventData.description;

    if (modalCustomLinkBtn) {
      if (eventData.custom_link && eventData.custom_link.trim() !== '') {
        modalCustomLinkBtn.classList.remove('hidden');
        modalCustomLinkBtn.href = eventData.custom_link.trim();
        // If external link, open in new tab
        if (eventData.custom_link.startsWith('http')) {
          modalCustomLinkBtn.target = '_blank';
          modalCustomLinkBtn.rel = 'noopener noreferrer';
        } else {
          modalCustomLinkBtn.removeAttribute('target');
          modalCustomLinkBtn.removeAttribute('rel');
        }
      } else {
        modalCustomLinkBtn.classList.add('hidden');
      }
    }

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
      const now = new Date();
      currentYear = now.getFullYear();
      currentMonth = now.getMonth();
      selectedDateStr = null;
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
      
      const igButton = pilot.instagram_handle ? `
        <a href="https://instagram.com/${pilot.instagram_handle.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="mt-2 text-[10px] font-label-caps text-primary-container hover:underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined text-xs">alternate_email</span>${pilot.instagram_handle}
        </a>
      ` : '';

      card.innerHTML = `
        <div class="w-full h-1 bg-primary-container absolute top-0 left-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <img class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover mb-2 sm:mb-sm border-2 border-primary-container/40 group-hover:border-primary-container group-hover:scale-105 transition-all shadow-md" alt="${pilot.name} - Pilot Sky Multirotor Squad" src="${pilot.photo_url || '/logo.png'}"/>
        <h3 class="font-stats-lg text-base sm:text-lg md:text-xl text-white mb-0.5 sm:mb-xs font-bold">${pilot.name}</h3>
        <span class="bg-surface text-primary-container font-label-caps text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 uppercase mb-1.5 sm:mb-sm rounded border border-surface-variant font-bold leading-tight">${pilot.division}</span>
        <p class="font-label-caps text-on-surface-variant text-[10px] sm:text-xs leading-tight sm:leading-normal">${pilot.interests || 'Pilot Skuad'}</p>
        ${igButton}
      `;
      container.appendChild(card);
    });
  }

  subscribeToTable('pilots', () => {
    renderPilots();
  });

  renderPilots();
}

/* -------------------------------------------------------------------------- */
/* Dynamic Spot Terbang (pages/spot-terbang.html)                              */
/* -------------------------------------------------------------------------- */
async function initDynamicSpots() {
  const container = document.getElementById('spots-grid-container');
  if (!container) return;

  async function renderSpots() {
    const spots = await getSupabaseSpots();
    if (!spots || spots.length === 0) return;

    container.innerHTML = '';
    spots.forEach(spot => {
      const card = document.createElement('article');
      card.className = 'group bg-surface-container tech-border flex flex-col overflow-hidden relative rounded shadow-xl';

      const playlistSection = spot.pilots_playlist ? `
        <div class="border-t border-surface-variant pt-3 mb-4 text-xs font-label-caps text-on-surface-variant/80">
          <span class="text-primary-container font-bold">PLAYLIST PILOT / DETAIL:</span> ${spot.pilots_playlist}
        </div>
      ` : '';

      const mapsButton = spot.maps_url ? `
        <a href="${spot.maps_url}" target="_blank" rel="noopener noreferrer" class="p-3 bg-surface-container-high border border-surface-variant hover:border-primary-container text-primary-container rounded flex items-center justify-center" title="Peta Lokasi">
          <span class="material-symbols-outlined text-base">navigation</span>
        </a>
      ` : '';

      card.innerHTML = `
        <div class="relative h-60 overflow-hidden bg-surface-container-high">
          <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100" alt="${spot.name}" src="${spot.photo_url || '/logo.png'}"/>
          <div class="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-2.5 py-1 font-label-caps text-[10px] text-primary-container border border-primary-container slanted-edge z-10 font-bold">
            ${spot.spot_number || 'SPOT'}
          </div>
          <div class="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded font-label-caps text-[10px] text-white">
            ${spot.category || 'TERBANG'}
          </div>
        </div>
        <div class="p-6 flex flex-col flex-grow z-10 bg-surface-container">
          <h3 class="font-headline-lg-mobile text-lg md:text-xl text-white mb-1 uppercase font-bold group-hover:text-primary-container transition-colors">${spot.name}</h3>
          <p class="font-label-caps text-on-surface-variant mb-4 text-xs flex items-center gap-1">
            <span class="material-symbols-outlined text-xs text-primary-container">location_on</span>
            [LOKASI: ${(spot.location_label || '').toUpperCase()}]
          </p>
          <p class="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed flex-grow">
            ${spot.description || '-'}
          </p>

          ${playlistSection}

          <div class="mt-auto flex gap-2">
            <a href="/pages/galeri" class="flex-grow bg-primary-container text-on-primary font-label-caps text-xs py-3 slanted-btn font-bold flex items-center justify-center gap-2 glow-hover">
              <span>Go to Gallery</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
            ${mapsButton}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  subscribeToTable('flying_spots', () => {
    renderSpots();
  });

  renderSpots();
}
