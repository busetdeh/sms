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
  getSupabaseArticles,
  createSupabaseArticle,
  updateSupabaseArticle,
  deleteSupabaseArticle,
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
  reorderSpeelwijkRundown,
  getSpeelwijkSettings,
  saveSpeelwijkSettings,
  getSpeelwijkPartners,
  saveSpeelwijkPartner,
  deleteSpeelwijkPartner,
  reorderSpeelwijkPartners,
  getSpeelwijkBooths,
  saveSpeelwijkBooth,
  deleteSpeelwijkBooth,
  reorderSpeelwijkBooths,
  getSpeelwijkPrizes,
  getSpeelwijkPrizesShared,
  saveSpeelwijkPrize,
  deleteSpeelwijkPrize,
  reorderSpeelwijkPrizes,
  getSpeelwijkReporting,
  saveSpeelwijkReporting,
  saveSpeelwijkSponsorshipIncome,
  deleteSpeelwijkSponsorshipIncome,
  saveSpeelwijkExpense,
  deleteSpeelwijkExpense
} from './supabase.js';
import { exportReportingCsv, printReportingPdf } from './reporting-export.js';

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
let cachedArticles = [];
let cachedContacts = [];
let cachedSpeelwijkRegs = [];
let cachedSpeelwijkRundown = [];
let cachedSpeelwijkSettings = {};
let cachedSpeelwijkPartners = [];
let cachedSpeelwijkBooths = [];
let cachedSpeelwijkPrizes = [];
let cachedSpeelwijkReporting = { budget: 40000000, sponsorshipIncome: [], expenses: [] };

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initTabNavigation();
  initSpeelwijkSubtabs();
  initModalListeners();
  initFormSubmissions();
  initSpeelwijkReportingForms();
  initSpeelwijkBoothForms();
  initPilotSync();
  initSpeelwijkQrisUpload();
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
    btn.addEventListener('click', async () => {
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
          articles: 'Manajemen Blog & Article',
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
    { btn: document.getElementById('subtab-btn-speelwijk-settings'), view: document.getElementById('speelwijk-subview-settings') },
    { btn: document.getElementById('subtab-btn-speelwijk-partners'), view: document.getElementById('speelwijk-subview-partners') },
    { btn: document.getElementById('subtab-btn-speelwijk-prizes'), view: document.getElementById('speelwijk-subview-prizes') },
    { btn: document.getElementById('subtab-btn-speelwijk-booths'), view: document.getElementById('speelwijk-subview-booths') },
    { btn: document.getElementById('subtab-btn-speelwijk-reporting'), view: document.getElementById('speelwijk-subview-reporting') }
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
    loadArticles(),
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

// 5. Blog & Article
async function loadArticles() {
  const tableBody = document.getElementById('admin-articles-tbody');
  const remoteArticles = await getSupabaseArticles();
  cachedArticles = remoteArticles || JSON.parse(localStorage.getItem('sms_articles') || '[]');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (cachedArticles.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">Belum ada artikel. Klik "+ Tambah Artikel" untuk mulai menulis.</td></tr>`;
    return;
  }

  cachedArticles.forEach(article => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/50 transition-colors text-xs font-body-md';
    const statusClass = article.status === 'published' ? 'text-green-300 bg-green-950/40 border-green-500/40' : 'text-yellow-300 bg-yellow-950/40 border-yellow-500/40';
    tr.innerHTML = `
      <td class="p-3.5"><div class="font-bold text-white text-sm">${article.title}</div><div class="text-[11px] text-on-surface-variant">${article.location || article.slug || ''}</div></td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-surface-container font-label-caps text-[10px] text-primary-container border border-primary-container/40">${article.category || '-'}</span></td>
      <td class="p-3.5 text-on-surface-variant font-label-caps">${article.published_at || '-'}</td>
      <td class="p-3.5"><span class="px-2 py-0.5 rounded border font-label-caps text-[10px] ${statusClass}">${article.status || 'draft'}</span></td>
      <td class="p-3.5 text-right whitespace-nowrap"><button data-id="${article.id}" class="btn-edit-article p-1.5 text-primary-container hover:bg-surface-container rounded mr-1" title="Edit"><span class="material-symbols-outlined text-base">edit</span></button><button data-id="${article.id}" class="btn-delete-article p-1.5 text-red-400 hover:bg-red-950/40 rounded" title="Hapus"><span class="material-symbols-outlined text-base">delete</span></button></td>`;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.btn-edit-article').forEach(button => button.addEventListener('click', () => {
    const article = cachedArticles.find(item => String(item.id) === button.dataset.id);
    if (article) openArticleModal(article);
  }));
  tableBody.querySelectorAll('.btn-delete-article').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('Hapus artikel ini?')) return;
    const id = button.dataset.id;
    const remoteResult = await deleteSupabaseArticle(id);
    if (!remoteResult.success) {
      const local = cachedArticles.filter(article => String(article.id) !== id);
      localStorage.setItem('sms_articles', JSON.stringify(local));
    }
    showToast('Artikel berhasil dihapus.', 'success');
    loadArticles();
  }));
}

// 6. Contacts / Inbox
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
    loadSpeelwijkSettings(),
    loadSpeelwijkPartners(),
    loadSpeelwijkBooths(),
    loadSpeelwijkPrizes()
  ]);
  await loadSpeelwijkReporting();
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

    let proofButton = '';
    if (reg.paymentProof) {
      proofButton = `
        <button class="btn-view-proof mt-1 text-[10px] text-primary hover:underline flex items-center gap-1 font-label-caps" data-id="${reg.id}">
          <span class="material-symbols-outlined text-[12px] text-primary">receipt_long</span> Bukti Transfer
        </button>
      `;
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
        <div>${reg.paymentMethod || 'QRIS'}</div>
        ${proofButton}
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

  tbody.querySelectorAll('.btn-edit-speelwijk-reg, .btn-view-proof').forEach(b => {
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

function enableSpeelwijkDragSort(container, onReorder, enabled = true) {
  if (!container) return;

  container._speelwijkDragReorder = enabled ? onReorder : null;
  if (!container.dataset.dragSortInitialized) {
    container.dataset.dragSortInitialized = 'true';
    container.addEventListener('dragover', event => {
      if (!container._speelwijkDragReorder) return;
      event.preventDefault();
      const dragging = container.querySelector('.speelwijk-dragging');
      if (!dragging) return;
      const afterElement = [...container.querySelectorAll('[data-drag-id]:not(.speelwijk-dragging)')]
        .reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = event.clientY - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) return { offset, element: child };
          return closest;
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
      if (afterElement) container.insertBefore(dragging, afterElement);
      else container.appendChild(dragging);
    });
    container.addEventListener('drop', async event => {
      if (!container._speelwijkDragReorder) return;
      event.preventDefault();
      const ids = [...container.querySelectorAll('[data-drag-id]')].map(item => item.dataset.dragId);
      try {
        await container._speelwijkDragReorder(ids);
      } catch (error) {
        showToast(`Urutan gagal disimpan: ${error.message}`, 'error');
      }
    });
  }

  container.querySelectorAll('[data-drag-id]').forEach(item => {
    item.draggable = Boolean(enabled);
    item.classList.toggle('cursor-grab', enabled);
    item.classList.toggle('active:cursor-grabbing', enabled);
    if (item.dataset.dragListener) return;
    item.dataset.dragListener = 'true';
    item.addEventListener('dragstart', event => {
      if (!item.draggable) return;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.dataset.dragId);
      item.classList.add('speelwijk-dragging', 'opacity-50');
    });
    item.addEventListener('dragend', () => item.classList.remove('speelwijk-dragging', 'opacity-50'));
  });
}

function applySpeelwijkOrder(items, ids) {
  const orderById = new Map(ids.map((id, index) => [String(id), index + 1]));
  return items.map(item => orderById.has(String(item.id))
    ? { ...item, display_order: orderById.get(String(item.id)) }
    : item);
}

async function persistSpeelwijkOrder({ items, ids, reorder, reload, label }) {
  const ordered = applySpeelwijkOrder(items, ids);
  const result = await reorder(ordered);
  showToast(
    result.remoteSynced === false ? `${label} diurutkan lokal; sinkronisasi server gagal.` : `Urutan ${label.toLowerCase()} berhasil disimpan.`,
    result.remoteSynced === false ? 'error' : 'success'
  );
  await reload();
}

async function loadSpeelwijkRundown() {
  cachedSpeelwijkRundown = await getSpeelwijkRundown({ migrateLocal: true });
  if (!cachedSpeelwijkSettings || Object.keys(cachedSpeelwijkSettings).length === 0) {
    cachedSpeelwijkSettings = await getSpeelwijkSettings({ migrateLocal: true });
  }

  // Update Day 1 & Day 2 headers on rundown tab
  const d1Title = cachedSpeelwijkSettings.day1Title || 'DAY 01 (17 OKTOBER 2026)';
  const d1Subtitle = cachedSpeelwijkSettings.day1Subtitle || 'KUALIFIKASI & EKSIBISI';
  const d2Title = cachedSpeelwijkSettings.day2Title || 'DAY 02 (18 OKTOBER 2026)';
  const d2Subtitle = cachedSpeelwijkSettings.day2Subtitle || 'SEMIFINAL & GRAND FINAL';

  const day1TitleEl = document.getElementById('speelwijk-rundown-day1-header-title');
  const day1SubtitleEl = document.getElementById('speelwijk-rundown-day1-header-subtitle');
  const day2TitleEl = document.getElementById('speelwijk-rundown-day2-header-title');
  const day2SubtitleEl = document.getElementById('speelwijk-rundown-day2-header-subtitle');

  if (day1TitleEl) day1TitleEl.textContent = d1Title;
  if (day1SubtitleEl) day1SubtitleEl.textContent = d1Subtitle;
  if (day2TitleEl) day2TitleEl.textContent = d2Title;
  if (day2SubtitleEl) day2SubtitleEl.textContent = d2Subtitle;

  const sessionDaySelect = document.getElementById('speelwijk-session-input-day');
  if (sessionDaySelect) {
    const opt1 = sessionDaySelect.querySelector('option[value="1"]');
    const opt2 = sessionDaySelect.querySelector('option[value="2"]');
    if (opt1) opt1.textContent = d1Title;
    if (opt2) opt2.textContent = d2Title;
  }

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
      card.dataset.dragId = item.id;
      card.className = 'p-3 bg-surface-container-high/60 border border-surface-variant rounded flex items-start justify-between gap-3 hover:border-primary-container/40 transition-colors';
      card.innerHTML = `
        <div class="flex items-start gap-2 min-w-0">
          <span class="material-symbols-outlined text-on-surface-variant text-base mt-0.5" title="Seret untuk mengubah urutan">drag_indicator</span>
          <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-mono-data text-[11px] font-bold border border-primary-container/40">${item.time}</span>
            <span class="font-bold text-white text-xs font-label-caps">${item.title}</span>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">${item.desc || '-'}</p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-id="${item.id}" class="btn-edit-speelwijk-session p-1 text-primary-container hover:bg-surface-container rounded" title="Edit Sesi"><span class="material-symbols-outlined text-sm">edit</span></button>
          <button data-id="${item.id}" class="btn-delete-speelwijk-session p-1 text-red-400 hover:bg-red-950/40 rounded" title="Hapus Sesi"><span class="material-symbols-outlined text-sm">delete</span></button>
        </div>
      `;
      container.appendChild(card);
    });
    const day = String(items[0]?.day || (container === day1Container ? '1' : '2'));
    enableSpeelwijkDragSort(container, ids => persistSpeelwijkOrder({
      items: cachedSpeelwijkRundown.filter(item => String(item.day) === day),
      ids,
      reorder: orderedDayItems => reorderSpeelwijkRundown([
        ...cachedSpeelwijkRundown.filter(item => String(item.day) !== day),
        ...orderedDayItems
      ]),
      reload: loadSpeelwijkRundown,
      label: `rundown Day ${day}`
    }));
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
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Hapus sesi rundown ini?')) {
        const result = await deleteSpeelwijkRundownItem(id);
        showToast(result.remoteSynced === false ? 'Sesi dihapus lokal; sinkronisasi server gagal.' : 'Sesi rundown dihapus.', result.remoteSynced === false ? 'error' : 'success');
        loadSpeelwijkRundown();
      }
    });
  });
}

