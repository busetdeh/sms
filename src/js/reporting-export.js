function parseAmount(value) {
  return Number(String(value ?? '').replace(/[^0-9-]/g, '')) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function typeLabel(item) {
  return item.type === 'in-kind' ? 'Non-tunai (barang/jasa)' : 'Tunai';
}

function getSnapshot({ reporting = {}, registrations = [], settings = {}, sponsorshipFilter = 'all' } = {}) {
  const sponsorship = Array.isArray(reporting.sponsorshipIncome) ? reporting.sponsorshipIncome : [];
  const expenses = Array.isArray(reporting.expenses) ? reporting.expenses : [];
  const approved = (Array.isArray(registrations) ? registrations : []).filter((item) => ['APPROVED', 'LUNAS', 'TERKONFIRMASI'].includes(String(item.status || '').toUpperCase()));
  const visibleSponsorship = sponsorshipFilter === 'all'
    ? sponsorship
    : sponsorship.filter((item) => (item.type === 'in-kind' ? 'in-kind' : 'cash') === sponsorshipFilter);
  const cashSponsorship = sponsorship.filter((item) => item.type !== 'in-kind');
  const nonCashSponsorship = sponsorship.filter((item) => item.type === 'in-kind');
  const cashSponsorshipTotal = cashSponsorship.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const nonCashSponsorshipTotal = nonCashSponsorship.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const registrationFee = parseAmount(settings.fee);
  const registrationTotal = approved.length * registrationFee;
  const totalIncome = cashSponsorshipTotal + registrationTotal;
  const expenseTotal = expenses.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  return {
    budget: parseAmount(reporting.budget),
    sponsorship,
    visibleSponsorship,
    expenses,
    approvedCount: approved.length,
    registrationFee,
    cashSponsorshipTotal,
    nonCashSponsorshipTotal,
    registrationTotal,
    totalIncome,
    expenseTotal,
    balance: totalIncome - expenseTotal,
    sponsorshipFilter
  };
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportReportingCsv(options = {}) {
  const snapshot = getSnapshot(options);
  const rows = [
    ['REPORTING EVENT', 'Fly Through History – Benteng Speelwijk FPV Drone Fest 2026'],
    ['Dibuat', new Date().toLocaleString('id-ID')],
    ['Filter sponsorship', snapshot.sponsorshipFilter === 'all' ? 'Semua' : snapshot.sponsorshipFilter === 'cash' ? 'Tunai' : 'Non-tunai'],
    [],
    ['RINGKASAN'],
    ['Budget Event (Rp)', snapshot.budget],
    ['Sponsorship Tunai (Rp)', snapshot.cashSponsorshipTotal],
    ['Sponsorship Non-tunai - estimasi (Rp)', snapshot.nonCashSponsorshipTotal],
    ['Pilot Approved', snapshot.approvedCount],
    ['Pendapatan Pendaftaran (Rp)', snapshot.registrationTotal],
    ['Total Pendapatan Kas (Rp)', snapshot.totalIncome],
    ['Total Pengeluaran (Rp)', snapshot.expenseTotal],
    ['Saldo Akhir (Rp)', snapshot.balance],
    [],
    ['PEMASUKAN SPONSORSHIP'],
    ['Sponsor', 'Jenis', 'Tanggal', 'Nilai (Rp)', 'Catatan']
  ];
  snapshot.visibleSponsorship.forEach((item) => rows.push([item.sponsor, typeLabel(item), item.date || '', parseAmount(item.amount), item.notes || '']));
  rows.push([], ['PENGELUARAN'], ['Kategori', 'Deskripsi', 'Tanggal', 'Nominal (Rp)', 'Catatan']);
  snapshot.expenses.forEach((item) => rows.push([item.category, item.description, item.date || '', parseAmount(item.amount), item.notes || '']));
  const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  downloadBlob(csv, `reporting-speelwijk-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
}

function printTableRows(rows, emptyMessage) {
  if (!rows.length) return `<tr><td colspan="5" class="empty">${emptyMessage}</td></tr>`;
  return rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? '-')}</td>`).join('')}</tr>`).join('');
}

export function printReportingPdf(options = {}) {
  const snapshot = getSnapshot(options);
  const filterLabel = snapshot.sponsorshipFilter === 'all' ? 'Semua' : snapshot.sponsorshipFilter === 'cash' ? 'Tunai' : 'Non-tunai';
  const sponsorRows = snapshot.visibleSponsorship.map((item) => [item.sponsor, typeLabel(item), item.date || '-', formatCurrency(item.amount), item.notes || '-']);
  const expenseRows = snapshot.expenses.map((item) => [item.category, item.description, item.date || '-', formatCurrency(item.amount), item.notes || '-']);
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    window.alert('Popup diblokir browser. Izinkan popup untuk mencetak PDF.');
    return;
  }
  printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Reporting Speelwijk</title><style>
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#202020;margin:32px;font-size:11px}h1{margin:0 0 4px;font-size:22px}h2{margin:24px 0 8px;font-size:14px;border-bottom:2px solid #222;padding-bottom:5px}.meta{color:#555;margin-bottom:20px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0 20px}.card{border:1px solid #bbb;padding:10px;border-radius:4px}.label{font-size:9px;color:#666;text-transform:uppercase}.value{font-size:15px;font-weight:700;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #bbb;padding:7px;text-align:left;vertical-align:top}th{background:#eee;font-size:10px}td:nth-child(4),th:nth-child(4){text-align:right}.empty{text-align:center;color:#777;padding:14px}.note{color:#666;margin-top:18px;font-size:10px}@media print{body{margin:14mm}.no-print{display:none}.summary{grid-template-columns:repeat(4,1fr)}}
  </style></head><body><h1>EVENT REPORTING</h1><div class="meta">Fly Through History – Benteng Speelwijk FPV Drone Fest 2026 · 17–18 Oktober 2026<br>Dibuat: ${new Date().toLocaleString('id-ID')} · Filter sponsorship: ${filterLabel}</div>
  <div class="summary"><div class="card"><div class="label">Budget Event</div><div class="value">${formatCurrency(snapshot.budget)}</div></div><div class="card"><div class="label">Pendapatan Kas</div><div class="value">${formatCurrency(snapshot.totalIncome)}</div></div><div class="card"><div class="label">Pengeluaran</div><div class="value">${formatCurrency(snapshot.expenseTotal)}</div></div><div class="card"><div class="label">Saldo Akhir</div><div class="value">${formatCurrency(snapshot.balance)}</div></div></div>
  <div class="summary"><div class="card"><div class="label">Sponsorship Tunai</div><div class="value">${formatCurrency(snapshot.cashSponsorshipTotal)}</div></div><div class="card"><div class="label">Non-tunai Estimasi</div><div class="value">${formatCurrency(snapshot.nonCashSponsorshipTotal)}</div></div><div class="card"><div class="label">Pilot Approved</div><div class="value">${snapshot.approvedCount}</div></div><div class="card"><div class="label">Pendaftaran</div><div class="value">${formatCurrency(snapshot.registrationTotal)}</div></div></div>
  <h2>Pemasukan Sponsorship</h2><table><thead><tr><th>Sponsor</th><th>Jenis</th><th>Tanggal</th><th>Nilai</th><th>Catatan</th></tr></thead><tbody>${printTableRows(sponsorRows, 'Belum ada pemasukan sponsorship')}</tbody></table>
  <h2>Pengeluaran Event</h2><table><thead><tr><th>Kategori</th><th>Deskripsi</th><th>Tanggal</th><th>Nominal</th><th>Catatan</th></tr></thead><tbody>${printTableRows(expenseRows, 'Belum ada pengeluaran')}</tbody></table><div class="note">Catatan: nilai sponsorship non-tunai adalah estimasi dan tidak dihitung sebagai saldo kas.</div><script>window.onload=()=>{window.focus();window.print();};</script></body></html>`);
  printWindow.document.close();
}
