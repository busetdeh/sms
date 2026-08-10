/**
 * Sky Multirotor Squad - Admin Dashboard Engine
 * Handles authentication, tab views, CRUD operations, realtime updates, and interactive modals.
 */

import {
  adminLogin,
  adminLogout,
  getAdminUser,
  onAuthChange,
  getSupabaseEvents,
  createSupabaseEvent,
  updateSupabaseEvent,
  deleteSupabaseEvent,
  getSupabasePilots,
  createSupabasePilot,
  updateSupabasePilot,
  deleteSupabasePilot,
  getSupabaseSpots,
  createSupabaseSpot,
  updateSupabaseSpot,
  deleteSupabaseSpot,
  getSupabaseGallery,
  createSupabaseGalleryItem,
  updateSupabaseGalleryItem,
  deleteSupabaseGalleryItem,
  getSupabaseContacts,
  deleteSupabaseContact,
  uploadSupabaseFile,
  subscribeToTable,
  getSpeelwijkRegistrations,
  saveSpeelwijkRegistration,
  deleteSpeelwijkRegistration,
  getSpeelwijkRundown,
  saveSpeelwijkRundownItem,
  deleteSpeelwijkRundownItem,
  getSpeelwijkSettings,
  saveSpeelwijkSettings
} from './supabase.js';

let currentUser = null;
let currentTab = 'overview';