function openSpeelwijkDayHeaderModal(dayNum) {
  const isDay1 = String(dayNum) === '1';
  const modal = document.getElementById('admin-speelwijk-day-header-modal');
  const heading = document.getElementById('speelwijk-day-header-modal-heading');
  const dayInput = document.getElementById('speelwijk-day-header-day-num');
  const titleInput = document.getElementById('speelwijk-day-header-input-title');
  const subtitleInput = document.getElementById('speelwijk-day-header-input-subtitle');
  const dateInput = document.getElementById('speelwijk-day-header-input-date');

  if (heading) heading.textContent = isDay1 ? 'EDIT HEADER & TEMA DAY 01' : 'EDIT HEADER & TEMA DAY 02';
  if (dayInput) dayInput.value = isDay1 ? '1' : '2';
  if (titleInput) titleInput.value = (isDay1 ? cachedSpeelwijkSettings.day1Title : cachedSpeelwijkSettings.day2Title) || (isDay1 ? 'DAY 01 (17 OKTOBER 2026)' : 'DAY 02 (18 OKTOBER 2026)');
  if (subtitleInput) subtitleInput.value = (isDay1 ? cachedSpeelwijkSettings.day1Subtitle : cachedSpeelwijkSettings.day2Subtitle) || (isDay1 ? 'KUALIFIKASI & EKSIBISI' : 'SEMIFINAL & GRAND FINAL');
  if (dateInput) dateInput.value = (isDay1 ? cachedSpeelwijkSettings.day1Date : cachedSpeelwijkSettings.day2Date) || (isDay1 ? '17 OKTOBER 2026' : '18 OKTOBER 2026');

  if (modal) modal.classList.add('active');
}

