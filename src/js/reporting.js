import {
  getSpeelwijkReporting,
  getSpeelwijkRegistrations,
  getSpeelwijkSettings
} from './supabase.js';

const ACCESS_KEY = 'sms_reporting_access';
const CREDENTIAL_HASH = '637c47c83829d2a6b8d270dd1e2a6c80df0f55e4f32e868c6e8b07c2408b33f0';

const state = {
  reporting: { budget: 40000000, sponsorshipIncome: [], expenses: [] },
  registrations: [],
  settings: {}
};

const $ = (id) => document.getElementById(id);

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0).replace(/\u00a0/g, ' ');
}

function parseAmount(value) {
  return Number(String(value || '').replace(/[^\d]/g, '')) || 0;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

async function digestCredential(username, password) {
  const bytes = new TextEncoder().encode(`${username}\0${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function showLoginError(message = 'Username atau password tidak sesuai.') {
  const error = $('reporting-login-error');
  error.textContent = message;
  error.classList.remove('hidden');
}

function openReportingView() {
  $('login-view').classList.add('hidden-view');
  $('reporting-view').classList.remove('hidden-view');
  loadReport();
}

function showLoginView() {
  $('reporting-view').classList.add('hidden-view');
  $('login-view').classList.remove('hidden-view');
}

function approvedRegistrations() {
  return state.registrations.filter((registration) => ['APPROVED', 'LUNAS', 'TERKONFIRMASI'].includes(String(registration.status || '').toUpperCase()));
}

function renderList(containerId, items, type) {
  const container = $(containerId);
  if (!items.length) {
    container.innerHTML = '<div class="rounded-lg border border-dashed border-surface-variant px-4 py-5 text-center text-sm text-on-surface-variant">Belum ada data tercatat.</div>';
    return;
  }

  container.innerHTML = items.map((item) => {
    const title = type === 'sponsorship' ? item.sponsor : item.category;
    const description = type === 'sponsorship' ? item.notes : item.description;
    const nonCash = type === 'sponsorship' && item.type === 'in-kind';
    const badge = type === 'sponsorship' ? `<span class="ml-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${nonCash ? 'bg-blue-950/60 text-blue-200' : 'bg-primary-container/15 text-primary-container'}">${nonCash ? 'NON-TUNAI' : 'TUNAI'}</span>` : '';
    return `<div class="flex items-start justify-between gap-4 rounded-lg border border-surface-variant bg-surface-container-high px-4 py-3">
      <div class="min-w-0"><div class="truncate font-bold text-white">${escapeHtml(title || 'Tanpa nama')} ${badge}</div>
      <div class="mt-1 text-xs text-on-surface-variant">${escapeHtml(item.date || '-')}</div>
      ${description ? `<div class="mt-1 text-xs text-on-surface-variant">${escapeHtml(description)}</div>` : ''}</div>
      <div class="shrink-0 text-right font-bold ${type === 'sponsorship' ? (nonCash ? 'text-blue-200' : 'text-primary-container') : 'text-red-300'}">${formatCurrency(item.amount)}${nonCash ? '<div class="text-[9px] font-normal text-on-surface-variant">nilai estimasi</div>' : ''}</div>
    </div>`;
  }).join('');
}

function renderReport() {
  const sponsorship = Array.isArray(state.reporting.sponsorshipIncome) ? state.reporting.sponsorshipIncome : [];
  const expenses = Array.isArray(state.reporting.expenses) ? state.reporting.expenses : [];
  const approved = approvedRegistrations();
  const registrationFee = parseAmount(state.settings.fee);
  const cashSponsorship = sponsorship.filter((item) => item.type !== 'in-kind');
  const nonCashSponsorship = sponsorship.filter((item) => item.type === 'in-kind');
  const sponsorshipTotal = cashSponsorship.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const nonCashSponsorshipTotal = nonCashSponsorship.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const registrationTotal = approved.length * registrationFee;
  const totalIncome = sponsorshipTotal + registrationTotal;
  const totalExpenses = expenses.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const balance = totalIncome - totalExpenses;
  const budget = parseAmount(state.reporting.budget);
  const progress = budget > 0 ? Math.min(100, Math.max(0, (totalIncome / budget) * 100)) : 0;

  setText('reporting-budget', formatCurrency(budget));
  setText('reporting-sponsorship', formatCurrency(sponsorshipTotal));
  setText('reporting-sponsorship-count', `${sponsorship.length} transaksi · ${nonCashSponsorship.length} non-tunai`);
  setText('reporting-sponsorship-noncash', formatCurrency(nonCashSponsorshipTotal));
  setText('reporting-registration', formatCurrency(registrationTotal));
  setText('reporting-registration-count', `${approved.length} pilot approved · ${formatCurrency(registrationFee)}/slot`);
  setText('reporting-balance', formatCurrency(balance));
  setText('reporting-total-income', formatCurrency(totalIncome));
  setText('reporting-total-expenses', formatCurrency(totalExpenses));
  setText('reporting-total-balance', formatCurrency(balance));
  setText('reporting-progress-label', `${progress.toFixed(1)}% dari budget terealisasi`);
  $('reporting-progress').style.width = `${progress}%`;
  $('reporting-last-updated').textContent = `Diperbarui ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}`;
  renderList('reporting-sponsorship-list', sponsorship, 'sponsorship');
  renderList('reporting-expense-list', expenses, 'expense');
}

async function loadReport() {
  const refreshButton = $('reporting-refresh-btn');
  refreshButton.disabled = true;
  refreshButton.classList.add('opacity-60');
  $('reporting-last-updated').textContent = 'Mengambil data terbaru...';
  try {
    const [reporting, registrations, settings] = await Promise.all([
      getSpeelwijkReporting(),
      getSpeelwijkRegistrations(),
      getSpeelwijkSettings()
    ]);
    state.reporting = reporting;
    state.registrations = Array.isArray(registrations) ? registrations : [];
    state.settings = settings || {};
    renderReport();
  } catch (error) {
    $('reporting-last-updated').textContent = 'Data gagal dimuat';
    showToast(`Gagal memuat reporting: ${error.message}`);
  } finally {
    refreshButton.disabled = false;
    refreshButton.classList.remove('opacity-60');
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  $('reporting-login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = $('reporting-username').value.trim();
    const password = $('reporting-password').value;
    const loginButton = event.currentTarget.querySelector('button[type="submit"]');
    loginButton.disabled = true;
    try {
      const hash = await digestCredential(username, password);
      if (hash !== CREDENTIAL_HASH) {
        showLoginError();
        return;
      }
      sessionStorage.setItem(ACCESS_KEY, 'granted');
      $('reporting-login-error').classList.add('hidden');
      openReportingView();
    } finally {
      loginButton.disabled = false;
    }
  });

  $('reporting-refresh-btn').addEventListener('click', loadReport);
  $('reporting-logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem(ACCESS_KEY);
    $('reporting-login-form').reset();
    showLoginView();
  });

  if (sessionStorage.getItem(ACCESS_KEY) === 'granted') openReportingView();
});