// 14 Official Pilots extracted from Tentang Kami
export const DEFAULT_OFFICIAL_PILOTS = [
  { name: 'Juang', callsign: 'JUANG', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/juang.webp', instagram_handle: '@juangpratama', display_order: 1 },
  { name: 'Derli', callsign: 'DERLI', division: 'Drone Aerial', interests: 'Minat: Landscape & Cinematic', photo_url: '/pilot/derli.jpeg', instagram_handle: '@derli_fpv', display_order: 2 },
  { name: 'Rijal', callsign: 'RIJAL', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/ijal-1.jpg', instagram_handle: '@rijal_sky', display_order: 3 },
  { name: 'Amarendra', callsign: 'AMARENDRA', division: 'Drone FPV', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/amarendra.jpeg', instagram_handle: '@amarendra_drone', display_order: 4 },
  { name: 'Hadi', callsign: 'HADI', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/hadi-3.jpg', instagram_handle: '@hadi_multirotor', display_order: 5 },
  { name: 'Yani', callsign: 'YANI', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/yani.jpeg', instagram_handle: '@yani_aero', display_order: 6 },
  { name: 'Agus RDT', callsign: 'AGUS_RDT', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/agusrdt-1.jpg', instagram_handle: '@agus_rdt', display_order: 7 },
  { name: 'Djane', callsign: 'DJANE', division: 'Drone FPV', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/djane.jpeg', instagram_handle: '@djane_fpv', display_order: 8 },
  { name: 'Ferry', callsign: 'FERRY', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/ferry.jpeg', instagram_handle: '@ferry_pilot', display_order: 9 },
  { name: 'Rhaka', callsign: 'RHAKA', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/rhaka-1.jpg', instagram_handle: '@rhakaguntur', display_order: 10 },
  { name: 'Jerry', callsign: 'JERRY', division: 'Drone FPV & Aerial', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/jerry-1.jpg', instagram_handle: '@jerry_sky', display_order: 11 },
  { name: 'Arief', callsign: 'ARIEF', division: 'Drone Race', interests: 'Minat: Race & Freestyle', photo_url: '/pilot/ARIEF-1.jpeg', instagram_handle: '@arief_racing', display_order: 12 },
  { name: 'Hanif', callsign: 'HANIF', division: 'Drone FPV', interests: 'Minat: Cinematic & Freestyle', photo_url: '/pilot/hanif-1.jpg', instagram_handle: '@hanif_fpv', display_order: 13 },
  { name: 'Taufik', callsign: 'TAUFIK', division: 'Aeromodeling & Drone FPV', interests: 'Minat: Freestyle', photo_url: '/pilot/taufik-.jpg', instagram_handle: '@taufik_aero', display_order: 14 }
];

// Cached Data
let cachedEvents = [];
let cachedPilots = [];
let cachedSpots = [];
let cachedGallery = [];
let cachedContacts = [];
let cachedSpeelwijkRegs = [];
let cachedSpeelwijkRundown = [];
let cachedSpeelwijkSettings = {};

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initTabNavigation();
  initSpeelwijkSubtabs();
  initModalListeners();
  initFormSubmissions();
  initPilotSync();
  setupRealtimeListeners();
});

/* -------------------------------------------------------------------------- */
/* TOAST NOTIFICATION SYSTEM                                                  */
/* -------------------------------------------------------------------------- */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let bgClass = 'bg-surface-container-high border-primary-container text-primary-container';
  let icon = 'check_circle';

  if (type === 'error') {
    bgClass = 'bg-red-950/90 border-red-500 text-red-200';
    icon = 'error';
  } else if (type === 'info') {
    bgClass = 'bg-surface-container-high border-blue-400 text-blue-300';
    icon = 'info';
  }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded border shadow-2xl font-label-caps text-xs backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-lg">${icon}</span>
    <span class="flex-grow">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION & VIEW GUARD                                                */
/* -------------------------------------------------------------------------- */
function initAdminAuth() {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const adminEmailLabel = document.getElementById('admin-user-email');

  // Check current session
  async function checkAuth() {
    currentUser = await getAdminUser();
    if (currentUser) {
      if (loginView) loginView.classList.add('hidden');
      if (dashboardView) dashboardView.classList.remove('hidden');
      if (adminEmailLabel) adminEmailLabel.textContent = currentUser.email;
      loadAllDashboardData();
    } else {
      if (loginView) loginView.classList.remove('hidden');
      if (dashboardView) dashboardView.classList.add('hidden');
    }
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Email dan password wajib diisi.', 'error');
        return;
      }

      const origText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> AUTENTIKASI...';

      const res = await adminLogin(email, password);
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;

      if (res.success) {
        showToast('Login berhasil! Selamat datang Admin SMS.', 'success');
        checkAuth();
      } else {
        showToast(res.error, 'error');
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await adminLogout();
      showToast('Berhasil logout dari sistem.', 'info');
      checkAuth();
    });
  }

  onAuthChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      checkAuth();
    }
  });

  checkAuth();
}

/* -------------------------------------------------------------------------- */
/* TAB NAVIGATION                                                             */
/* -------------------------------------------------------------------------- */
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabSections = document.querySelectorAll('.admin-tab-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      currentTab = tabTarget;

      // Update button styles
      tabButtons.forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold');
        b.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high');
      });
      btn.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high');
      btn.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');

      // Switch views
      tabSections.forEach(section => {
        if (section.id === `section-${tabTarget}`) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });

      // Update page title header
      const pageTitleEl = document.getElementById('admin-page-title');
      if (pageTitleEl) {
        const titles = {
          overview: 'Dashboard Overview & Statistik',
          events: 'Manajemen Jadwal Acara (Events)',
          pilots: 'Manajemen Pilot Skuad (Pilots)',
          spots: 'Manajemen Spot Terbang Banten',
          gallery: 'Manajemen Galeri & Log Misi',
          inbox: 'Kotak Masuk Pesan & Pendaftaran',
          speelwijk: 'Manajemen Event Benteng Speelwijk Drone Fest 2026'
        };
        pageTitleEl.textContent = titles[tabTarget] || 'Dashboard Admin';
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* SPEELWIJK SUBTAB NAVIGATION                                                */
/* -------------------------------------------------------------------------- */
function initSpeelwijkSubtabs() {
  const subtabBtns = [
    { btn: document.getElementById('subtab-btn-speelwijk-regs'), view: document.getElementById('speelwijk-subview-regs') },
    { btn: document.getElementById('subtab-btn-speelwijk-rundown'), view: document.getElementById('speelwijk-subview-rundown') },
    { btn: document.getElementById('subtab-btn-speelwijk-settings'), view: document.getElementById('speelwijk-subview-settings') }
  ];

  subtabBtns.forEach(({ btn, view }) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Reset all buttons
      subtabBtns.forEach(item => {
        if (!item.btn || !item.view) return;
        item.btn.classList.remove('font-bold', 'border-b-2', 'border-primary-container', 'text-primary-container');
        item.btn.classList.add('text-on-surface-variant', 'border-transparent');
        item.view.classList.add('hidden');
      });

      // Activate clicked
      btn.classList.remove('text-on-surface-variant', 'border-transparent');
      btn.classList.add('font-bold', 'border-b-2', 'border-primary-container', 'text-primary-container');
      if (view) view.classList.remove('hidden');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* DATA LOADERS & RENDERERS                                                   */
/* -------------------------------------------------------------------------- */
async function loadAllDashboardData() {
  await Promise.all([
    loadEvents(),
    loadPilots(),
    loadSpots(),
    loadGallery(),
    loadContacts(),
    loadSpeelwijkData()
  ]);
  updateOverviewStats();
}

function updateOverviewStats() {
  const statEvents = document.getElementById('stat-events-count');
  const statPilots = document.getElementById('stat-pilots-count');
  const statSpots = document.getElementById('stat-spots-count');
  const statGallery = document.getElementById('stat-gallery-count');
  const statInbox = document.getElementById('stat-inbox-count');
  const statSpeelwijk = document.getElementById('stat-speelwijk-count');

  if (statEvents) statEvents.textContent = cachedEvents.length;
  if (statPilots) statPilots.textContent = cachedPilots.length;
  if (statSpots) statSpots.textContent = cachedSpots.length;
  if (statGallery) statGallery.textContent = cachedGallery.length;
  if (statInbox) statInbox.textContent = cachedContacts.length;
  if (statSpeelwijk) statSpeelwijk.textContent = cachedSpeelwijkRegs.length;
}

// 1. Events
async function loadEvents() {
  const tableBody = document.getElementById('admin-events-tbody');
  cachedEvents = (await getSupabaseEvents()) || [];

  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (cachedEvents.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">Belum ada data acara di database. Klik "+ Tambah Acara" di atas.</td></tr>`;
    return;
  }

  cachedEvents.forEach(ev => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';
    const dateDisplay = ev.end_date && ev.end_date !== ev.date 
      ? `<div class="font-bold text-primary-container font-stats-lg text-xs leading-tight">${ev.date}</div><div class="text-[10px] text-on-surface-variant font-label-caps">s/d ${ev.end_date}</div>` 
      : `<div class="font-bold text-primary-container font-stats-lg">${ev.date}</div>`;

    tr.innerHTML = `
      <td class="p-3.5">${dateDisplay}</td>
      <td class="p-3.5">
        <div class="font-bold text-white text-sm">${ev.title}</div>
        <div class="text-[11px] text-on-surface-variant font-label-caps">${ev.location}</div>
        ${ev.custom_link ? `<a href="${ev.custom_link}" target="_blank" class="inline-flex items-center gap-0.5 text-[10px] text-primary-container hover:underline mt-0.5"><span class="material-symbols-outlined text-xs">link</span> ${ev.custom_link}</a>` : ''}
      </td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-primary-container border border-primary-container/40">${ev.category}</span></td>
      <td class="p-3.5 text-on-surface-variant">${ev.time}</td>
      <td class="p-3.5 font-label-caps text-[11px] text-on-surface-variant">${ev.slots}</td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <button data-id="${ev.id}" class="btn-edit-event p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit"><span class="material-symbols-outlined text-base">edit</span></button>
        <button data-id="${ev.id}" class="btn-delete-event p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Attach actions
  tableBody.querySelectorAll('.btn-edit-event').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedEvents.find(e => e.id === id);
      if (item) openEventModal(item);
    });
  });

  tableBody.querySelectorAll('.btn-delete-event').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus agenda acara ini?')) {
        const res = await deleteSupabaseEvent(id);
        if (res.success) {
          showToast('Acara berhasil dihapus.', 'success');
          loadEvents();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

// 2. Pilots
async function loadPilots() {
  const tableBody = document.getElementById('admin-pilots-tbody');
  cachedPilots = (await getSupabasePilots()) || [];

  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (cachedPilots.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">Belum ada pilot terdaftar. Klik "+ Tambah Pilot".</td></tr>`;
    return;
  }

  cachedPilots.forEach(pilot => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';
    tr.innerHTML = `
      <td class="p-3.5 flex items-center gap-3">
        <img src="${pilot.photo_url || '/logo.png'}" alt="${pilot.name}" class="w-10 h-10 rounded-full object-cover border border-primary-container/40"/>
        <div>
          <div class="font-bold text-white text-sm">${pilot.name}</div>
          <div class="text-[11px] text-primary-container font-label-caps">${pilot.callsign ? `CALLSIGN: ${pilot.callsign}` : ''}</div>
        </div>
      </td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-white border border-surface-variant">${pilot.division}</span></td>
      <td class="p-3.5 text-on-surface-variant font-body-md">${pilot.interests || '-'}</td>
      <td class="p-3.5 font-label-caps text-primary-container">${pilot.instagram_handle || '-'}</td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <button data-id="${pilot.id}" class="btn-edit-pilot p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit"><span class="material-symbols-outlined text-base">edit</span></button>
        <button data-id="${pilot.id}" class="btn-delete-pilot p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.btn-edit-pilot').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedPilots.find(p => p.id === id);
      if (item) openPilotModal(item);
    });
  });

  tableBody.querySelectorAll('.btn-delete-pilot').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus pilot ini dari skuad?')) {
        const res = await deleteSupabasePilot(id);
        if (res.success) {
          showToast('Pilot berhasil dihapus.', 'success');
          loadPilots();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

// 3. Spots
async function loadSpots() {
  const tableBody = document.getElementById('admin-spots-tbody');
  cachedSpots = (await getSupabaseSpots()) || [];

  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (cachedSpots.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">Belum ada spot terbang. Klik "+ Tambah Spot".</td></tr>`;
    return;
  }

  cachedSpots.forEach(spot => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';
    tr.innerHTML = `
      <td class="p-3.5 font-bold font-label-caps text-primary-container">${spot.spot_number || '-'}</td>
      <td class="p-3.5">
        <div class="font-bold text-white text-sm">${spot.name}</div>
        <div class="text-[11px] text-on-surface-variant font-label-caps">${spot.location_label}</div>
      </td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-primary-container border border-primary-container/40">${spot.category}</span></td>
      <td class="p-3.5 text-on-surface-variant line-clamp-1 max-w-xs">${spot.description || '-'}</td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <button data-id="${spot.id}" class="btn-edit-spot p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit"><span class="material-symbols-outlined text-base">edit</span></button>
        <button data-id="${spot.id}" class="btn-delete-spot p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.btn-edit-spot').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedSpots.find(s => s.id === id);
      if (item) openSpotModal(item);
    });
  });

  tableBody.querySelectorAll('.btn-delete-spot').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus spot terbang ini?')) {
        const res = await deleteSupabaseSpot(id);
        if (res.success) {
          showToast('Spot terbang dihapus.', 'success');
          loadSpots();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

// 4. Gallery
async function loadGallery() {
  const tableBody = document.getElementById('admin-gallery-tbody');
  cachedGallery = (await getSupabaseGallery()) || [];

  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (cachedGallery.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">Belum ada arsip galeri. Klik "+ Tambah Galeri".</td></tr>`;
    return;
  }

  cachedGallery.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';
    tr.innerHTML = `
      <td class="p-3.5 flex items-center gap-3">
        <img src="${item.photo_url || '/logo.png'}" alt="${item.title}" class="w-12 h-9 rounded object-cover border border-surface-variant"/>
        <div>
          <div class="font-bold text-white text-sm">${item.title}</div>
          <div class="text-[11px] text-primary-container font-label-caps">${item.mission_code || ''}</div>
        </div>
      </td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-white border border-surface-variant">${item.category}</span></td>
      <td class="p-3.5 text-on-surface-variant">${item.location}</td>
      <td class="p-3.5 font-label-caps text-[11px] text-on-surface-variant">${item.date_label || '-'}</td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <button data-id="${item.id}" class="btn-edit-gallery p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit"><span class="material-symbols-outlined text-base">edit</span></button>
        <button data-id="${item.id}" class="btn-delete-gallery p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.btn-edit-gallery').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedGallery.find(g => g.id === id);
      if (item) openGalleryModal(item);
    });
  });

  tableBody.querySelectorAll('.btn-delete-gallery').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus item galeri ini?')) {
        const res = await deleteSupabaseGalleryItem(id);
        if (res.success) {
          showToast('Galeri dihapus.', 'success');
          loadGallery();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

// 5. Contacts / Inbox
async function loadContacts() {
  const container = document.getElementById('admin-inbox-container');
  cachedContacts = (await getSupabaseContacts()) || [];

  if (!container) return;
  container.innerHTML = '';

  if (cachedContacts.length === 0) {
    container.innerHTML = `<div class="p-8 text-center bg-surface-container rounded border border-surface-variant text-on-surface-variant font-label-caps text-xs">Belum ada transmisi pesan atau pendaftaran member baru di database.</div>`;
    return;
  }

  cachedContacts.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'p-5 bg-surface-container border border-surface-variant rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-container/50 transition-colors shadow-md';
    
    const d = new Date(msg.created_at || Date.now());
    const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    const cleanPhone = (msg.phone_wa || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
    const waReplyUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo ${msg.name}, terima kasih telah menghubungi Sky Multirotor Squad terkait "${msg.interest_type}".`)}`;

    card.innerHTML = `
      <div class="flex-grow">
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="font-stats-lg text-lg font-bold text-white">${msg.name}</span>
          <span class="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-label-caps text-[10px] font-bold border border-primary-container/40">${msg.interest_type || 'UMUM'}</span>
          <span class="text-[11px] text-on-surface-variant/70 font-label-caps ml-auto md:ml-0">${dateFormatted}</span>
        </div>
        <div class="text-xs text-on-surface-variant mb-2">
          📱 <strong>WA:</strong> ${msg.phone_wa} ${msg.email ? `| ✉️ <strong>Email:</strong> ${msg.email}` : ''}
        </div>
        <p class="text-sm text-on-surface font-body-md bg-surface-container-high p-3 rounded border border-surface-variant/60 leading-relaxed">
          "${msg.message || 'Tidak ada pesan tambahan.'}"
        </p>
      </div>

      <div class="flex md:flex-col gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-variant">
        <a href="${waReplyUrl}" target="_blank" rel="noopener noreferrer" class="w-full bg-[#25D366] text-black font-label-caps text-xs px-4 py-2 font-bold rounded flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
          <span class="material-symbols-outlined text-base">chat</span> BALAS WA
        </a>
        <button data-id="${msg.id}" class="btn-delete-contact w-full text-red-400 border border-red-500/30 hover:bg-red-950/40 font-label-caps text-xs px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-sm">delete</span> HAPUS
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll('.btn-delete-contact').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus pesan ini dari inbox?')) {
        const res = await deleteSupabaseContact(id);
        if (res.success) {
          showToast('Pesan berhasil dihapus.', 'success');
          loadContacts();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

// 6. Benteng Speelwijk Event Module (Registrations, Rundown, Settings)
async function loadSpeelwijkData() {
  await Promise.all([
    loadSpeelwijkRegistrations(),
    loadSpeelwijkRundown(),
    loadSpeelwijkSettings()
  ]);
}

async function loadSpeelwijkRegistrations() {
  const tbody = document.getElementById('admin-speelwijk-regs-tbody');
  const countBadge = document.getElementById('speelwijk-regs-count-badge');
  const statCard = document.getElementById('stat-speelwijk-count');
  
  cachedSpeelwijkRegs = (await getSpeelwijkRegistrations()) || [];

  if (countBadge) countBadge.textContent = cachedSpeelwijkRegs.length;
  if (statCard) statCard.textContent = cachedSpeelwijkRegs.length;

  if (!tbody) return;
  renderSpeelwijkRegistrations();

  // Search and filter listeners
  const searchInput = document.getElementById('speelwijk-search-input');
  const filterSelect = document.getElementById('speelwijk-filter-status');

  if (searchInput && !searchInput.dataset.hasListener) {
    searchInput.dataset.hasListener = 'true';
    searchInput.addEventListener('input', () => renderSpeelwijkRegistrations());
  }
  if (filterSelect && !filterSelect.dataset.hasListener) {
    filterSelect.dataset.hasListener = 'true';
    filterSelect.addEventListener('change', () => renderSpeelwijkRegistrations());
  }
}

function renderSpeelwijkRegistrations() {
  const tbody = document.getElementById('admin-speelwijk-regs-tbody');
  if (!tbody) return;

  const searchInput = document.getElementById('speelwijk-search-input');
  const filterSelect = document.getElementById('speelwijk-filter-status');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filterStatus = filterSelect ? filterSelect.value : 'ALL';

  const filtered = cachedSpeelwijkRegs.filter(reg => {
    const matchesSearch = !query || 
      (reg.name && reg.name.toLowerCase().includes(query)) ||
      (reg.callsign && reg.callsign.toLowerCase().includes(query)) ||
      (reg.phone && reg.phone.includes(query)) ||
      (reg.category && reg.category.toLowerCase().includes(query));

    const matchesStatus = filterStatus === 'ALL' || (reg.status && reg.status.toUpperCase() === filterStatus);

    return matchesSearch && matchesStatus;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-on-surface-variant font-label-caps text-xs">Tidak ada data pendaftar pilot yang cocok dengan filter.</td></tr>`;
    return;
  }

  filtered.forEach(reg => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';

    const cleanPhone = (reg.phone || '').replace(/\D/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo Pilot ${reg.name} (${reg.callsign || 'Speelwijk Drone Fest'}), panitia Sky Multirotor Squad mengonfirmasi status slot Anda: ${reg.status}.`)}`;

    let statusBadge = '<span class="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-label-caps text-[10px] font-bold border border-yellow-500/40">PENDING</span>';
    if (reg.status === 'LUNAS') {
      statusBadge = '<span class="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-label-caps text-[10px] font-bold border border-green-500/40">LUNAS / VERIFIED</span>';
    } else if (reg.status === 'BATAL') {
      statusBadge = '<span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-label-caps text-[10px] font-bold border border-red-500/40">DIBATALKAN</span>';
    }

    tr.innerHTML = `
      <td class="p-3.5">
        <div class="font-bold text-white text-sm">${reg.name}</div>
        <div class="text-[11px] text-primary-container font-mono-data uppercase font-bold">${reg.callsign || '-'}</div>
      </td>
      <td class="p-3.5">
        <div class="text-white font-mono-data text-xs">${reg.phone || '-'}</div>
        <div class="text-[10px] text-on-surface-variant">${reg.email || '-'}</div>
      </td>
      <td class="p-3.5">
        <span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-white border border-surface-variant">${reg.category || 'FPV'}</span>
      </td>
      <td class="p-3.5 font-label-caps text-xs text-on-surface-variant">
        ${reg.paymentMethod || 'QRIS'}
      </td>
      <td class="p-3.5">
        ${statusBadge}
      </td>
      <td class="p-3.5 text-right whitespace-nowrap">
        <a href="${waUrl}" target="_blank" class="inline-flex p-1.5 text-green-400 hover:bg-green-950/40 rounded mr-1" title="Kirim Pesan WhatsApp"><span class="material-symbols-outlined text-base">chat</span></a>
        <button data-id="${reg.id}" class="btn-edit-speelwijk-reg p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit Pendaftar"><span class="material-symbols-outlined text-base">edit</span></button>
        <button data-id="${reg.id}" class="btn-delete-speelwijk-reg p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-speelwijk-reg').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedSpeelwijkRegs.find(r => r.id === id);
      if (item) openSpeelwijkRegModal(item);
    });
  });

  tbody.querySelectorAll('.btn-delete-speelwijk-reg').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus pendaftar pilot Speelwijk ini?')) {
        const res = await deleteSpeelwijkRegistration(id);
        if (res.success) {
          showToast('Data pendaftar berhasil dihapus.', 'success');
          loadSpeelwijkRegistrations();
        } else {
          showToast(res.error, 'error');
        }
      }
    });
  });
}

function loadSpeelwijkRundown() {
  cachedSpeelwijkRundown = getSpeelwijkRundown();
  const day1Container = document.getElementById('speelwijk-rundown-day1-container');
  const day2Container = document.getElementById('speelwijk-rundown-day2-container');

  if (day1Container) day1Container.innerHTML = '';
  if (day2Container) day2Container.innerHTML = '';

  const day1Items = cachedSpeelwijkRundown.filter(item => String(item.day) === '1');
  const day2Items = cachedSpeelwijkRundown.filter(item => String(item.day) === '2');

  const renderList = (items, container, emptyText) => {
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-on-surface-variant font-label-caps text-xs">${emptyText}</div>`;
      return;
    }
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-3 bg-surface-container-high/60 border border-surface-variant rounded flex items-start justify-between gap-3 hover:border-primary-container/40 transition-colors';
      card.innerHTML = `
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-mono-data text-[11px] font-bold border border-primary-container/40">${item.time}</span>
            <span class="font-bold text-white text-xs font-label-caps">${item.title}</span>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">${item.desc || '-'}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-id="${item.id}" class="btn-edit-speelwijk-session p-1 text-primary-container hover:bg-surface-container rounded" title="Edit Sesi"><span class="material-symbols-outlined text-sm">edit</span></button>
          <button data-id="${item.id}" class="btn-delete-speelwijk-session p-1 text-red-400 hover:bg-red-950/40 rounded" title="Hapus Sesi"><span class="material-symbols-outlined text-sm">delete</span></button>
        </div>
      `;
      container.appendChild(card);
    });
  };

  renderList(day1Items, day1Container, 'Belum ada sesi Day 1.');
  renderList(day2Items, day2Container, 'Belum ada sesi Day 2.');

  document.querySelectorAll('.btn-edit-speelwijk-session').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = cachedSpeelwijkRundown.find(r => r.id === id);
      if (item) openSpeelwijkSessionModal(item);
    });
  });

  document.querySelectorAll('.btn-delete-speelwijk-session').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus sesi rundown ini?')) {
        deleteSpeelwijkRundownItem(id);
        showToast('Sesi rundown dihapus.', 'success');
        loadSpeelwijkRundown();
      }
    });
  });
}