export function printSpeelwijkRundown() {
  const settings = cachedSpeelwijkSettings || {};
  const rundown = Array.isArray(cachedSpeelwijkRundown) ? cachedSpeelwijkRundown : [];

  const title = settings.title || 'Fly Through History';
  const subtitle = settings.subtitle || 'Benteng Speelwijk Drone Fest 2026';
  const eventDate = settings.date || '17 - 18 Oktober 2026';
  const location = settings.location || 'Benteng Speelwijk, Banten Lama';
  const coords = settings.coords || "6°01'59\"S 106°09'14\"E";
  const wa = settings.waNumber ? `+${settings.waNumber}` : '+62 877-7227-2928';
  const slug = settings.slug || 'sms-fly-through-history';
  const eventUrl = `https://www.skymultirotor.web.id/${slug}`;

  const day1Title = settings.day1Title || 'DAY 01 (17 OKTOBER 2026)';
  const day1Subtitle = settings.day1Subtitle || 'KUALIFIKASI & EKSIBISI';
  const day2Title = settings.day2Title || 'DAY 02 (18 OKTOBER 2026)';
  const day2Subtitle = settings.day2Subtitle || 'SEMIFINAL & GRAND FINAL';

  const day1Items = rundown.filter(i => String(i.day) === '1');
  const day2Items = rundown.filter(i => String(i.day) === '2');

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir browser. Silakan izinkan popup untuk mengunduh / mencetak rundown.');
    return;
  }

  const renderTableRows = (items) => {
    if (!items || items.length === 0) {
      return `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 18px; font-style: italic;">Belum ada sesi jadwal yang terdaftar untuk hari ini.</td></tr>`;
    }
    return items.map((item, idx) => `
      <tr>
        <td style="width: 36px; text-align: center; font-weight: bold; color: #475569;">${idx + 1}</td>
        <td style="width: 105px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #003B73; white-space: nowrap;">${escapeHtml(item.time || '-')}</td>
        <td style="width: 220px; font-weight: 700; color: #0f172a;">${escapeHtml(item.title || '-')}</td>
        <td style="color: #334155; font-size: 11px; line-height: 1.45;">${escapeHtml(item.desc || '-')}</td>
      </tr>
    `).join('');
  };

  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rundown ${escapeHtml(title)} - Speelwijk 2026</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #f1f5f9;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 13px;
    }
    .no-print-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .no-print-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-action {
      border: none;
      font-weight: 700;
      font-size: 12.5px;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-print {
      background: #eab308;
      color: #000;
    }
    .btn-print:hover { background: #facc15; }
    .btn-close {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }
    .btn-close:hover { background: rgba(255,255,255,0.22); }
    .hint-text {
      color: #94a3b8;
      font-size: 11.5px;
    }
    .doc-container {
      max-width: 860px;
      margin: 24px auto;
      background: #fff;
      padding: 36px 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .badge-org {
      display: inline-block;
      background: #003B73;
      color: #fff;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .subtitle {
      font-size: 13.5px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 11px;
    }
    .meta-item { display: flex; gap: 8px; }
    .meta-label { font-weight: 700; color: #475569; width: 115px; shrink: 0; }
    .meta-val { color: #0f172a; font-weight: 500; }
    .day-section {
      margin-top: 22px;
      page-break-inside: avoid;
    }
    .day-header {
      background: #0f172a;
      color: #fff;
      padding: 9px 14px;
      border-radius: 6px 6px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #eab308;
    }
    .day-theme {
      font-size: 10.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: rgba(255,255,255,0.16);
      padding: 2.5px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      background: #fff;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .rules-box {
      margin-top: 24px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 14px 18px;
      page-break-inside: avoid;
    }
    .rules-title {
      font-size: 11px;
      font-weight: 800;
      color: #003B73;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .rules-list {
      list-style: none;
      font-size: 10.5px;
      color: #334155;
      line-height: 1.55;
    }
    .rules-list li {
      margin-bottom: 4px;
      position: relative;
      padding-left: 14px;
    }
    .rules-list li::before {
      content: "•";
      position: absolute;
      left: 2px;
      color: #eab308;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }
    @media print {
      body { background: #fff; margin: 0; padding: 0; font-size: 10.5px; }
      .no-print { display: none !important; }
      .doc-container {
        max-width: 100%;
        margin: 0;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
      }
      .day-section { page-break-inside: avoid; }
      .rules-box { page-break-inside: avoid; }
      @page { margin: 12mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <!-- Print & Download Control Bar -->
  <div class="no-print">
    <div class="no-print-left">
      <strong>PRINTER / PDF PREVIEW: EVENT RUNDOWN</strong>
      <span class="hint-text">(Pilih destination "Save as PDF" di dialog print untuk download file PDF)</span>
    </div>
    <div class="no-print-actions">
      <button class="btn-action btn-print" onclick="window.print()">
        <span>🖨️ Cetak / Download PDF</span>
      </button>
      <button class="btn-action btn-close" onclick="window.close()">✕ Tutup</button>
    </div>
  </div>

  <div class="doc-container">
    <!-- Header -->
    <div class="header-box">
      <div class="badge-org">Sky Multirotor Squad · Official Flight Rundown</div>
      <h1 class="title">${escapeHtml(title)}</h1>
      <div class="subtitle">${escapeHtml(subtitle)}</div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">📅 Tanggal Acara:</span>
          <span class="meta-val">${escapeHtml(eventDate)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">📍 Lokasi Event:</span>
          <span class="meta-val">${escapeHtml(location)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">🧭 Koordinat:</span>
          <span class="meta-val">${escapeHtml(coords)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">📞 WhatsApp Panitia:</span>
          <span class="meta-val">${escapeHtml(wa)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">🌐 Portal Microsite:</span>
          <span class="meta-val">${escapeHtml(eventUrl)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">🕒 Waktu Dokumen:</span>
          <span class="meta-val">${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB</span>
        </div>
      </div>
    </div>

    <!-- Day 1 Schedule -->
    <div class="day-section">
      <div class="day-header">
        <div class="day-title">${escapeHtml(day1Title)}</div>
        <div class="day-theme">${escapeHtml(day1Subtitle)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">No</th>
            <th style="width: 105px;">Waktu (WIB)</th>
            <th style="width: 220px;">Nama Sesi / Agenda</th>
            <th>Rincian &amp; Instruksi Pilot</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(day1Items)}
        </tbody>
      </table>
    </div>

    <!-- Day 2 Schedule -->
    <div class="day-section">
      <div class="day-header">
        <div class="day-title">${escapeHtml(day2Title)}</div>
        <div class="day-theme">${escapeHtml(day2Subtitle)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">No</th>
            <th style="width: 105px;">Waktu (WIB)</th>
            <th style="width: 220px;">Nama Sesi / Agenda</th>
            <th>Rincian &amp; Instruksi Pilot</th>
          </tr>
        </thead>
        <tbody>
          ${renderTableRows(day2Items)}
        </tbody>
      </table>
    </div>

    <!-- Safety & Regulations -->
    <div class="rules-box">
      <div class="rules-title">⚠️ Prosedur Keselamatan &amp; Aturan Frekuensi Penerbangan</div>
      <ul class="rules-list">
        <li><strong>Safety Briefing &amp; Failsafe:</strong> Semua pilot wajib mengikuti safety briefing dan lolos uji failsafe (motor langsung mati saat sinyal radio remote terputus).</li>
        <li><strong>VTX Frequency Lock:</strong> Dilarang keras menyalakan drone (power-on LiPo) di area pit tanpa izin dari Frequency Marshal guna mencegah video lock out ke pilot yang sedang mengudara.</li>
        <li><strong>Zona Cagar Budaya:</strong> Hormati struktur bersejarah Benteng Speelwijk. Jalur terbang hanya diperbolehkan melalui track yang telah disterilkan dan ditentukan oleh race director.</li>
        <li><strong>LiPo Safety &amp; Charging:</strong> Pengisian daya baterai hanya diperbolehkan di area charging station khusus menggunakan LiPo safe bag / fireproof container.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Fly Through History – Benteng Speelwijk FPV Drone Fest 2026 · Sky Multirotor Squad</div>
      <div>Halaman 1 / Resmi Panitia Pelaksana</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

window.printSpeelwijkRundown = printSpeelwijkRundown;

async function loadSpeelwijkSettings() {
  cachedSpeelwijkSettings = await getSpeelwijkSettings({ migrateLocal: true });
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('setting-speelwijk-title', cachedSpeelwijkSettings.title);
  setVal('setting-speelwijk-subtitle', cachedSpeelwijkSettings.subtitle);
  const slug = cachedSpeelwijkSettings.slug || 'sms-fly-through-history';
  setVal('setting-speelwijk-slug', slug);
  const liveBtn = document.getElementById('speelwijk-btn-view-live');
  if (liveBtn) liveBtn.href = `/${slug}`;

  setVal('setting-speelwijk-date', cachedSpeelwijkSettings.date);
  setVal('setting-speelwijk-fee', cachedSpeelwijkSettings.fee);
  setVal('setting-speelwijk-registration-benefits', cachedSpeelwijkSettings.registrationBenefits || 'Termasuk Pit Access, Frekuensi Slot, Tenda Camping, Official Jersey & Konsumsi 2 Hari');
  setVal('setting-speelwijk-wa', cachedSpeelwijkSettings.waNumber);
  setVal('setting-speelwijk-loc', cachedSpeelwijkSettings.location);
  setVal('setting-speelwijk-coords', cachedSpeelwijkSettings.coords);
  setVal('setting-speelwijk-desc', cachedSpeelwijkSettings.desc);
  setVal('setting-speelwijk-mission-intro', cachedSpeelwijkSettings.missionIntro);
  setVal('setting-speelwijk-mission-pilot', cachedSpeelwijkSettings.missionPilot);

  // Day 1 & Day 2 header settings
  setVal('setting-speelwijk-day1-title', cachedSpeelwijkSettings.day1Title || 'DAY 01 (17 OKTOBER 2026)');
  setVal('setting-speelwijk-day1-subtitle', cachedSpeelwijkSettings.day1Subtitle || 'KUALIFIKASI & EKSIBISI');
  setVal('setting-speelwijk-day1-date', cachedSpeelwijkSettings.day1Date || '17 OKTOBER 2026');
  setVal('setting-speelwijk-day2-title', cachedSpeelwijkSettings.day2Title || 'DAY 02 (18 OKTOBER 2026)');
  setVal('setting-speelwijk-day2-subtitle', cachedSpeelwijkSettings.day2Subtitle || 'SEMIFINAL & GRAND FINAL');
  setVal('setting-speelwijk-day2-date', cachedSpeelwijkSettings.day2Date || '18 OKTOBER 2026');

  const day1TitleEl = document.getElementById('speelwijk-rundown-day1-header-title');
  const day1SubtitleEl = document.getElementById('speelwijk-rundown-day1-header-subtitle');
  const day2TitleEl = document.getElementById('speelwijk-rundown-day2-header-title');
  const day2SubtitleEl = document.getElementById('speelwijk-rundown-day2-header-subtitle');

  if (day1TitleEl) day1TitleEl.textContent = cachedSpeelwijkSettings.day1Title || 'DAY 01 (17 OKTOBER 2026)';
  if (day1SubtitleEl) day1SubtitleEl.textContent = cachedSpeelwijkSettings.day1Subtitle || 'KUALIFIKASI & EKSIBISI';
  if (day2TitleEl) day2TitleEl.textContent = cachedSpeelwijkSettings.day2Title || 'DAY 02 (18 OKTOBER 2026)';
  if (day2SubtitleEl) day2SubtitleEl.textContent = cachedSpeelwijkSettings.day2Subtitle || 'SEMIFINAL & GRAND FINAL';

  // QRIS & Bank transfer fields
  setVal('setting-speelwijk-qris-merchant', cachedSpeelwijkSettings.qrisMerchant || 'Sky Multirotor Squad');
  setVal('setting-speelwijk-qris-nmid', cachedSpeelwijkSettings.qrisNmid || 'ID1020038849502');
  
  const qrisImgUrl = cachedSpeelwijkSettings.qrisImageUrl || '';
  setVal('setting-speelwijk-qris-image', qrisImgUrl);
  const qrisPreview = document.getElementById('setting-speelwijk-qris-preview');
  if (qrisPreview) {
    qrisPreview.src = qrisImgUrl || '/logo.png';
    qrisPreview.onerror = () => { qrisPreview.src = '/logo.png'; };
  }

  setVal('setting-speelwijk-bank-name', cachedSpeelwijkSettings.bankName || 'BCA (Bank Central Asia)');
  setVal('setting-speelwijk-bank-account', cachedSpeelwijkSettings.bankAccount || '883-091-2839');
  setVal('setting-speelwijk-bank-holder', cachedSpeelwijkSettings.bankHolder || 'SKY MULTIROTOR SQUAD');
  setVal('setting-speelwijk-payment-instructions', cachedSpeelwijkSettings.paymentInstructions || 'Setelah menekan tombol "KIRIM PENDAFTARAN & RSVP", data pendaftaran Anda akan otomatis tercatat di sistem dan admin panitia SMS akan segera mengirimkan konfirmasi slot via WhatsApp resmi.');
}

async function loadSpeelwijkPartners() {
  cachedSpeelwijkPartners = await getSpeelwijkPartners({ migrateLocal: true });
  renderSpeelwijkPartners();

  // Search and filter listeners
  const searchInput = document.getElementById('speelwijk-partners-search');
  const typeFilter = document.getElementById('speelwijk-partners-filter-type');

  if (searchInput && !searchInput.dataset.hasListener) {
    searchInput.dataset.hasListener = 'true';
    searchInput.addEventListener('input', () => renderSpeelwijkPartners());
  }
  if (typeFilter && !typeFilter.dataset.hasListener) {
    typeFilter.dataset.hasListener = 'true';
    typeFilter.addEventListener('change', () => renderSpeelwijkPartners());
  }
}

function renderSpeelwijkPartners() {
  const tbody = document.getElementById('admin-speelwijk-partners-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('speelwijk-partners-search')?.value || '').toLowerCase().trim();
  const filterType = document.getElementById('speelwijk-partners-filter-type')?.value || 'ALL';

  const filtered = cachedSpeelwijkPartners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">
          Tidak ada data partner/sponsor ditemukan.
        </td>
      </tr>
    `;
    enableSpeelwijkDragSort(tbody, null, false);
    return;
  }

  const allowDrag = !searchQuery && filterType === 'ALL';

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/40 transition-colors text-xs text-white';
    if (allowDrag) tr.dataset.dragId = p.id;

    const logoHtml = p.logo_url 
      ? `<img src="${p.logo_url}" alt="${p.name}" class="h-8 max-w-[80px] object-contain bg-black/30 p-1 rounded border border-surface-variant"/>`
      : `<span class="text-[10px] text-on-surface-variant italic font-label-caps">Teks Kustom</span>`;

    const typeHtml = p.type === 'sponsor' 
      ? `<span class="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-label-caps text-[10px] font-bold">SPONSOR UTAMA</span>`
      : `<span class="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant border border-surface-variant font-label-caps text-[10px] font-bold">SUPPORTED BY</span>`;

    tr.innerHTML = `
      <td class="p-3 font-mono-data font-bold"><span class="material-symbols-outlined align-middle text-sm text-on-surface-variant mr-1" title="Seret untuk mengubah urutan">drag_indicator</span>${p.name}</td>
      <td class="p-3">${typeHtml}</td>
      <td class="p-3">${logoHtml}</td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button data-id="${p.id}" class="btn-edit-speelwijk-partner p-1.5 text-primary hover:bg-surface-container rounded transition-colors" title="Edit Partner">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button data-id="${p.id}" class="btn-delete-speelwijk-partner p-1.5 text-red-400 hover:bg-red-950/40 rounded transition-colors" title="Hapus Partner">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  enableSpeelwijkDragSort(tbody, ids => persistSpeelwijkOrder({
    items: cachedSpeelwijkPartners,
    ids,
    reorder: reorderSpeelwijkPartners,
    reload: loadSpeelwijkPartners,
    label: 'partner/sponsor'
  }), allowDrag);

  // Attach button listeners
  tbody.querySelectorAll('.btn-edit-speelwijk-partner').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const partner = cachedSpeelwijkPartners.find(p => p.id === id);
      if (partner) openSpeelwijkPartnerModal(partner);
    });
  });

  tbody.querySelectorAll('.btn-delete-speelwijk-partner').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus partner/sponsor ini?')) {
        const result = await deleteSpeelwijkPartner(id);
        showToast(result.remoteSynced === false ? 'Partner dihapus lokal; sinkronisasi server gagal.' : 'Partner/sponsor berhasil dihapus.', result.remoteSynced === false ? 'error' : 'success');
        loadSpeelwijkPartners();
      }
    });
  });
}

async function loadSpeelwijkBooths() {
  cachedSpeelwijkBooths = await getSpeelwijkBooths({ migrateLocal: true });
  renderSpeelwijkBooths();
}

function resetSpeelwijkBoothForm() {
  document.getElementById('form-speelwijk-booth')?.reset();
  const id = document.getElementById('speelwijk-booth-form-id');
  const order = document.getElementById('speelwijk-booth-input-order');
  if (id) id.value = '';
  if (order) order.value = String((cachedSpeelwijkBooths?.length || 0) + 1);
  const button = document.getElementById('btn-save-speelwijk-booth');
  if (button) button.textContent = 'SIMPAN BOOTH';
  document.getElementById('btn-cancel-speelwijk-booth')?.classList.add('hidden');
}

function renderSpeelwijkBooths() {
  const tbody = document.getElementById('admin-speelwijk-booths-tbody');
  if (!tbody) return;
  const query = (document.getElementById('speelwijk-booths-search')?.value || '').toLowerCase().trim();
  const filter = document.getElementById('speelwijk-booths-filter-type')?.value || 'ALL';
  const filtered = cachedSpeelwijkBooths.filter(item => {
    const matchesQuery = !query || [item.name, item.description, item.location, item.contact].some(value => String(value || '').toLowerCase().includes(query));
    const matchesType = filter === 'ALL' || item.type === filter;
    return matchesQuery && matchesType;
  });
  const allowDrag = !query && filter === 'ALL';
  tbody.innerHTML = filtered.length ? filtered.map(item => `
    <tr ${allowDrag ? `data-drag-id="${escapeReportingText(item.id)}"` : ''} class="border-b border-surface-variant text-xs text-white">
      <td class="p-3"><span class="material-symbols-outlined align-middle text-sm text-on-surface-variant mr-1" title="Seret untuk mengubah urutan">drag_indicator</span><div class="inline-block align-middle"><div class="font-bold">${escapeReportingText(item.name)}</div><div class="text-[10px] text-on-surface-variant">${escapeReportingText(item.description || '-')}</div></div></td>
      <td class="p-3"><span class="rounded px-2 py-1 text-[9px] font-bold ${item.type === 'facility' ? 'bg-blue-950/60 text-blue-200' : 'bg-primary-container/15 text-primary-container'}">${item.type === 'facility' ? 'FASILITAS' : 'MERCHANT'}</span></td>
      <td class="p-3 text-on-surface-variant">${escapeReportingText(item.location || '-')}</td>
      <td class="p-3"><span class="rounded px-2 py-1 text-[9px] font-bold ${item.status === 'inactive' ? 'bg-red-950/60 text-red-200' : 'bg-green-950/60 text-green-200'}">${item.status === 'inactive' ? 'NONAKTIF' : 'AKTIF'}</span></td>
      <td class="p-3 text-right whitespace-nowrap"><button data-speelwijk-booth-edit="${escapeReportingText(item.id)}" class="text-primary-container hover:text-white mr-2" title="Edit"><span class="material-symbols-outlined text-sm">edit</span></button><button data-speelwijk-booth-delete="${escapeReportingText(item.id)}" class="text-red-400 hover:text-red-200" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button></td>
    </tr>`).join('') : '<tr><td colspan="5" class="p-6 text-center text-on-surface-variant text-xs">Belum ada booth atau fasilitas.</td></tr>';

  enableSpeelwijkDragSort(tbody, ids => persistSpeelwijkOrder({
    items: cachedSpeelwijkBooths,
    ids,
    reorder: reorderSpeelwijkBooths,
    reload: loadSpeelwijkBooths,
    label: 'booth/fasilitas'
  }), allowDrag);

  tbody.querySelectorAll('[data-speelwijk-booth-edit]').forEach(button => {
    button.addEventListener('click', () => {
      const item = cachedSpeelwijkBooths.find(entry => entry.id === button.dataset.speelwijkBoothEdit);
      if (!item) return;
      document.getElementById('speelwijk-booth-form-id').value = item.id;
      document.getElementById('speelwijk-booth-input-name').value = item.name || '';
      document.getElementById('speelwijk-booth-input-type').value = item.type || 'merchant';
      document.getElementById('speelwijk-booth-input-description').value = item.description || '';
      document.getElementById('speelwijk-booth-input-location').value = item.location || '';
      document.getElementById('speelwijk-booth-input-status').value = item.status || 'active';
      document.getElementById('speelwijk-booth-input-contact').value = item.contact || '';
      document.getElementById('speelwijk-booth-input-link').value = item.link_url || '';
      document.getElementById('speelwijk-booth-input-order').value = item.display_order || 1;
      document.getElementById('btn-save-speelwijk-booth').textContent = 'UPDATE BOOTH';
      document.getElementById('btn-cancel-speelwijk-booth').classList.remove('hidden');
      document.getElementById('speelwijk-booth-input-name').focus();
    });
  });
  tbody.querySelectorAll('[data-speelwijk-booth-delete]').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('Hapus booth/fasilitas ini?')) return;
      const result = await deleteSpeelwijkBooth(button.dataset.speelwijkBoothDelete);
      showToast(result.remoteSynced === false ? 'Data dihapus lokal; sinkronisasi server gagal.' : 'Booth/fasilitas berhasil dihapus.', result.remoteSynced === false ? 'error' : 'success');
      await loadSpeelwijkBooths();
    });
  });
}

function initSpeelwijkBoothForms() {
  document.getElementById('speelwijk-booths-search')?.addEventListener('input', renderSpeelwijkBooths);
  document.getElementById('speelwijk-booths-filter-type')?.addEventListener('change', renderSpeelwijkBooths);
  document.getElementById('btn-cancel-speelwijk-booth')?.addEventListener('click', resetSpeelwijkBoothForm);
  document.getElementById('form-speelwijk-booth')?.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await saveSpeelwijkBooth({
      id: document.getElementById('speelwijk-booth-form-id').value || undefined,
      name: document.getElementById('speelwijk-booth-input-name').value,
      type: document.getElementById('speelwijk-booth-input-type').value,
      description: document.getElementById('speelwijk-booth-input-description').value,
      location: document.getElementById('speelwijk-booth-input-location').value,
      status: document.getElementById('speelwijk-booth-input-status').value,
      contact: document.getElementById('speelwijk-booth-input-contact').value,
      link_url: document.getElementById('speelwijk-booth-input-link').value,
      display_order: document.getElementById('speelwijk-booth-input-order').value
    });
    showToast(result.remoteSynced === false ? 'Booth tersimpan lokal; sinkronisasi server gagal.' : 'Booth/fasilitas berhasil disimpan.', result.remoteSynced === false ? 'error' : 'success');
    resetSpeelwijkBoothForm();
    await loadSpeelwijkBooths();
  });
  resetSpeelwijkBoothForm();
}

async function loadSpeelwijkPrizes() {
  cachedSpeelwijkPrizes = await getSpeelwijkPrizesShared({ migrateLocal: true });
  renderSpeelwijkPrizes();

  // Search and filter listeners
  const searchInput = document.getElementById('speelwijk-prizes-search');
  const catFilter = document.getElementById('speelwijk-prizes-filter-category');

  if (searchInput && !searchInput.dataset.hasListener) {
    searchInput.dataset.hasListener = 'true';
    searchInput.addEventListener('input', () => renderSpeelwijkPrizes());
  }
  if (catFilter && !catFilter.dataset.hasListener) {
    catFilter.dataset.hasListener = 'true';
    catFilter.addEventListener('change', () => renderSpeelwijkPrizes());
  }
}

function renderSpeelwijkPrizes() {
  const tbody = document.getElementById('admin-speelwijk-prizes-tbody');
  if (!tbody) return;

  const categoryFilter = document.getElementById('speelwijk-prizes-filter-category');
  const selectedCategory = categoryFilter?.value || 'ALL';
  if (categoryFilter) {
    const categories = [...new Set(cachedSpeelwijkPrizes.map(prize => prize.category).filter(Boolean))];
    categoryFilter.innerHTML = '<option value="ALL">SEMUA KATEGORI</option>' + categories.map(category => `<option value="${category}">${category.toUpperCase()}</option>`).join('');
    categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : 'ALL';
  }

  const searchQuery = (document.getElementById('speelwijk-prizes-search')?.value || '').toLowerCase().trim();
  const filterCat = categoryFilter?.value || 'ALL';

  const filtered = cachedSpeelwijkPrizes.filter(p => {
    const matchesSearch = p.category.toLowerCase().includes(searchQuery) || p.rank.toLowerCase().includes(searchQuery) || p.amount.toLowerCase().includes(searchQuery);
    const matchesCat = filterCat === 'ALL' || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-6 text-center text-on-surface-variant font-label-caps text-xs">
          Tidak ada data hadiah ditemukan.
        </td>
      </tr>
    `;
    enableSpeelwijkDragSort(tbody, null, false);
    return;
  }
  const allowDrag = !searchQuery && filterCat === 'ALL';

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-variant hover:bg-surface-container-high/40 transition-colors text-xs text-white';
    if (allowDrag) tr.dataset.dragId = p.id;

    tr.innerHTML = `
      <td class="p-3 font-mono-data font-bold text-primary-container"><span class="material-symbols-outlined align-middle text-sm text-on-surface-variant mr-1" title="Seret untuk mengubah urutan">drag_indicator</span>${p.category}</td>
      <td class="p-3 font-bold">${p.rank}</td>
      <td class="p-3 font-mono-data font-bold text-white">${p.amount}</td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button data-id="${p.id}" class="btn-edit-speelwijk-prize p-1.5 text-primary hover:bg-surface-container rounded transition-colors" title="Edit Hadiah">
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
          <button data-id="${p.id}" class="btn-delete-speelwijk-prize p-1.5 text-red-400 hover:bg-red-950/40 rounded transition-colors" title="Hapus Hadiah">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  enableSpeelwijkDragSort(tbody, ids => persistSpeelwijkOrder({
    items: cachedSpeelwijkPrizes,
    ids,
    reorder: reorderSpeelwijkPrizes,
    reload: loadSpeelwijkPrizes,
    label: 'hadiah/trophy'
  }), allowDrag);

  // Attach button listeners
  tbody.querySelectorAll('.btn-edit-speelwijk-prize').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const prize = cachedSpeelwijkPrizes.find(p => p.id === id);
      if (prize) openSpeelwijkPrizeModal(prize);
    });
  });

  tbody.querySelectorAll('.btn-delete-speelwijk-prize').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus data hadiah ini?')) {
        const result = await deleteSpeelwijkPrize(id);
        showToast(result.remoteSynced === false ? 'Hadiah dihapus lokal; sinkronisasi server gagal.' : 'Data hadiah berhasil dihapus.', result.remoteSynced === false ? 'error' : 'success');
        loadSpeelwijkPrizes();
      }
    });
  });
}

function formatReportingCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function parseReportingAmount(value) {
  const parsed = Number(String(value ?? '').replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeReportingText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function getApprovedSpeelwijkRegistrations() {
  const approvedStatuses = new Set(['APPROVED', 'LUNAS']);
  return cachedSpeelwijkRegs.filter(reg => approvedStatuses.has(String(reg.status || '').trim().toUpperCase()));
}

function renderSpeelwijkReporting() {
  const reporting = cachedSpeelwijkReporting || { budget: 40000000, sponsorshipIncome: [], expenses: [] };
  const sponsorshipIncome = Array.isArray(reporting.sponsorshipIncome) ? reporting.sponsorshipIncome : [];
  const expenses = Array.isArray(reporting.expenses) ? reporting.expenses : [];
  const cashSponsorshipIncome = sponsorshipIncome.filter(item => item.type !== 'in-kind');
  const nonCashSponsorshipIncome = sponsorshipIncome.filter(item => item.type === 'in-kind');
  const sponsorshipFilter = document.getElementById('reporting-sponsorship-filter')?.value || 'all';
  const visibleSponsorshipIncome = sponsorshipFilter === 'all'
    ? sponsorshipIncome
    : sponsorshipIncome.filter(item => (item.type === 'in-kind' ? 'in-kind' : 'cash') === sponsorshipFilter);
  const sponsorshipTotal = cashSponsorshipIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const nonCashSponsorshipTotal = nonCashSponsorshipIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const approvedRegistrations = getApprovedSpeelwijkRegistrations();
  const feeAmount = parseReportingAmount(cachedSpeelwijkSettings.fee || 0);
  const registrationTotal = approvedRegistrations.length * feeAmount;
  const totalIncome = sponsorshipTotal + registrationTotal;
  const budget = Number(reporting.budget) || 0;
  const progress = budget > 0 ? Math.round((totalIncome / budget) * 100) : 0;

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('reporting-budget-display', formatReportingCurrency(budget));
  setText('reporting-sponsorship-total', formatReportingCurrency(sponsorshipTotal));
  setText('reporting-sponsorship-table-total', formatReportingCurrency(sponsorshipTotal));
  setText('reporting-sponsorship-count', `${sponsorshipIncome.length} transaksi · ${nonCashSponsorshipIncome.length} non-tunai`);
  setText('reporting-sponsorship-noncash-total', formatReportingCurrency(nonCashSponsorshipTotal));
  setText('reporting-registration-total', formatReportingCurrency(registrationTotal));
  setText('reporting-registration-count', `${approvedRegistrations.length} pilot approved × ${formatReportingCurrency(feeAmount)}`);
  setText('reporting-total-income', formatReportingCurrency(totalIncome));
  setText('reporting-expenses-total', formatReportingCurrency(expenseTotal));
  setText('reporting-balance', formatReportingCurrency(totalIncome - expenseTotal));
  setText('reporting-bottom-total-income', formatReportingCurrency(totalIncome));
  setText('reporting-bottom-total-expenses', formatReportingCurrency(expenseTotal));
  setText('reporting-bottom-balance', formatReportingCurrency(totalIncome - expenseTotal));
  setText('reporting-income-progress-label', `${progress}%`);

  const progressBar = document.getElementById('reporting-income-progress');
  if (progressBar) {
    const visibleProgress = Math.min(Math.max(progress, 0), 100);
    progressBar.style.width = `${visibleProgress}%`;
    progressBar.setAttribute('aria-valuenow', String(visibleProgress));
  }
  const budgetInput = document.getElementById('reporting-budget-input');
  if (budgetInput && document.activeElement !== budgetInput) budgetInput.value = budget || '';

  const sponsorTbody = document.getElementById('reporting-sponsorship-tbody');
  if (sponsorTbody) {
    sponsorTbody.innerHTML = visibleSponsorshipIncome.length ? visibleSponsorshipIncome.map(item => `
      <tr class="border-b border-surface-variant text-xs text-white">
        <td class="p-3"><div class="font-bold">${escapeReportingText(item.sponsor)}</div>${item.notes ? `<div class="text-[10px] text-on-surface-variant">${escapeReportingText(item.notes)}</div>` : ''}</td>
        <td class="p-3"><span class="rounded px-1.5 py-1 text-[9px] font-bold ${item.type === 'in-kind' ? 'bg-blue-950/60 text-blue-200' : 'bg-primary-container/15 text-primary-container'}">${item.type === 'in-kind' ? 'NON-TUNAI' : 'TUNAI'}</span></td>
        <td class="p-3 text-on-surface-variant font-mono-data">${escapeReportingText(item.date || '-')}</td>
        <td class="p-3 font-mono-data font-bold ${item.type === 'in-kind' ? 'text-blue-200' : 'text-primary-container'}">${formatReportingCurrency(item.amount)}${item.type === 'in-kind' ? '<div class="text-[9px] font-normal text-on-surface-variant">nilai estimasi</div>' : ''}</td>
        <td class="p-3 text-right whitespace-nowrap"><button data-reporting-sponsor-edit="${escapeReportingText(item.id)}" class="text-primary-container hover:text-white mr-2" title="Edit"><span class="material-symbols-outlined text-sm">edit</span></button><button data-reporting-sponsor-delete="${escapeReportingText(item.id)}" class="text-red-400 hover:text-red-200" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button></td>
      </tr>`).join('') : '<tr><td colspan="5" class="p-5 text-center text-on-surface-variant text-xs">Belum ada pemasukan sponsorship.</td></tr>';
  }

  const expenseTbody = document.getElementById('reporting-expenses-tbody');
  if (expenseTbody) {
    expenseTbody.innerHTML = expenses.length ? expenses.map(item => `
      <tr class="border-b border-surface-variant text-xs text-white">
        <td class="p-3"><div class="font-bold">${escapeReportingText(item.category)}</div><div class="text-[10px] text-on-surface-variant">${escapeReportingText(item.description)}</div>${item.notes ? `<div class="text-[10px] text-on-surface-variant italic">${escapeReportingText(item.notes)}</div>` : ''}</td>
        <td class="p-3 text-on-surface-variant font-mono-data">${escapeReportingText(item.date || '-')}</td>
        <td class="p-3 font-mono-data font-bold text-red-300">${formatReportingCurrency(item.amount)}</td>
        <td class="p-3 text-right whitespace-nowrap"><button data-reporting-expense-edit="${escapeReportingText(item.id)}" class="text-primary-container hover:text-white mr-2" title="Edit"><span class="material-symbols-outlined text-sm">edit</span></button><button data-reporting-expense-delete="${escapeReportingText(item.id)}" class="text-red-400 hover:text-red-200" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button></td>
      </tr>`).join('') : '<tr><td colspan="4" class="p-5 text-center text-on-surface-variant text-xs">Belum ada pengeluaran.</td></tr>';

    expenseTbody.querySelectorAll('[data-reporting-expense-edit]').forEach(button => {
      button.addEventListener('click', () => {
        const item = expenses.find(entry => entry.id === button.dataset.reportingExpenseEdit);
        if (!item) return;
        document.getElementById('reporting-expense-id').value = item.id;
        document.getElementById('reporting-expense-category').value = item.category || '';
        document.getElementById('reporting-expense-description').value = item.description || '';
        document.getElementById('reporting-expense-amount').value = item.amount || 0;
        document.getElementById('reporting-expense-date').value = item.date || '';
        document.getElementById('reporting-expense-notes').value = item.notes || '';
        document.getElementById('btn-save-reporting-expense').textContent = 'UPDATE PENGELUARAN';
        document.getElementById('btn-cancel-reporting-expense').classList.remove('hidden');
      });
    });
    expenseTbody.querySelectorAll('[data-reporting-expense-delete]').forEach(button => {
      button.addEventListener('click', async () => {
        if (!confirm('Hapus data pengeluaran ini?')) return;
        const result = await deleteSpeelwijkExpense(button.dataset.reportingExpenseDelete);
        showToast(result.remoteSynced === false ? 'Pengeluaran dihapus lokal; sinkronisasi server gagal.' : 'Pengeluaran berhasil dihapus.', result.remoteSynced === false ? 'error' : 'success');
        await loadSpeelwijkReporting();
      });
    });
  }

  if (sponsorTbody) {
    sponsorTbody.querySelectorAll('[data-reporting-sponsor-edit]').forEach(button => {
      button.addEventListener('click', () => {
        const item = visibleSponsorshipIncome.find(entry => entry.id === button.dataset.reportingSponsorEdit);
        if (!item) return;
        document.getElementById('reporting-sponsorship-id').value = item.id;
        document.getElementById('reporting-sponsorship-name').value = item.sponsor || '';
        document.getElementById('reporting-sponsorship-type').value = item.type === 'in-kind' ? 'in-kind' : 'cash';
        document.getElementById('reporting-sponsorship-amount').value = item.amount || 0;
        document.getElementById('reporting-sponsorship-date').value = item.date || '';
        document.getElementById('reporting-sponsorship-notes').value = item.notes || '';
        document.getElementById('btn-save-reporting-sponsorship').textContent = 'UPDATE PEMASUKAN';
        document.getElementById('btn-cancel-reporting-sponsorship').classList.remove('hidden');
      });
    });
    sponsorTbody.querySelectorAll('[data-reporting-sponsor-delete]').forEach(button => {
      button.addEventListener('click', async () => {
        if (!confirm('Hapus data pemasukan sponsorship ini?')) return;
        const result = await deleteSpeelwijkSponsorshipIncome(button.dataset.reportingSponsorDelete);
        showToast(result.remoteSynced === false ? 'Pemasukan dihapus lokal; sinkronisasi server gagal.' : 'Pemasukan sponsorship berhasil dihapus.', result.remoteSynced === false ? 'error' : 'success');
        await loadSpeelwijkReporting();
      });
    });
  }
}

async function loadSpeelwijkReporting() {
  cachedSpeelwijkReporting = await getSpeelwijkReporting({ migrateLocal: true });
  renderSpeelwijkReporting();
}

function resetReportingSponsorshipForm() {
  document.getElementById('form-speelwijk-sponsorship')?.reset();
  document.getElementById('reporting-sponsorship-id').value = '';
  document.getElementById('reporting-sponsorship-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('btn-save-reporting-sponsorship').textContent = 'TAMBAH PEMASUKAN';
  document.getElementById('btn-cancel-reporting-sponsorship').classList.add('hidden');
}

function resetReportingExpenseForm() {
  document.getElementById('form-speelwijk-expense')?.reset();
  document.getElementById('reporting-expense-id').value = '';
  document.getElementById('reporting-expense-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('btn-save-reporting-expense').textContent = 'TAMBAH PENGELUARAN';
  document.getElementById('btn-cancel-reporting-expense').classList.add('hidden');
}

function initSpeelwijkReportingForms() {
  const budgetButton = document.getElementById('btn-save-reporting-budget');
  budgetButton?.addEventListener('click', async () => {
    const budget = parseReportingAmount(document.getElementById('reporting-budget-input').value);
    if (budget < 0) return;
    const result = await saveSpeelwijkReporting({ ...cachedSpeelwijkReporting, budget });
    showToast(result.remoteSynced === false ? 'Budget tersimpan lokal; sinkronisasi server gagal.' : 'Budget awal berhasil disimpan.', result.remoteSynced === false ? 'error' : 'success');
    await loadSpeelwijkReporting();
  });

  document.getElementById('form-speelwijk-sponsorship')?.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await saveSpeelwijkSponsorshipIncome({
      id: document.getElementById('reporting-sponsorship-id').value || undefined,
      sponsor: document.getElementById('reporting-sponsorship-name').value,
      type: document.getElementById('reporting-sponsorship-type').value,
      amount: parseReportingAmount(document.getElementById('reporting-sponsorship-amount').value),
      date: document.getElementById('reporting-sponsorship-date').value,
      notes: document.getElementById('reporting-sponsorship-notes').value
    });
    showToast(result.remoteSynced === false ? 'Pemasukan tersimpan lokal; sinkronisasi server gagal.' : 'Pemasukan sponsorship berhasil disimpan.', result.remoteSynced === false ? 'error' : 'success');
    resetReportingSponsorshipForm();
    await loadSpeelwijkReporting();
  });
  document.getElementById('btn-cancel-reporting-sponsorship')?.addEventListener('click', resetReportingSponsorshipForm);

  document.getElementById('form-speelwijk-expense')?.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await saveSpeelwijkExpense({
      id: document.getElementById('reporting-expense-id').value || undefined,
      category: document.getElementById('reporting-expense-category').value,
      description: document.getElementById('reporting-expense-description').value,
      amount: parseReportingAmount(document.getElementById('reporting-expense-amount').value),
      date: document.getElementById('reporting-expense-date').value,
      notes: document.getElementById('reporting-expense-notes').value
    });
    showToast(result.remoteSynced === false ? 'Pengeluaran tersimpan lokal; sinkronisasi server gagal.' : 'Pengeluaran berhasil disimpan.', result.remoteSynced === false ? 'error' : 'success');
    resetReportingExpenseForm();
    await loadSpeelwijkReporting();
  });
  document.getElementById('btn-cancel-reporting-expense')?.addEventListener('click', resetReportingExpenseForm);

  resetReportingSponsorshipForm();
  resetReportingExpenseForm();
  document.getElementById('reporting-sponsorship-filter')?.addEventListener('change', renderSpeelwijkReporting);
  document.getElementById('reporting-export-csv')?.addEventListener('click', () => exportReportingCsv({
    reporting: cachedSpeelwijkReporting,
    registrations: cachedSpeelwijkRegs,
    settings: cachedSpeelwijkSettings,
    sponsorshipFilter: document.getElementById('reporting-sponsorship-filter')?.value || 'all'
  }));
  document.getElementById('reporting-export-pdf')?.addEventListener('click', () => printReportingPdf({
    reporting: cachedSpeelwijkReporting,
    registrations: cachedSpeelwijkRegs,
    settings: cachedSpeelwijkSettings,
    sponsorshipFilter: document.getElementById('reporting-sponsorship-filter')?.value || 'all'
  }));
}