function loadSpeelwijkSettings() {
  cachedSpeelwijkSettings = getSpeelwijkSettings();
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('setting-speelwijk-title', cachedSpeelwijkSettings.title);
  setVal('setting-speelwijk-subtitle', cachedSpeelwijkSettings.subtitle);
  setVal('setting-speelwijk-date', cachedSpeelwijkSettings.date);
  setVal('setting-speelwijk-fee', cachedSpeelwijkSettings.fee);
  setVal('setting-speelwijk-wa', cachedSpeelwijkSettings.waNumber);
  setVal('setting-speelwijk-loc', cachedSpeelwijkSettings.location);
  setVal('setting-speelwijk-coords', cachedSpeelwijkSettings.coords);
  setVal('setting-speelwijk-desc', cachedSpeelwijkSettings.desc);
}

/* -------------------------------------------------------------------------- */
/* MODAL EDIT / CREATE HANDLERS                                               */
/* -------------------------------------------------------------------------- */
function initModalListeners() {
  document.getElementById('btn-add-event')?.addEventListener('click', () => openEventModal());
  document.getElementById('btn-add-pilot')?.addEventListener('click', () => openPilotModal());
  document.getElementById('btn-add-spot')?.addEventListener('click', () => openSpotModal());
  document.getElementById('btn-add-gallery')?.addEventListener('click', () => openGalleryModal());
  document.getElementById('btn-add-speelwijk-reg')?.addEventListener('click', () => openSpeelwijkRegModal());
  document.getElementById('btn-add-speelwijk-session')?.addEventListener('click', () => openSpeelwijkSessionModal());

  initPilotPhotoUploadListeners();
}