/* -------------------------------------------------------------------------- */
/* MODAL EDIT / CREATE HANDLERS                                               */
/* -------------------------------------------------------------------------- */
function initModalListeners() {
  document.getElementById('btn-add-event')?.addEventListener('click', () => openEventModal());
  document.getElementById('btn-add-pilot')?.addEventListener('click', () => openPilotModal());
  document.getElementById('btn-add-spot')?.addEventListener('click', () => openSpotModal());
  document.getElementById('btn-add-gallery')?.addEventListener('click', () => openGalleryModal());
  document.getElementById('btn-add-article')?.addEventListener('click', () => openArticleModal());
  document.getElementById('btn-add-speelwijk-reg')?.addEventListener('click', () => openSpeelwijkRegModal());
  document.getElementById('btn-add-speelwijk-session')?.addEventListener('click', () => openSpeelwijkSessionModal());
  document.getElementById('btn-print-speelwijk-rundown')?.addEventListener('click', () => printSpeelwijkRundown());
  document.getElementById('btn-add-speelwijk-partner')?.addEventListener('click', () => openSpeelwijkPartnerModal());
  document.getElementById('btn-add-speelwijk-prize')?.addEventListener('click', () => openSpeelwijkPrizeModal());

  initPilotPhotoUploadListeners();
  initSpeelwijkPartnerLogoUploadListeners();
}