// Event Modal
function openEventModal(eventData = null) {
  const modal = document.getElementById('admin-event-modal');
  const form = document.getElementById('form-event');
  if (!modal || !form) return;

  document.getElementById('event-form-id').value = eventData ? eventData.id : '';
  document.getElementById('event-input-title').value = eventData ? eventData.title : '';
  document.getElementById('event-input-date').value = eventData ? eventData.date : '';
  document.getElementById('event-input-end-date').value = eventData ? (eventData.end_date || '') : '';
  document.getElementById('event-input-time').value = eventData ? eventData.time : '08:00 - 17:00 WIB';
  document.getElementById('event-input-location').value = eventData ? eventData.location : 'Ecopark Citra Garden BMW, Serang';
  document.getElementById('event-input-category').value = eventData ? eventData.category : 'GATHERING';
  document.getElementById('event-input-badge').value = eventData ? eventData.badge : '';
  document.getElementById('event-input-slots').value = eventData ? eventData.slots : 'Terbuka Untuk Umum';
  document.getElementById('event-input-maps').value = eventData ? (eventData.maps_url || '') : '';
  document.getElementById('event-input-link').value = eventData ? (eventData.custom_link || '') : '';
  document.getElementById('event-input-desc').value = eventData ? eventData.description : '';

  document.getElementById('event-modal-heading').textContent = eventData ? 'EDIT JADWAL ACARA' : 'TAMBAH ACARA BARU';
  modal.classList.add('active');
}

// Pilot Modal
function openPilotModal(pilotData = null) {
  const modal = document.getElementById('admin-pilot-modal');
  const form = document.getElementById('form-pilot');
  if (!modal || !form) return;

  const photoInput = document.getElementById('pilot-input-photo');
  const photoPreview = document.getElementById('pilot-photo-preview');
  const fileInput = document.getElementById('pilot-file-input');
  const uploadStatus = document.getElementById('pilot-upload-status');

  document.getElementById('pilot-form-id').value = pilotData ? pilotData.id : '';
  document.getElementById('pilot-input-name').value = pilotData ? pilotData.name : '';
  document.getElementById('pilot-input-callsign').value = pilotData ? (pilotData.callsign || '') : '';
  document.getElementById('pilot-input-division').value = pilotData ? pilotData.division : 'FPV PILOT';
  document.getElementById('pilot-input-interests').value = pilotData ? (pilotData.interests || '') : '';
  
  const photoUrl = pilotData ? (pilotData.photo_url || '') : '';
  if (photoInput) photoInput.value = photoUrl;
  if (photoPreview) {
    photoPreview.src = photoUrl || '/logo.png';
    photoPreview.onerror = () => { photoPreview.src = '/logo.png'; };
  }
  if (fileInput) fileInput.value = '';
  if (uploadStatus) uploadStatus.classList.add('hidden');

  document.getElementById('pilot-input-ig').value = pilotData ? (pilotData.instagram_handle || '') : '';
  document.getElementById('pilot-input-order').value = pilotData ? (pilotData.display_order || 0) : 0;

  document.getElementById('pilot-modal-heading').textContent = pilotData ? 'EDIT PILOT SKUAD' : 'TAMBAH PILOT BARU';
  modal.classList.add('active');
}