function openArticleModal(article = null) {
  const modal = document.getElementById('admin-article-modal');
  if (!modal) return;
  document.getElementById('article-form-id').value = article?.id || '';
  document.getElementById('article-input-title').value = article?.title || '';
  document.getElementById('article-input-category').value = article?.category || 'acara';
  document.getElementById('article-input-date').value = article?.published_at || new Date().toISOString().slice(0, 10);
  document.getElementById('article-input-status').value = article?.status || 'draft';
  document.getElementById('article-input-location').value = article?.location || '';
  document.getElementById('article-input-image').value = article?.image_url || '';
  document.getElementById('article-input-excerpt').value = article?.excerpt || '';
  document.getElementById('article-input-content').value = article?.content || '';
  document.getElementById('article-modal-heading').textContent = article ? 'EDIT ARTIKEL' : 'TAMBAH ARTIKEL';
  modal.classList.add('active');
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

/* -------------------------------------------------------------------------- */
/* SPEELWIJK QRIS PHOTO UPLOAD CONTROLLER                                     */
/* -------------------------------------------------------------------------- */
function initSpeelwijkQrisUpload() {
  const fileInput = document.getElementById('setting-speelwijk-qris-file');
  const dropzone = document.getElementById('speelwijk-qris-dropzone');
  const qrisInput = document.getElementById('setting-speelwijk-qris-image');
  const qrisPreview = document.getElementById('setting-speelwijk-qris-preview');

  if (!fileInput || !dropzone) return;

  // Click dropzone to trigger file input
  dropzone.addEventListener('click', () => fileInput.click());

  // Input value change live preview
  if (qrisInput && qrisPreview) {
    const updatePreview = () => {
      const val = qrisInput.value.trim();
      qrisPreview.src = val || '/logo.png';
      qrisPreview.onerror = () => { qrisPreview.src = '/logo.png'; };
    };
    qrisInput.addEventListener('input', updatePreview);
    qrisInput.addEventListener('change', updatePreview);
  }

  // Handle selected file
  async function handleFileSelected(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran QRIS maksimal 2 MB.', 'error');
      return;
    }

    // Instant preview & base64 conversion
    const reader = new FileReader();
    reader.onload = (e) => {
      if (qrisPreview) qrisPreview.src = e.target.result;
      if (qrisInput) {
        qrisInput.value = e.target.result;
      }
      showToast('Gambar QRIS berhasil dimuat!', 'success');
    };
    reader.readAsDataURL(file);
  }

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Drag and Drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-primary-container', 'bg-surface-container-high/40');
  });

  ['dragleave', 'dragend'].forEach(type => {
    dropzone.addEventListener(type, () => {
      dropzone.classList.remove('border-primary-container', 'bg-surface-container-high/40');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-primary-container', 'bg-surface-container-high/40');
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
function getSpeelwijkRegistrationCategories(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

async function populateSpeelwijkRegistrationCategories(regData = null) {
  const select = document.getElementById('speelwijk-reg-input-category');
  if (!select) return;

  const selectedCategories = getSpeelwijkRegistrationCategories(regData?.category);
  const configuredCategories = (cachedSpeelwijkPrizes || []).map(prize => prize.category).filter(Boolean);
  const fallbackCategories = ['Cinewhoop Race', 'Cinematic FPV', 'Freestyle FPV'];
  const categories = [...new Set([...configuredCategories, ...selectedCategories, ...fallbackCategories])];

  select.innerHTML = '';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    option.selected = selectedCategories.includes(category);
    select.appendChild(option);
  });

  if (!regData && !selectedCategories.length) {
    const cinematic = [...select.options].find(option => option.value === 'Cinematic FPV');
    if (cinematic) cinematic.selected = true;
  }
}

async function openSpeelwijkRegModal(regData = null) {
  const modal = document.getElementById('admin-speelwijk-reg-modal');
  const form = document.getElementById('form-speelwijk-reg');
  if (!modal || !form) return;

  document.getElementById('speelwijk-reg-form-id').value = regData ? regData.id : '';
  document.getElementById('speelwijk-reg-input-name').value = regData ? regData.name : '';
  document.getElementById('speelwijk-reg-input-community').value = regData ? (regData.callsign || '') : '';
  document.getElementById('speelwijk-reg-input-phone').value = regData ? (regData.phone || '') : '';
  document.getElementById('speelwijk-reg-input-email').value = regData ? (regData.email || '') : '';
  await populateSpeelwijkRegistrationCategories(regData);
  document.getElementById('speelwijk-reg-input-payment').value = regData ? (regData.paymentMethod || 'QRIS') : 'QRIS';
  document.getElementById('speelwijk-reg-input-status').value = regData ? (regData.status || 'PENDING') : 'PENDING';
  document.getElementById('speelwijk-reg-input-notes').value = regData ? (regData.notes || '') : '';

  // Payment Proof View
  const proofContainer = document.getElementById('speelwijk-reg-proof-container');
  const proofPreview = document.getElementById('speelwijk-reg-proof-preview');
  const openProofBtn = document.getElementById('btn-speelwijk-reg-open-proof');
  if (proofContainer && proofPreview) {
    if (regData && regData.paymentProof) {
      proofPreview.src = regData.paymentProof;
      proofContainer.classList.remove('hidden');
      if (openProofBtn) {
        openProofBtn.onclick = () => {
          const newTab = window.open();
          newTab.document.write(`<iframe src="${regData.paymentProof}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        };
      }
    } else {
      proofContainer.classList.add('hidden');
      proofPreview.src = '/logo.png';
    }
  }

  // WA Notify Link
  const waNotifyBtn = document.getElementById('btn-speelwijk-reg-wa-notify');
  if (waNotifyBtn) {
    if (regData) {
      waNotifyBtn.classList.remove('hidden');
      
      const updateWaNotifyLink = () => {
        const currentStatus = document.getElementById('speelwijk-reg-input-status').value;
        const currentNotes = document.getElementById('speelwijk-reg-input-notes').value.trim();
        const cleanPhone = (regData.phone || '').replace(/\D/g, '');
        const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
        
        const waMsg = `Halo Pilot ${regData.name} (${regData.callsign || '-'}), panitia Sky Multirotor Squad mengonfirmasi bahwa status pendaftaran Anda untuk event "Benteng Speelwijk Drone Fest 2026" kini adalah: *${currentStatus}*.\n\nCatatan Panitia: ${currentNotes || '-'}\n\nTerima kasih atas partisipasi Anda!`;
        waNotifyBtn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;
      };

      updateWaNotifyLink();

      // Set change/input event listeners (reset them first to avoid duplicates)
      const statusInput = document.getElementById('speelwijk-reg-input-status');
      const notesInput = document.getElementById('speelwijk-reg-input-notes');
      
      statusInput.removeEventListener('change', statusInput._updateWaFn || (() => {}));
      notesInput.removeEventListener('input', notesInput._updateWaFn || (() => {}));
      
      statusInput._updateWaFn = updateWaNotifyLink;
      notesInput._updateWaFn = updateWaNotifyLink;
      
      statusInput.addEventListener('change', updateWaNotifyLink);
      notesInput.addEventListener('input', updateWaNotifyLink);
    } else {
      waNotifyBtn.classList.add('hidden');
    }
  }

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

function openSpeelwijkPartnerModal(partner = null) {
  const modal = document.getElementById('admin-speelwijk-partner-modal');
  if (!modal) return;

  document.getElementById('speelwijk-partner-form-id').value = partner?.id || '';
  document.getElementById('speelwijk-partner-input-name').value = partner?.name || '';
  document.getElementById('speelwijk-partner-input-type').value = partner?.type || 'sponsor';
  document.getElementById('speelwijk-partner-input-link').value = partner?.link_url || '';
  
  const logoBase64Input = document.getElementById('speelwijk-partner-logo-base64');
  const logoPreview = document.getElementById('speelwijk-partner-logo-preview');
  const logoText = document.getElementById('speelwijk-partner-logo-text');

  if (logoBase64Input) logoBase64Input.value = partner?.logo_url || '';
  if (logoPreview) logoPreview.src = partner?.logo_url || '/logo.png';
  if (logoText) logoText.textContent = partner?.logo_url ? 'Logo Terpilih' : 'Drag & Drop Logo atau Klik untuk Pilih (Max 1MB)';

  document.getElementById('speelwijk-partner-modal-heading').textContent = partner ? 'EDIT PARTNER / SPONSOR' : 'TAMBAH PARTNER / SPONSOR';
  modal.classList.add('active');
}

function openSpeelwijkPrizeModal(prize = null) {
  const modal = document.getElementById('admin-speelwijk-prize-modal');
  if (!modal) return;

  document.getElementById('speelwijk-prize-form-id').value = prize?.id || '';
  document.getElementById('speelwijk-prize-input-category').value = prize?.category || 'Race Whoop Pro';
  document.getElementById('speelwijk-prize-input-rank').value = prize?.rank || 'Kategori';
  document.getElementById('speelwijk-prize-input-amount').value = prize?.amount || '';

  document.getElementById('speelwijk-prize-modal-heading').textContent = prize ? 'EDIT DATA HADIAH' : 'TAMBAH DATA HADIAH';
  modal.classList.add('active');
}

function initSpeelwijkPartnerLogoUploadListeners() {
  const fileInput = document.getElementById('speelwijk-partner-logo-file');
  const dropzone = document.getElementById('speelwijk-partner-logo-dropzone');
  const logoBase64 = document.getElementById('speelwijk-partner-logo-base64');
  const logoPreview = document.getElementById('speelwijk-partner-logo-preview');
  const logoText = document.getElementById('speelwijk-partner-logo-text');

  if (!fileInput || !dropzone) return;

  dropzone.addEventListener('click', () => fileInput.click());

  async function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, WEBP, dll).', 'error');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      showToast('Ukuran logo maksimal 1 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (logoPreview) logoPreview.src = e.target.result;
      if (logoBase64) logoBase64.value = e.target.result;
      if (logoText) logoText.textContent = `Terpilih: ${file.name}`;
      showToast('Logo berhasil dimuat.', 'success');
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-primary-container', 'bg-surface-container-high/40');
  });

  ['dragleave', 'dragend'].forEach(type => {
    dropzone.addEventListener(type, () => {
      dropzone.classList.remove('border-primary-container', 'bg-surface-container-high/40');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-primary-container', 'bg-surface-container-high/40');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* FORM SUBMISSIONS (SAVE TO SUPABASE)                                        */
/* -------------------------------------------------------------------------- */
function initFormSubmissions() {
  // 0. Blog & Article Form
  document.getElementById('form-article')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('article-form-id').value;
    const title = document.getElementById('article-input-title').value.trim();
    const payload = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category: document.getElementById('article-input-category').value,
      published_at: document.getElementById('article-input-date').value,
      status: document.getElementById('article-input-status').value,
      location: document.getElementById('article-input-location').value.trim(),
      image_url: document.getElementById('article-input-image').value.trim(),
      excerpt: document.getElementById('article-input-excerpt').value.trim(),
      content: document.getElementById('article-input-content').value.trim()
    };
    const remoteResult = id ? await updateSupabaseArticle(id, payload) : await createSupabaseArticle(payload);
    if (!remoteResult.success) {
      const local = JSON.parse(localStorage.getItem('sms_articles') || '[]');
      const localArticle = { ...payload, id: id || `local-${Date.now()}` };
      const index = local.findIndex(article => String(article.id) === String(id));
      if (index >= 0) local[index] = localArticle; else local.unshift(localArticle);
      localStorage.setItem('sms_articles', JSON.stringify(local));
    }
    document.getElementById('admin-article-modal')?.classList.remove('active');
    showToast(id ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil ditambahkan.', 'success');
    loadArticles();
  });

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
    const category = Array.from(document.getElementById('speelwijk-reg-input-category').selectedOptions)
      .map(option => option.value)
      .join(', ');
    const paymentMethod = document.getElementById('speelwijk-reg-input-payment').value;
    const status = document.getElementById('speelwijk-reg-input-status').value;
    const notes = document.getElementById('speelwijk-reg-input-notes').value.trim();

    const foundReg = cachedSpeelwijkRegs.find(r => r.id === id);
    const paymentProof = foundReg ? (foundReg.paymentProof || '') : '';

    const payload = { id: id || undefined, name, callsign, phone, email, category, paymentMethod, status, notes, paymentProof };

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
  document.getElementById('form-speelwijk-session')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('speelwijk-session-form-id').value;
    const day = document.getElementById('speelwijk-session-input-day').value;
    const time = document.getElementById('speelwijk-session-input-time').value.trim();
    const title = document.getElementById('speelwijk-session-input-title').value.trim();
    const desc = document.getElementById('speelwijk-session-input-desc').value.trim();

    const payload = { id: id || undefined, day, time, title, desc };
    const result = await saveSpeelwijkRundownItem(payload);
    showToast(result.remoteSynced === false ? 'Tersimpan lokal; sinkronisasi server gagal.' : (id ? 'Sesi rundown diperbarui!' : 'Sesi baru ditambahkan ke rundown!'), result.remoteSynced === false ? 'error' : 'success');
    document.getElementById('admin-speelwijk-session-modal')?.classList.remove('active');
    loadSpeelwijkRundown();
  });

  // 7. Speelwijk Settings Form
  document.getElementById('form-speelwijk-settings')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('setting-speelwijk-title').value.trim();
    const subtitle = document.getElementById('setting-speelwijk-subtitle').value.trim();
    
    let rawSlug = document.getElementById('setting-speelwijk-slug')?.value.trim() || 'sms-fly-through-history';
    const slug = rawSlug.replace(/^\/+/, '').replace(/\s+/g, '-').toLowerCase();
    const slugInput = document.getElementById('setting-speelwijk-slug');
    if (slugInput) slugInput.value = slug;

    const liveBtn = document.getElementById('speelwijk-btn-view-live');
    if (liveBtn) liveBtn.href = `/${slug}`;

    const date = document.getElementById('setting-speelwijk-date').value.trim();
    const day1Title = document.getElementById('setting-speelwijk-day1-title')?.value.trim() || 'DAY 01 (17 OKTOBER 2026)';
    const day1Subtitle = document.getElementById('setting-speelwijk-day1-subtitle')?.value.trim() || 'KUALIFIKASI & EKSIBISI';
    const day1Date = document.getElementById('setting-speelwijk-day1-date')?.value.trim() || '17 OKTOBER 2026';
    const day2Title = document.getElementById('setting-speelwijk-day2-title')?.value.trim() || 'DAY 02 (18 OKTOBER 2026)';
    const day2Subtitle = document.getElementById('setting-speelwijk-day2-subtitle')?.value.trim() || 'SEMIFINAL & GRAND FINAL';
    const day2Date = document.getElementById('setting-speelwijk-day2-date')?.value.trim() || '18 OKTOBER 2026';

    const fee = document.getElementById('setting-speelwijk-fee').value.trim();
    const registrationBenefits = document.getElementById('setting-speelwijk-registration-benefits')?.value.trim() || '';
    const waNumber = document.getElementById('setting-speelwijk-wa').value.trim();
    const location = document.getElementById('setting-speelwijk-loc').value.trim();
    const coords = document.getElementById('setting-speelwijk-coords').value.trim();
    const desc = document.getElementById('setting-speelwijk-desc').value.trim();
    const missionIntro = document.getElementById('setting-speelwijk-mission-intro')?.value.trim() || '';
    const missionPilot = document.getElementById('setting-speelwijk-mission-pilot')?.value.trim() || '';

    const qrisMerchant = document.getElementById('setting-speelwijk-qris-merchant')?.value.trim() || 'Sky Multirotor Squad';
    const qrisNmid = document.getElementById('setting-speelwijk-qris-nmid')?.value.trim() || 'ID1020038849502';
    const qrisImageUrl = document.getElementById('setting-speelwijk-qris-image')?.value.trim() || '';
    const bankName = document.getElementById('setting-speelwijk-bank-name')?.value.trim() || 'BCA (Bank Central Asia)';
    const bankAccount = document.getElementById('setting-speelwijk-bank-account')?.value.trim() || '883-091-2839';
    const bankHolder = document.getElementById('setting-speelwijk-bank-holder')?.value.trim() || 'SKY MULTIROTOR SQUAD';
    const paymentInstructions = document.getElementById('setting-speelwijk-payment-instructions')?.value.trim() || '';

    const payload = { 
      title, 
      subtitle, 
      slug,
      date, 
      day1Title,
      day1Subtitle,
      day1Date,
      day2Title,
      day2Subtitle,
      day2Date,
      fee, 
      registrationBenefits,
      waNumber, 
      location, 
      coords, 
      desc,
      missionIntro,
      missionPilot,
      qrisMerchant,
      qrisNmid,
      qrisImageUrl,
      bankName,
      bankAccount,
      bankHolder,
      paymentInstructions
    };

    const result = await saveSpeelwijkSettings(payload);
    cachedSpeelwijkSettings = payload;

    // Sync rundown card headers
    const d1TitleEl = document.getElementById('speelwijk-rundown-day1-header-title');
    const d1SubtitleEl = document.getElementById('speelwijk-rundown-day1-header-subtitle');
    const d2TitleEl = document.getElementById('speelwijk-rundown-day2-header-title');
    const d2SubtitleEl = document.getElementById('speelwijk-rundown-day2-header-subtitle');
    if (d1TitleEl) d1TitleEl.textContent = day1Title;
    if (d1SubtitleEl) d1SubtitleEl.textContent = day1Subtitle;
    if (d2TitleEl) d2TitleEl.textContent = day2Title;
    if (d2SubtitleEl) d2SubtitleEl.textContent = day2Subtitle;

    showToast(result.remoteSynced === false ? 'Tersimpan lokal; sinkronisasi server gagal.' : `Pengaturan berhasil disimpan! Slug aktif: /${slug}`, result.remoteSynced === false ? 'error' : 'success');
  });

  // Day Header Edit Buttons & Click Listeners
  document.getElementById('btn-edit-day1-header')?.addEventListener('click', () => openSpeelwijkDayHeaderModal('1'));
  document.getElementById('speelwijk-rundown-day1-header-subtitle')?.addEventListener('click', () => openSpeelwijkDayHeaderModal('1'));
  document.getElementById('btn-edit-day2-header')?.addEventListener('click', () => openSpeelwijkDayHeaderModal('2'));
  document.getElementById('speelwijk-rundown-day2-header-subtitle')?.addEventListener('click', () => openSpeelwijkDayHeaderModal('2'));

  // Day Header Modal Form Submission
  document.getElementById('form-speelwijk-day-header')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dayNum = document.getElementById('speelwijk-day-header-day-num').value;
    const isDay1 = String(dayNum) === '1';
    const title = document.getElementById('speelwijk-day-header-input-title').value.trim();
    const subtitle = document.getElementById('speelwijk-day-header-input-subtitle').value.trim();
    const date = document.getElementById('speelwijk-day-header-input-date').value.trim();

    const patch = isDay1 ? {
      day1Title: title,
      day1Subtitle: subtitle,
      day1Date: date
    } : {
      day2Title: title,
      day2Subtitle: subtitle,
      day2Date: date
    };

    const payload = { ...cachedSpeelwijkSettings, ...patch };
    const result = await saveSpeelwijkSettings(payload);
    cachedSpeelwijkSettings = payload;

    // Update rundown tab card headers
    const titleEl = document.getElementById(isDay1 ? 'speelwijk-rundown-day1-header-title' : 'speelwijk-rundown-day2-header-title');
    const subtitleEl = document.getElementById(isDay1 ? 'speelwijk-rundown-day1-header-subtitle' : 'speelwijk-rundown-day2-header-subtitle');
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    // Update settings inputs if loaded
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };
    if (isDay1) {
      setVal('setting-speelwijk-day1-title', title);
      setVal('setting-speelwijk-day1-subtitle', subtitle);
      setVal('setting-speelwijk-day1-date', date);
    } else {
      setVal('setting-speelwijk-day2-title', title);
      setVal('setting-speelwijk-day2-subtitle', subtitle);
      setVal('setting-speelwijk-day2-date', date);
    }

    // Update session select options
    const sessionDaySelect = document.getElementById('speelwijk-session-input-day');
    if (sessionDaySelect) {
      const opt = sessionDaySelect.querySelector(`option[value="${dayNum}"]`);
      if (opt) opt.textContent = title;
    }

    document.getElementById('admin-speelwijk-day-header-modal')?.classList.remove('active');
    showToast(result.remoteSynced === false ? 'Header hari tersimpan lokal; sinkronisasi server gagal.' : `Header & Tema Day ${dayNum} berhasil disimpan!`, result.remoteSynced === false ? 'error' : 'success');
  });

  // 8. Speelwijk Partner & Sponsor Form
  document.getElementById('form-speelwijk-partner')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('speelwijk-partner-form-id').value;
    const name = document.getElementById('speelwijk-partner-input-name').value.trim();
    const type = document.getElementById('speelwijk-partner-input-type').value;
    const link_url = document.getElementById('speelwijk-partner-input-link').value.trim();
    const logo_url = document.getElementById('speelwijk-partner-logo-base64').value || '';

    const payload = { id: id || undefined, name, type, logo_url, link_url };
    const result = await saveSpeelwijkPartner(payload);
    showToast(result.remoteSynced === false ? 'Tersimpan lokal; sinkronisasi server gagal.' : (id ? 'Partner / sponsor diperbarui!' : 'Partner / sponsor baru berhasil ditambahkan!'), result.remoteSynced === false ? 'error' : 'success');
    document.getElementById('admin-speelwijk-partner-modal')?.classList.remove('active');
    loadSpeelwijkPartners();
  });

  // 9. Speelwijk Prize Form
  document.getElementById('form-speelwijk-prize')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('speelwijk-prize-form-id').value;
    const category = document.getElementById('speelwijk-prize-input-category').value;
    const rank = document.getElementById('speelwijk-prize-input-rank').value;
    const amount = document.getElementById('speelwijk-prize-input-amount').value.trim();

    const payload = { id: id || undefined, category, rank, amount };
    const result = await saveSpeelwijkPrize(payload);
    showToast(result.remoteSynced === false ? 'Hadiah tersimpan lokal; sinkronisasi server gagal.' : (id ? 'Data hadiah diperbarui!' : 'Data hadiah baru berhasil ditambahkan!'), result.remoteSynced === false ? 'error' : 'success');
    document.getElementById('admin-speelwijk-prize-modal')?.classList.remove('active');
    loadSpeelwijkPrizes();
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
  subscribeToTable('articles', () => loadArticles());
  subscribeToTable('contacts', () => {
    showToast('Transmisi data kontak / pendaftar diterima!', 'info');
    loadContacts();
    loadSpeelwijkRegistrations();
  });
}