/* -------------------------------------------------------------------------- */
/* PILOT PHOTO UPLOAD & DRAG-AND-DROP CONTROLLER                              */
/* -------------------------------------------------------------------------- */
function initPilotPhotoUploadListeners() {
  const fileInput = document.getElementById('pilot-file-input');
  const dropzone = document.getElementById('pilot-dropzone');
  const photoInput = document.getElementById('pilot-input-photo');
  const photoPreview = document.getElementById('pilot-photo-preview');
  const uploadStatus = document.getElementById('pilot-upload-status');

  if (!fileInput || !dropzone) return;

  // 1. Text input live preview sync
  if (photoInput && photoPreview) {
    const updatePreviewFromInput = () => {
      const val = photoInput.value.trim();
      photoPreview.src = val || '/logo.png';
      photoPreview.onerror = () => { photoPreview.src = '/logo.png'; };
    };
    photoInput.addEventListener('input', updatePreviewFromInput);
    photoInput.addEventListener('change', updatePreviewFromInput);
  }

  // 2. File Upload Handler
  async function handleFileSelected(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, WEBP, dll).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5 MB.', 'error');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (photoPreview) photoPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Show upload progress
    if (uploadStatus) uploadStatus.classList.remove('hidden');

    try {
      // Attempt upload to Supabase Storage 'pilots' bucket
      const uploadResult = await uploadSupabaseFile('pilots', file, 'profiles');

      if (uploadResult.success && uploadResult.publicUrl) {
        if (photoInput) photoInput.value = uploadResult.publicUrl;
        if (photoPreview) photoPreview.src = uploadResult.publicUrl;
        showToast('Foto profil pilot berhasil diunggah ke storage!', 'success');
      } else {
        // Graceful Fallback: Convert to Base64 data string if bucket is not yet configured
        const base64Data = await fileToBase64(file);
        if (photoInput) photoInput.value = base64Data;
        showToast('Foto berhasil dimuat dan siap disimpan ke profil pilot.', 'info');
      }
    } catch (err) {
      console.warn('Upload error fallback to base64:', err);
      const base64Data = await fileToBase64(file);
      if (photoInput) photoInput.value = base64Data;
      showToast('Foto berhasil dimuat.', 'info');
    } finally {
      if (uploadStatus) uploadStatus.classList.add('hidden');
    }
  }

  // Helper for Base64 conversion
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Drag and Drop support
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-primary-container', 'bg-surface-container-high');
  });

  ['dragleave', 'dragend'].forEach(type => {
    dropzone.addEventListener(type, () => {
      dropzone.classList.remove('border-primary-container', 'bg-surface-container-high');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-primary-container', 'bg-surface-container-high');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });
}

// Spot Modal
function openSpotModal(spotData = null) {
  const modal = document.getElementById('admin-spot-modal');
  const form = document.getElementById('form-spot');
  if (!modal || !form) return;

  document.getElementById('spot-form-id').value = spotData ? spotData.id : '';
  document.getElementById('spot-input-number').value = spotData ? spotData.spot_number : 'SPOT #01';
  document.getElementById('spot-input-name').value = spotData ? spotData.name : '';
  document.getElementById('spot-input-location').value = spotData ? spotData.location_label : '';
  document.getElementById('spot-input-category').value = spotData ? spotData.category : 'BALAP_FPV';
  document.getElementById('spot-input-photo').value = spotData ? spotData.photo_url : '';
  document.getElementById('spot-input-maps').value = spotData ? spotData.maps_url : '';
  document.getElementById('spot-input-playlist').value = spotData ? (spotData.pilots_playlist || '') : '';
  document.getElementById('spot-input-desc').value = spotData ? spotData.description : '';

  document.getElementById('spot-modal-heading').textContent = spotData ? 'EDIT SPOT TERBANG' : 'TAMBAH SPOT BARU';
  modal.classList.add('active');
}

// Gallery Modal
function openGalleryModal(galleryData = null) {
  const modal = document.getElementById('admin-gallery-modal');
  const form = document.getElementById('form-gallery');
  if (!modal || !form) return;

  document.getElementById('gallery-form-id').value = galleryData ? galleryData.id : '';
  document.getElementById('gallery-input-code').value = galleryData ? galleryData.mission_code : 'OP_001';
  document.getElementById('gallery-input-title').value = galleryData ? galleryData.title : '';
  document.getElementById('gallery-input-location').value = galleryData ? galleryData.location : '';
  document.getElementById('gallery-input-category').value = galleryData ? galleryData.category : 'FPV Freestyle';
  document.getElementById('gallery-input-date').value = galleryData ? (galleryData.date_label || '') : '';
  document.getElementById('gallery-input-photo').value = galleryData ? galleryData.photo_url : '';
  document.getElementById('gallery-input-desc').value = galleryData ? galleryData.description : '';

  document.getElementById('gallery-modal-heading').textContent = galleryData ? 'EDIT LOG GALERI' : 'TAMBAH LOG GALERI';
  modal.classList.add('active');
}

// Speelwijk Registrant Modal
function openSpeelwijkRegModal(regData = null) {
  const modal = document.getElementById('admin-speelwijk-reg-modal');
  const form = document.getElementById('form-speelwijk-reg');
  if (!modal || !form) return;

  document.getElementById('speelwijk-reg-form-id').value = regData ? regData.id : '';
  document.getElementById('speelwijk-reg-input-name').value = regData ? regData.name : '';
  document.getElementById('speelwijk-reg-input-community').value = regData ? (regData.callsign || '') : '';
  document.getElementById('speelwijk-reg-input-phone').value = regData ? (regData.phone || '') : '';
  document.getElementById('speelwijk-reg-input-email').value = regData ? (regData.email || '') : '';
  document.getElementById('speelwijk-reg-input-category').value = regData ? regData.category : 'Cinematic & Freestyle FPV';
  document.getElementById('speelwijk-reg-input-payment').value = regData ? (regData.paymentMethod || 'QRIS') : 'QRIS';
  document.getElementById('speelwijk-reg-input-status').value = regData ? (regData.status || 'PENDING') : 'PENDING';
  document.getElementById('speelwijk-reg-input-notes').value = regData ? (regData.notes || '') : '';

  document.getElementById('speelwijk-reg-modal-heading').textContent = regData ? 'EDIT PENDAFTAR PILOT SPEELWIJK' : 'TAMBAH PENDAFTAR PILOT MANUAL';
  modal.classList.add('active');
}

// Speelwijk Rundown Session Modal
function openSpeelwijkSessionModal(sessionData = null) {
  const modal = document.getElementById('admin-speelwijk-session-modal');
  const form = document.getElementById('form-speelwijk-session');
  if (!modal || !form) return;

  document.getElementById('speelwijk-session-form-id').value = sessionData ? sessionData.id : '';
  document.getElementById('speelwijk-session-input-day').value = sessionData ? String(sessionData.day) : '1';
  document.getElementById('speelwijk-session-input-time').value = sessionData ? sessionData.time : '08:00 WIB';
  document.getElementById('speelwijk-session-input-title').value = sessionData ? sessionData.title : '';
  document.getElementById('speelwijk-session-input-desc').value = sessionData ? (sessionData.desc || '') : '';

  document.getElementById('speelwijk-session-modal-heading').textContent = sessionData ? 'EDIT SESI RUNDOWN' : 'TAMBAH SESI RUNDOWN';
  modal.classList.add('active');
}

/* -------------------------------------------------------------------------- */
/* FORM SUBMISSIONS (SAVE TO SUPABASE)                                        */
/* -------------------------------------------------------------------------- */
function initFormSubmissions() {
  // 1. Event Form
  document.getElementById('form-event')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('event-form-id').value;
    const title = document.getElementById('event-input-title').value.trim();
    const date = document.getElementById('event-input-date').value;
    const end_date = document.getElementById('event-input-end-date').value || null;
    const time = document.getElementById('event-input-time').value.trim();
    const location = document.getElementById('event-input-location').value.trim();
    const category = document.getElementById('event-input-category').value;
    const badge = document.getElementById('event-input-badge').value.trim();
    const slots = document.getElementById('event-input-slots').value.trim();
    const maps_url = document.getElementById('event-input-maps').value.trim();
    const custom_link = document.getElementById('event-input-link').value.trim();
    const description = document.getElementById('event-input-desc').value.trim();

    const payload = { title, date, end_date, time, location, category, badge, slots, maps_url, custom_link, description };

    let res;
    if (id) {
      res = await updateSupabaseEvent(id, payload);
    } else {
      res = await createSupabaseEvent(payload);
    }

    if (res.success) {
      showToast(id ? 'Acara berhasil diperbarui!' : 'Acara baru berhasil disimpan ke database!', 'success');
      document.getElementById('admin-event-modal')?.classList.remove('active');
      loadEvents();
    } else {
      showToast(res.error, 'error');
    }
  });

  // 2. Pilot Form
  document.getElementById('form-pilot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pilot-form-id').value;
    const name = document.getElementById('pilot-input-name').value.trim();
    const callsign = document.getElementById('pilot-input-callsign').value.trim();
    const division = document.getElementById('pilot-input-division').value.trim();
    const interests = document.getElementById('pilot-input-interests').value.trim();
    const photo_url = document.getElementById('pilot-input-photo').value.trim();
    const instagram_handle = document.getElementById('pilot-input-ig').value.trim();
    const display_order = parseInt(document.getElementById('pilot-input-order').value) || 0;

    const payload = { name, callsign, division, interests, photo_url, instagram_handle, display_order };

    let res;
    if (id) {
      res = await updateSupabasePilot(id, payload);
    } else {
      res = await createSupabasePilot(payload);
    }

    if (res.success) {
      showToast(id ? 'Data pilot diperbarui!' : 'Pilot baru berhasil ditambahkan!', 'success');
      document.getElementById('admin-pilot-modal')?.classList.remove('active');
      loadPilots();
    } else {
      showToast(res.error, 'error');
    }
  });

  // 3. Spot Form
  document.getElementById('form-spot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('spot-form-id').value;
    const spot_number = document.getElementById('spot-input-number').value.trim();
    const name = document.getElementById('spot-input-name').value.trim();
    const location_label = document.getElementById('spot-input-location').value.trim();
    const category = document.getElementById('spot-input-category').value;
    const photo_url = document.getElementById('spot-input-photo').value.trim();
    const maps_url = document.getElementById('spot-input-maps').value.trim();
    const pilots_playlist = document.getElementById('spot-input-playlist').value.trim();
    const description = document.getElementById('spot-input-desc').value.trim();

    const payload = { spot_number, name, location_label, category, photo_url, maps_url, pilots_playlist, description };

    let res;
    if (id) {
      res = await updateSupabaseSpot(id, payload);
    } else {
      res = await createSupabaseSpot(payload);
    }

    if (res.success) {
      showToast(id ? 'Spot terbang diperbarui!' : 'Spot baru berhasil ditambahkan!', 'success');
      document.getElementById('admin-spot-modal')?.classList.remove('active');
      loadSpots();
    } else {
      showToast(res.error, 'error');
    }
  });

  // 4. Gallery Form
  document.getElementById('form-gallery')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('gallery-form-id').value;
    const mission_code = document.getElementById('gallery-input-code').value.trim();
    const title = document.getElementById('gallery-input-title').value.trim();
    const location = document.getElementById('gallery-input-location').value.trim();
    const category = document.getElementById('gallery-input-category').value;
    const date_label = document.getElementById('gallery-input-date').value.trim();
    const photo_url = document.getElementById('gallery-input-photo').value.trim();
    const description = document.getElementById('gallery-input-desc').value.trim();

    const payload = { mission_code, title, location, category, date_label, photo_url, description };

    let res;
    if (id) {
      res = await updateSupabaseGalleryItem(id, payload);
    } else {
      res = await createSupabaseGalleryItem(payload);
    }

    if (res.success) {
      showToast(id ? 'Arsip galeri diperbarui!' : 'Galeri misi baru ditambahkan!', 'success');
      document.getElementById('admin-gallery-modal')?.classList.remove('active');
      loadGallery();
    } else {
      showToast(res.error, 'error');
    }
  });

  // 5. Speelwijk Registrant Form
  document.getElementById('form-speelwijk-reg')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('speelwijk-reg-form-id').value;
    const name = document.getElementById('speelwijk-reg-input-name').value.trim();
    const callsign = document.getElementById('speelwijk-reg-input-community').value.trim();
    const phone = document.getElementById('speelwijk-reg-input-phone').value.trim();
    const email = document.getElementById('speelwijk-reg-input-email').value.trim();
    const category = document.getElementById('speelwijk-reg-input-category').value;
    const paymentMethod = document.getElementById('speelwijk-reg-input-payment').value;
    const status = document.getElementById('speelwijk-reg-input-status').value;
    const notes = document.getElementById('speelwijk-reg-input-notes').value.trim();

    const payload = { id: id || undefined, name, callsign, phone, email, category, paymentMethod, status, notes };

    const res = await saveSpeelwijkRegistration(payload);
    if (res.success) {
      showToast(id ? 'Data pendaftar diperbarui!' : 'Pendaftar baru berhasil ditambahkan!', 'success');
      document.getElementById('admin-speelwijk-reg-modal')?.classList.remove('active');
      loadSpeelwijkRegistrations();
    } else {
      showToast(res.error, 'error');
    }
  });

  // 6. Speelwijk Rundown Session Form
  document.getElementById('form-speelwijk-session')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('speelwijk-session-form-id').value;
    const day = document.getElementById('speelwijk-session-input-day').value;
    const time = document.getElementById('speelwijk-session-input-time').value.trim();
    const title = document.getElementById('speelwijk-session-input-title').value.trim();
    const desc = document.getElementById('speelwijk-session-input-desc').value.trim();

    const payload = { id: id || undefined, day, time, title, desc };
    saveSpeelwijkRundownItem(payload);
    showToast(id ? 'Sesi rundown diperbarui!' : 'Sesi baru ditambahkan ke rundown!', 'success');
    document.getElementById('admin-speelwijk-session-modal')?.classList.remove('active');
    loadSpeelwijkRundown();
  });

  // 7. Speelwijk Settings Form
  document.getElementById('form-speelwijk-settings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('setting-speelwijk-title').value.trim();
    const subtitle = document.getElementById('setting-speelwijk-subtitle').value.trim();
    const date = document.getElementById('setting-speelwijk-date').value.trim();
    const fee = document.getElementById('setting-speelwijk-fee').value.trim();
    const waNumber = document.getElementById('setting-speelwijk-wa').value.trim();
    const location = document.getElementById('setting-speelwijk-loc').value.trim();
    const coords = document.getElementById('setting-speelwijk-coords').value.trim();
    const desc = document.getElementById('setting-speelwijk-desc').value.trim();

    const payload = { title, subtitle, date, fee, waNumber, location, coords, desc };
    saveSpeelwijkSettings(payload);
    showToast('Pengaturan microsite Benteng Speelwijk berhasil disimpan!', 'success');
  });
}

/* -------------------------------------------------------------------------- */
/* PILOT SYNC (1-CLICK SEED FROM TENTANG-KAMI TO SUPABASE)                    */
/* -------------------------------------------------------------------------- */
function initPilotSync() {
  const syncBtn = document.getElementById('btn-sync-pilots');
  if (!syncBtn) return;

  syncBtn.addEventListener('click', async () => {
    if (!confirm('Apakah Anda ingin menyinkronkan 14 data pilot resmi ke Supabase? Data yang belum ada akan langsung ditambahkan.')) {
      return;
    }

    const origText = syncBtn.innerHTML;
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> MENYINKRONKAN...';

    let successCount = 0;
    for (const pilot of DEFAULT_OFFICIAL_PILOTS) {
      // Check if pilot already exists by name
      const exists = cachedPilots.some(p => p.name.toLowerCase() === pilot.name.toLowerCase());
      if (!exists) {
        const res = await createSupabasePilot(pilot);
        if (res.success) successCount++;
      }
    }

    syncBtn.disabled = false;
    syncBtn.innerHTML = origText;

    if (successCount > 0) {
      showToast(`Berhasil menyinkronkan ${successCount} pilot baru ke database!`, 'success');
      loadPilots();
    } else {
      showToast('Semua 14 pilot resmi sudah ada di database.', 'info');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* REALTIME LISTENER FOR ADMIN DASHBOARD                                      */
/* -------------------------------------------------------------------------- */
function setupRealtimeListeners() {
  subscribeToTable('events', () => loadEvents());
  subscribeToTable('pilots', () => loadPilots());
  subscribeToTable('flying_spots', () => loadSpots());
  subscribeToTable('gallery', () => loadGallery());
  subscribeToTable('contacts', () => {
    showToast('Transmisi data kontak / pendaftar diterima!', 'info');
    loadContacts();
    loadSpeelwijkRegistrations();
  });
}

