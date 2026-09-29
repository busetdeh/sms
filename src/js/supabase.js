/**
 * Supabase Client & Data Integration for Sky Multirotor Squad
 * Handles authentication, dynamic fetching, realtime synchronization, and full CRUD operations.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://pgptktwaqnzrvmsjkbun.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncHRrdHdhcW56cnZtc2prYnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcxMjMsImV4cCI6MjEwMTkzMzEyM30.CHB-vtEFCBNSzDzPUIm5xEneHvnDX8TL7WoUZ9n-PvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION METHODS                                                     */
/* -------------------------------------------------------------------------- */

export async function adminLogin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal login. Periksa email & password.' };
  }
}

export async function adminLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAdminUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    return null;
  }
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (typeof callback === 'function') {
      callback(event, session);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* EVENTS CRUD                                                                */
/* -------------------------------------------------------------------------- */

export async function getSupabaseEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Events fetch error:', err.message);
    return null;
  }
}

export async function createSupabaseEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseEvent(id, eventData) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseEvent(id) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* PILOTS CRUD                                                                */
/* -------------------------------------------------------------------------- */

export async function getSupabasePilots() {
  try {
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Pilots fetch error:', err.message);
    return null;
  }
}

export async function createSupabasePilot(pilotData) {
  try {
    const { data, error } = await supabase
      .from('pilots')
      .insert([pilotData])
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateSupabasePilot(id, pilotData) {
  try {
    const { data, error } = await supabase
      .from('pilots')
      .update(pilotData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabasePilot(id) {
  try {
    const { error } = await supabase
      .from('pilots')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* FLYING SPOTS CRUD                                                          */
/* -------------------------------------------------------------------------- */

export async function getSupabaseSpots() {
  try {
    const { data, error } = await supabase
      .from('flying_spots')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Spots fetch error:', err.message);
    return null;
  }
}

export async function createSupabaseSpot(spotData) {
  try {
    const { data, error } = await supabase
      .from('flying_spots')
      .insert([spotData])
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseSpot(id, spotData) {
  try {
    const { data, error } = await supabase
      .from('flying_spots')
      .update(spotData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseSpot(id) {
  try {
    const { error } = await supabase
      .from('flying_spots')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* GALLERY CRUD                                                               */
/* -------------------------------------------------------------------------- */

export async function getSupabaseGallery() {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Gallery fetch error:', err.message);
    return null;
  }
}

export async function createSupabaseGalleryItem(itemData) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([itemData])
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseGalleryItem(id, itemData) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .update(itemData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseGalleryItem(id) {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* BLOG & ARTICLES CRUD                                                       */
/* -------------------------------------------------------------------------- */

export async function getSupabaseArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Articles fetch error:', err.message);
    return null;
  }
}

export async function createSupabaseArticle(articleData) {
  try {
    const { data, error } = await supabase.from('articles').insert([articleData]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseArticle(id, articleData) {
  try {
    const { data, error } = await supabase.from('articles').update(articleData).eq('id', id).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseArticle(id) {
  try {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* CONTACTS / INBOX CRUD                                                      */
/* -------------------------------------------------------------------------- */

export async function getSupabaseContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.filter(item => item.name !== 'SPEELWIJK_PARTNERS_CONFIG');
  } catch (err) {
    console.warn('Contacts fetch error:', err.message);
    return null;
  }
}

export async function submitSupabaseContact(contactData) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData]);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseContact(id) {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* -------------------------------------------------------------------------- */
/* STORAGE FILE UPLOAD                                                        */
/* -------------------------------------------------------------------------- */

export async function uploadSupabaseFile(bucketName, file, customFolder = 'pilots') {
  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `${customFolder}/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn(`Supabase Storage upload error for bucket '${bucketName}':`, error.message);
      return { success: false, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: filePath,
      publicUrl: publicData.publicUrl
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
/* -------------------------------------------------------------------------- */
/* REALTIME SUBSCRIPTION                                                      */
/* -------------------------------------------------------------------------- */

export function subscribeToTable(tableName, onUpdateCallback) {
  try {
    return supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(payload);
        }
      })
      .subscribe();
  } catch (err) {
    console.warn(`Could not subscribe to table ${tableName}:`, err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* BENTENG SPEELWIJK EVENT CRUD                                               */
/* -------------------------------------------------------------------------- */

// Default Seed Rundown
const DEFAULT_SPEELWIJK_RUNDOWN = [
  { id: 'session_1', day: '1', time: '08:00 WIB', title: 'Registrasi & Safety Briefing', desc: 'Pemeriksaan failsafe, VTX channel lock, dan safety check baterai LiPo.' },
  { id: 'session_2', day: '1', time: '09:00 WIB', title: 'Open Practice & Track Preview', desc: 'Pengenalan layout lintasan reruntuhan Speelwijk, gate tunnel bastion, dan line shooting.' },
  { id: 'session_3', day: '1', time: '11:30 WIB', title: 'Kualifikasi Time Attack (Heat 1-4)', desc: 'Pencatatan lap time resmi 3 lap berturut-turut untuk seeding bracket turnamen.' },
  { id: 'session_4', day: '1', time: '16:00 WIB', title: 'Cinematic Sunset Golden Hour', desc: 'Sesi terbang sinematik bebas mengabadikan siluet menara dan dinding benteng saat senja.' },
  { id: 'session_5', day: '2', time: '08:30 WIB', title: 'Warm-up & Eliminasi Ganda', desc: 'Babak gugur 16 besar kelas 5-Inch Open dan 3.5-Inch Freestyle precision.' },
  { id: 'session_6', day: '2', time: '13:00 WIB', title: 'Semifinal & Final Battle', desc: 'Pertarungan puncak memperebutkan Trophy Juara Benteng Speelwijk Drone Fest 2026.' },
  { id: 'session_8', day: '2', time: '14:30 WIB', title: 'Historical Touring', desc: 'Tour sejarah & budaya untuk seluruh peserta menuju reruntuhan Istana Kaibon, Istana Surosowan, dan Pantai Karangantu & Pantai Gope' },
  { id: 'session_7', day: '2', time: '17:00 WIB', title: 'Podium & Closing Ceremony', desc: 'Penyerahan piala, sertifikat kehormatan skuad, dan foto bersama seluruh pilot & komunitas.' }
];

function normalizeSpeelwijkRundown(value) {
  const source = Array.isArray(value) ? value : [];
  const nextOrderByDay = {};
  const rundown = source.map((item, index) => {
    const day = String(item.day || '1');
    const providedOrder = Number(item.display_order);
    const fallbackOrder = (nextOrderByDay[day] || 0) + 1;
    const displayOrder = providedOrder > 0 ? providedOrder : fallbackOrder;
    nextOrderByDay[day] = Math.max(nextOrderByDay[day] || 0, displayOrder);
    return { ...item, id: item.id || `session_${index + 1}`, day, display_order: displayOrder };
  });

  return rundown.sort((a, b) => String(a.day).localeCompare(String(b.day)) || a.display_order - b.display_order);
}

// Default Settings
const DEFAULT_SPEELWIJK_SETTINGS = {
  title: 'Fly Through History',
  subtitle: 'Benteng Speelwijk Drone Fest 2026',
  slug: 'sms-fly-through-history',
  date: '17 - 18 Oktober 2026',
  day1Title: 'DAY 01 (17 OKTOBER 2026)',
  day1Subtitle: 'KUALIFIKASI & EKSIBISI',
  day1Date: '17 OKTOBER 2026',
  day2Title: 'DAY 02 (18 OKTOBER 2026)',
  day2Subtitle: 'SEMIFINAL & GRAND FINAL',
  day2Date: '18 OKTOBER 2026',
  fee: 'Rp 200.000',
  registrationBenefits: 'Termasuk Pit Access, Frekuensi Slot, Tenda Camping, Official Jersey & Konsumsi 2 Hari',
  waNumber: '6287772272928',
  location: 'Benteng Speelwijk, Banten Lama',
  coords: "6°01'59\"S 106°09'14\"E",
  desc: 'Drone FPV ngebut dan meliuk menembus reruntuhan bersejarah Benteng Speelwijk — pertama kalinya kompetisi presisi dan misi terbang sinematik digelar di kawasan cagar budaya Banten-Indonesia.',
  missionIntro: 'Acara ini mempertemukan dua dunia: pelestarian warisan Kesultanan Banten dan teknologi drone modern. Lewat FPV racing dan sinematografi udara resolusi tinggi.',
  missionPilot: 'Buat para pilot, ini pengalaman terbang yang beda dari biasanya — meliuk di antara gapura batu berusia 4 abad, dengan jalur manuver ketat dan pengaturan frekuensi radio (analog maupun digital HD) yang diawasi ketat demi keamanan bersama.',
  qrisMerchant: 'Sky Multirotor Squad',
  qrisNmid: 'ID1020038849502',
  qrisImageUrl: '',
  bankName: 'BCA (Bank Central Asia)',
  bankAccount: '883-091-2839',
  bankHolder: 'SKY MULTIROTOR SQUAD',
  paymentInstructions: 'Setelah menekan tombol "KIRIM PENDAFTARAN & RSVP", data pendaftaran Anda akan otomatis tercatat di sistem dan admin panitia SMS akan segera mengirimkan konfirmasi slot via WhatsApp resmi.'
};

// 1. Registrations CRUD
export async function getSpeelwijkRegistrations() {
  try {
    // Check contacts table first where interest_type marks event registrations
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('interest_type', 'EVENT_SPEELWIJK_2026')
      .order('created_at', { ascending: false });

    if (!contactError && contactData && contactData.length > 0) {
      return contactData.map(c => {
        let details = {};
        try { details = JSON.parse(c.message); } catch (e) { details = { raw: c.message }; }
        return {
          id: c.id,
          name: c.name || details.name || 'Pilot Speelwijk',
          callsign: details.callsign || '-',
          phone: c.phone_wa || details.phone || '-',
          email: c.email || details.email || '-',
          category: details.category || 'Cinematic FPV',
          paymentMethod: details.paymentMethod || 'QRIS',
          status: details.status || 'PENDING',
          notes: details.notes || '',
          paymentProof: details.paymentProof || '',
          created_at: c.created_at
        };
      });
    }

    // Fallback to local storage
    const local = localStorage.getItem('sms_speelwijk_registrations');
    if (local) {
      return JSON.parse(local);
    }

    // Default mock data if empty
    const seed = [
      {
        id: 'speel_reg_1',
        name: 'Rhaka Guntur Pratama',
        callsign: 'NIGHT_HAWK',
        phone: '087772272928',
        email: 'rhakaguntur@gmail.com',
        category: 'Cinematic FPV',
        paymentMethod: 'QRIS',
        status: 'LUNAS',
        notes: 'Slot 01 - Lunas via QRIS Panitia',
        paymentProof: '',
        created_at: new Date().toISOString()
      },
      {
        id: 'speel_reg_2',
        name: 'Juang Pratama',
        callsign: 'RED_FOX',
        phone: '081234567890',
        email: 'juang@skymultirotor.com',
        category: 'Cinewhoop Race',
        paymentMethod: 'Transfer Bank BCA',
        status: 'LUNAS',
        notes: 'Slot 02 - Verified',
        paymentProof: '',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('sms_speelwijk_registrations', JSON.stringify(seed));
    return seed;
  } catch (err) {
    console.warn('Error fetching Speelwijk registrations:', err.message);
    const local = localStorage.getItem('sms_speelwijk_registrations');
    return local ? JSON.parse(local) : [];
  }
}

export async function saveSpeelwijkRegistration(regData) {
  const isEdit = Boolean(regData.id);
  const localId = regData.id || `speel_reg_${Date.now()}`;
  const payload = {
    ...regData,
    id: localId,
    created_at: regData.created_at || new Date().toISOString()
  };

  try {
    // Save to contacts in Supabase for persistence
    const contactPayload = {
      name: regData.name,
      phone_wa: regData.phone,
      email: regData.email,
      interest_type: 'EVENT_SPEELWIJK_2026',
      message: JSON.stringify({
        callsign: regData.callsign,
        category: regData.category,
        paymentMethod: regData.paymentMethod,
        status: regData.status,
        notes: regData.notes,
        paymentProof: regData.paymentProof
      })
    };

    let remoteRow = null;
    if (isEdit && typeof regData.id === 'string' && regData.id.includes('-')) {
      const { data, error } = await supabase
        .from('contacts')
        .update(contactPayload)
        .eq('id', regData.id)
        .select()
        .single();
      if (error) throw error;
      remoteRow = data;
    } else if (!isEdit) {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactPayload])
        .select()
        .single();
      if (error) throw error;
      remoteRow = data;
    }

    if (remoteRow?.id) payload.id = remoteRow.id;

    // Sync to local storage
    const current = await getSpeelwijkRegistrations();
    let updated;
    if (isEdit) {
      updated = current.map(item => item.id === localId ? payload : item);
      if (!updated.some(item => item.id === payload.id)) updated.unshift(payload);
    } else {
      updated = current.some(item => item.id === payload.id) ? current : [payload, ...current];
    }
    localStorage.setItem('sms_speelwijk_registrations', JSON.stringify(updated));

    return { success: true, data: payload, remoteSynced: true };
  } catch (err) {
    console.warn('Save Speelwijk registration error:', err.message);
    // Keep a local copy for recovery, but make the failed server sync explicit.
    const current = JSON.parse(localStorage.getItem('sms_speelwijk_registrations') || '[]');
    const updated = isEdit
      ? current.map(item => item.id === localId ? payload : item)
      : [payload, ...current];
    localStorage.setItem('sms_speelwijk_registrations', JSON.stringify(updated));
    return { success: true, data: payload, remoteSynced: false, error: err.message };
  }
}

export async function deleteSpeelwijkRegistration(id) {
  try {
    if (typeof id === 'string' && id.includes('-')) {
      await supabase.from('contacts').delete().eq('id', id);
    }
    const current = await getSpeelwijkRegistrations();
    const filtered = current.filter(item => item.id !== id);
    localStorage.setItem('sms_speelwijk_registrations', JSON.stringify(filtered));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 2. Rundown CRUD
async function getSpeelwijkConfigRemote(name) {
  const { data, error } = await supabase
    .from('contacts')
    .select('message')
    .eq('name', name)
    .limit(1);
  if (error) throw error;
  if (!data?.[0]?.message) return null;
  return JSON.parse(data[0].message);
}

async function saveSpeelwijkConfigRemote(name, value) {
  const { data: existing, error: selectError } = await supabase
    .from('contacts')
    .select('id')
    .eq('name', name)
    .limit(1);
  if (selectError) throw selectError;

  const payload = {
    name,
    message: JSON.stringify(value),
    email: 'system@sms.local',
    phone_wa: ''
  };
  const result = existing?.[0]
    ? await supabase.from('contacts').update(payload).eq('id', existing[0].id)
    : await supabase.from('contacts').insert([payload]);
  if (result.error) throw result.error;
}

export async function getSpeelwijkRundown({ migrateLocal = false } = {}) {
  try {
    const remote = await getSpeelwijkConfigRemote('SPEELWIJK_RUNDOWN_CONFIG');
    if (Array.isArray(remote)) {
      const rundown = normalizeSpeelwijkRundown(remote);
      localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(rundown));
      return rundown;
    }
  } catch (error) {
    console.warn('Remote rundown config fetch error:', error.message);
  }

  const local = localStorage.getItem('sms_speelwijk_rundown');
  let rundown = DEFAULT_SPEELWIJK_RUNDOWN;
  if (local) {
    try { rundown = normalizeSpeelwijkRundown(JSON.parse(local)); } catch (e) { /* use defaults */ }
  } else {
    rundown = normalizeSpeelwijkRundown(rundown);
    localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(rundown));
  }

  if (migrateLocal) {
    try { await saveSpeelwijkConfigRemote('SPEELWIJK_RUNDOWN_CONFIG', rundown); } catch (error) {
      console.warn('Rundown config migration error:', error.message);
    }
  }
  return rundown;
}

export async function saveSpeelwijkRundownItem(sessionData) {
  const isEdit = Boolean(sessionData.id);
  const id = sessionData.id || `session_${Date.now()}`;
  const current = await getSpeelwijkRundown();
  const existing = current.find(item => item.id === id);
  const day = String(sessionData.day || existing?.day || '1');
  const nextOrder = current.filter(item => String(item.day) === day).length + 1;
  const payload = { ...sessionData, id, day, display_order: Number(sessionData.display_order) || existing?.display_order || nextOrder };
  let updated;
  if (isEdit) {
    updated = current.map(item => item.id === id ? payload : item);
  } else {
    updated = [...current, payload];
  }
  const normalized = normalizeSpeelwijkRundown(updated);
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(normalized));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_RUNDOWN_CONFIG', normalized);
    return { success: true, data: payload, remoteSynced: true };
  } catch (error) {
    console.warn('Rundown config remote save error:', error.message);
    return { success: true, data: payload, remoteSynced: false, error: error.message };
  }
}

export async function deleteSpeelwijkRundownItem(id) {
  const current = await getSpeelwijkRundown();
  const filtered = normalizeSpeelwijkRundown(current.filter(item => item.id !== id));
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(filtered));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_RUNDOWN_CONFIG', filtered);
    return { success: true, remoteSynced: true };
  } catch (error) {
    console.warn('Rundown config remote delete error:', error.message);
    return { success: true, remoteSynced: false, error: error.message };
  }
}

export async function reorderSpeelwijkRundown(items) {
  const normalized = normalizeSpeelwijkRundown(items);
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(normalized));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_RUNDOWN_CONFIG', normalized);
    return { success: true, data: normalized, remoteSynced: true };
  } catch (error) {
    console.warn('Rundown order remote save error:', error.message);
    return { success: true, data: normalized, remoteSynced: false, error: error.message };
  }
}

// 3. Settings CRUD
export async function getSpeelwijkSettings({ migrateLocal = false } = {}) {
  try {
    const remote = await getSpeelwijkConfigRemote('SPEELWIJK_SETTINGS_CONFIG');
    if (remote && typeof remote === 'object' && !Array.isArray(remote)) {
      const settings = { ...DEFAULT_SPEELWIJK_SETTINGS, ...remote };
      localStorage.setItem('sms_speelwijk_settings', JSON.stringify(settings));
      return settings;
    }
  } catch (error) {
    console.warn('Remote event settings fetch error:', error.message);
  }

  const local = localStorage.getItem('sms_speelwijk_settings');
  let settings = DEFAULT_SPEELWIJK_SETTINGS;
  if (local) {
    try { settings = { ...DEFAULT_SPEELWIJK_SETTINGS, ...JSON.parse(local) }; } catch (e) { /* use defaults */ }
  } else {
    localStorage.setItem('sms_speelwijk_settings', JSON.stringify(settings));
  }

  if (migrateLocal) {
    try { await saveSpeelwijkConfigRemote('SPEELWIJK_SETTINGS_CONFIG', settings); } catch (error) {
      console.warn('Event settings migration error:', error.message);
    }
  }
  return settings;
}

export async function saveSpeelwijkSettings(settingsData) {
  const payload = { ...DEFAULT_SPEELWIJK_SETTINGS, ...settingsData };
  localStorage.setItem('sms_speelwijk_settings', JSON.stringify(payload));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_SETTINGS_CONFIG', payload);
    return { success: true, data: payload, remoteSynced: true };
  } catch (error) {
    console.warn('Event settings remote save error:', error.message);
    return { success: true, data: payload, remoteSynced: false, error: error.message };
  }
}

// 4. Partners & Sponsors CRUD
const DEFAULT_SPEELWIJK_PARTNERS = [
  { id: 'p1', name: 'AERO_TECH_CORP', type: 'sponsor', logo_url: '' },
  { id: 'p2', name: 'HORIZON_DYNAMICS', type: 'sponsor', logo_url: '' },
  { id: 'p3', name: 'HERITAGE_TRUST', type: 'sponsor', logo_url: '' },
  { id: 'p4', name: 'BANTEN_GOV', type: 'supporter', logo_url: '' },
  { id: 'p5', name: 'DRONE_FED', type: 'supporter', logo_url: '' },
  { id: 'p6', name: 'SKY_OPTICS', type: 'supporter', logo_url: '' },
  { id: 'p7', name: 'LIPO_CELL', type: 'supporter', logo_url: '' },
  { id: 'p8', name: 'PROP_MASTER', type: 'supporter', logo_url: '' },
  { id: 'p9', name: 'RADIO_LINK', type: 'supporter', logo_url: '' }
];

function normalizeSpeelwijkPartners(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => ({
    ...item,
    id: item.id || `partner_${index + 1}`,
    display_order: Number(item.display_order) || index + 1
  })).sort((a, b) => a.display_order - b.display_order);
}

async function saveSpeelwijkPartnersRemote(partners) {
  const { data: existing, error: selectError } = await supabase
    .from('contacts')
    .select('id')
    .eq('name', 'SPEELWIJK_PARTNERS_CONFIG')
    .limit(1);
  if (selectError) throw selectError;

  const payload = {
    name: 'SPEELWIJK_PARTNERS_CONFIG',
    message: JSON.stringify(partners),
    email: 'system@sms.local',
    phone_wa: ''
  };
  const { error } = existing?.[0]
    ? await supabase.from('contacts').update(payload).eq('id', existing[0].id)
    : await supabase.from('contacts').insert([payload]);
  if (error) throw error;
}

export async function getSpeelwijkPartners({ migrateLocal = false } = {}) {
  try {
    const { data: remoteRows, error } = await supabase
      .from('contacts')
      .select('message')
      .eq('name', 'SPEELWIJK_PARTNERS_CONFIG')
      .limit(1);
    if (error) throw error;
    if (remoteRows?.[0]?.message) {
      const remotePartners = JSON.parse(remoteRows[0].message);
      if (Array.isArray(remotePartners)) {
        const partners = normalizeSpeelwijkPartners(remotePartners);
        localStorage.setItem('sms_speelwijk_partners', JSON.stringify(partners));
        return partners;
      }
    }
  } catch (error) {
    console.warn('Remote sponsor config fetch error:', error.message);
  }

  const local = localStorage.getItem('sms_speelwijk_partners');
  let partners = normalizeSpeelwijkPartners(DEFAULT_SPEELWIJK_PARTNERS);
  if (local) {
    try { partners = normalizeSpeelwijkPartners(JSON.parse(local)); } catch (e) { /* use defaults */ }
  } else {
    localStorage.setItem('sms_speelwijk_partners', JSON.stringify(partners));
  }

  if (migrateLocal) {
    try { await saveSpeelwijkPartnersRemote(partners); } catch (error) {
      console.warn('Sponsor config migration error:', error.message);
    }
  }
  return partners;
}

export async function saveSpeelwijkPartner(partnerData) {
  const current = await getSpeelwijkPartners({ migrateLocal: true });
  const existing = current.find(partner => partner.id === partnerData.id);
  const payload = {
    ...partnerData,
    id: partnerData.id || `p_${Math.random().toString(36).substr(2, 9)}`,
    display_order: Number(partnerData.display_order) || existing?.display_order || current.length + 1
  };
  const idx = current.findIndex(p => p.id === payload.id);
  if (idx !== -1) current[idx] = { ...current[idx], ...payload };
  else current.push(payload);
  const normalized = normalizeSpeelwijkPartners(current);
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(normalized));
  try {
    await saveSpeelwijkPartnersRemote(normalized);
    return { success: true, data: payload, remoteSynced: true };
  } catch (error) {
    console.warn('Sponsor config remote save error:', error.message);
    return { success: true, data: payload, remoteSynced: false, error: error.message };
  }
}

export async function deleteSpeelwijkPartner(id) {
  const current = await getSpeelwijkPartners({ migrateLocal: true });
  const filtered = normalizeSpeelwijkPartners(current.filter(p => p.id !== id));
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(filtered));
  try {
    await saveSpeelwijkPartnersRemote(filtered);
    return { success: true, remoteSynced: true };
  } catch (error) {
    console.warn('Sponsor config remote delete error:', error.message);
    return { success: true, remoteSynced: false, error: error.message };
  }
}

export async function reorderSpeelwijkPartners(items) {
  const normalized = normalizeSpeelwijkPartners(items);
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(normalized));
  try {
    await saveSpeelwijkPartnersRemote(normalized);
    return { success: true, data: normalized, remoteSynced: true };
  } catch (error) {
    console.warn('Partner order remote save error:', error.message);
    return { success: true, data: normalized, remoteSynced: false, error: error.message };
  }
}

/* 5. Booths & Facilities CRUD */
const DEFAULT_SPEELWIJK_BOOTHS = [];

function normalizeSpeelwijkBooths(value) {
  if (!Array.isArray(value)) return DEFAULT_SPEELWIJK_BOOTHS;
  return value.map((item, index) => ({
    id: item.id || `booth_${index + 1}`,
    name: String(item.name || '').trim(),
    type: item.type === 'facility' ? 'facility' : 'merchant',
    description: String(item.description || '').trim(),
    location: String(item.location || '').trim(),
    status: item.status === 'inactive' ? 'inactive' : 'active',
    contact: String(item.contact || '').trim(),
    link_url: String(item.link_url || '').trim(),
    display_order: Number(item.display_order) || index + 1
  })).sort((a, b) => a.display_order - b.display_order);
}

export async function getSpeelwijkBooths({ migrateLocal = false } = {}) {
  try {
    const remote = await getSpeelwijkConfigRemote('SPEELWIJK_BOOTHS_CONFIG');
    if (Array.isArray(remote)) {
      const booths = normalizeSpeelwijkBooths(remote);
      localStorage.setItem('sms_speelwijk_booths', JSON.stringify(booths));
      return booths;
    }
  } catch (error) {
    console.warn('Remote booth config fetch error:', error.message);
  }

  const local = localStorage.getItem('sms_speelwijk_booths');
  let booths = DEFAULT_SPEELWIJK_BOOTHS;
  if (local) {
    try { booths = normalizeSpeelwijkBooths(JSON.parse(local)); } catch (error) { /* use defaults */ }
  } else {
    localStorage.setItem('sms_speelwijk_booths', JSON.stringify(booths));
  }

  if (migrateLocal) {
    try { await saveSpeelwijkConfigRemote('SPEELWIJK_BOOTHS_CONFIG', booths); } catch (error) {
      console.warn('Booth config migration error:', error.message);
    }
  }
  return booths;
}

export async function saveSpeelwijkBooth(boothData) {
  const current = await getSpeelwijkBooths({ migrateLocal: true });
  const booth = {
    id: boothData.id || `booth_${Date.now()}`,
    name: String(boothData.name || '').trim(),
    type: boothData.type === 'facility' ? 'facility' : 'merchant',
    description: String(boothData.description || '').trim(),
    location: String(boothData.location || '').trim(),
    status: boothData.status === 'inactive' ? 'inactive' : 'active',
    contact: String(boothData.contact || '').trim(),
    link_url: String(boothData.link_url || '').trim(),
    display_order: Number(boothData.display_order) || current.length + 1
  };
  const index = current.findIndex(item => item.id === booth.id);
  if (index >= 0) current[index] = booth;
  else current.push(booth);
  const normalized = normalizeSpeelwijkBooths(current);
  localStorage.setItem('sms_speelwijk_booths', JSON.stringify(normalized));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_BOOTHS_CONFIG', normalized);
    return { success: true, data: booth, remoteSynced: true };
  } catch (error) {
    return { success: true, data: booth, remoteSynced: false, error: error.message };
  }
}

export async function deleteSpeelwijkBooth(id) {
  const current = await getSpeelwijkBooths({ migrateLocal: true });
  const filtered = normalizeSpeelwijkBooths(current.filter(item => item.id !== id));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_BOOTHS_CONFIG', filtered);
    localStorage.setItem('sms_speelwijk_booths', JSON.stringify(filtered));
    return { success: true, remoteSynced: true };
  } catch (error) {
    localStorage.setItem('sms_speelwijk_booths', JSON.stringify(filtered));
    return { success: true, remoteSynced: false, error: error.message };
  }
}

export async function reorderSpeelwijkBooths(items) {
  const normalized = normalizeSpeelwijkBooths(items);
  localStorage.setItem('sms_speelwijk_booths', JSON.stringify(normalized));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_BOOTHS_CONFIG', normalized);
    return { success: true, data: normalized, remoteSynced: true };
  } catch (error) {
    console.warn('Booth order remote save error:', error.message);
    return { success: true, data: normalized, remoteSynced: false, error: error.message };
  }
}

// 5. Prizes CRUD
const SPEELWIJK_PRIZES_CONFIG_VERSION = '2026-08-categories-v3';
const DEFAULT_SPEELWIJK_PRIZES = [
  { id: 'pr1', category: 'Race Whoop 2-2.5” max 4s Pro (DJI)', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr2', category: 'Race Whoop 2-2.5” max 4s Beginner (DJI)', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr3', category: 'Freestyle max 5” max 6s Pro (DJI)', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr4', category: 'Freestyle max 5” max 6s Beginner (DJI)', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr5', category: 'Cinematic FPV', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' }
];

function normalizeSpeelwijkPrizes(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => ({
    ...item,
    id: item.id || `prize_${index + 1}`,
    display_order: Number(item.display_order) || index + 1
  })).sort((a, b) => a.display_order - b.display_order);
}

export function getSpeelwijkPrizes() {
  const local = localStorage.getItem('sms_speelwijk_prizes');
  const version = localStorage.getItem('sms_speelwijk_prizes_version');
  if (local && version === SPEELWIJK_PRIZES_CONFIG_VERSION) {
    try {
      return normalizeSpeelwijkPrizes(JSON.parse(local));
    } catch (e) {}
  }
  const defaults = normalizeSpeelwijkPrizes(DEFAULT_SPEELWIJK_PRIZES);
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(defaults));
  localStorage.setItem('sms_speelwijk_prizes_version', SPEELWIJK_PRIZES_CONFIG_VERSION);
  return defaults;
}

async function getSpeelwijkPrizesRemote() {
  const { data, error } = await supabase
    .from('contacts')
    .select('message')
    .eq('name', 'SPEELWIJK_PRIZES_CONFIG')
    .limit(1);
  if (error) throw error;
  if (!data?.[0]?.message) return null;
  const prizes = JSON.parse(data[0].message);
  return Array.isArray(prizes) ? prizes : null;
}

async function saveSpeelwijkPrizesRemote(prizes) {
  const { data: existing, error: selectError } = await supabase
    .from('contacts')
    .select('id')
    .eq('name', 'SPEELWIJK_PRIZES_CONFIG')
    .limit(1);
  if (selectError) throw selectError;
  const payload = {
    name: 'SPEELWIJK_PRIZES_CONFIG',
    message: JSON.stringify(prizes),
    email: 'system@sms.local',
    phone_wa: ''
  };
  const { error } = existing?.[0]
    ? await supabase.from('contacts').update(payload).eq('id', existing[0].id)
    : await supabase.from('contacts').insert([payload]);
  if (error) throw error;
}

export async function getSpeelwijkPrizesShared({ migrateLocal = false } = {}) {
  try {
    const remote = await getSpeelwijkPrizesRemote();
    if (remote) {
      const prizes = normalizeSpeelwijkPrizes(remote);
      localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(prizes));
      localStorage.setItem('sms_speelwijk_prizes_version', SPEELWIJK_PRIZES_CONFIG_VERSION);
      return prizes;
    }
  } catch (error) {
    console.warn('Remote prize config fetch error:', error.message);
  }
  const local = getSpeelwijkPrizes();
  if (migrateLocal) {
    try { await saveSpeelwijkPrizesRemote(local); } catch (error) {
      console.warn('Prize config migration error:', error.message);
    }
  }
  return local;
}

export async function saveSpeelwijkPrize(prizeData) {
  const current = await getSpeelwijkPrizesShared({ migrateLocal: true });
  const existing = current.find(prize => prize.id === prizeData.id);
  const payload = {
    ...prizeData,
    display_order: Number(prizeData.display_order) || existing?.display_order || current.length + 1
  };
  if (payload.id) {
    const idx = current.findIndex(p => p.id === payload.id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...payload };
    }
  } else {
    payload.id = 'pr_' + Math.random().toString(36).substr(2, 9);
    current.push(payload);
  }
  const normalized = normalizeSpeelwijkPrizes(current);
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(normalized));
  try {
    await saveSpeelwijkPrizesRemote(normalized);
    return { success: true, data: payload, remoteSynced: true };
  } catch (error) {
    console.warn('Prize config remote save error:', error.message);
    return { success: true, data: payload, remoteSynced: false, error: error.message };
  }
}

export async function deleteSpeelwijkPrize(id) {
  const current = await getSpeelwijkPrizesShared({ migrateLocal: true });
  const filtered = normalizeSpeelwijkPrizes(current.filter(p => p.id !== id));
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(filtered));
  try {
    await saveSpeelwijkPrizesRemote(filtered);
    return { success: true, remoteSynced: true };
  } catch (error) {
    console.warn('Prize config remote delete error:', error.message);
    return { success: true, remoteSynced: false, error: error.message };
  }
}

export async function reorderSpeelwijkPrizes(items) {
  const normalized = normalizeSpeelwijkPrizes(items);
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(normalized));
  try {
    await saveSpeelwijkPrizesRemote(normalized);
    return { success: true, data: normalized, remoteSynced: true };
  } catch (error) {
    console.warn('Prize order remote save error:', error.message);
    return { success: true, data: normalized, remoteSynced: false, error: error.message };
  }
}

/* 6. Event reporting CRUD */
const DEFAULT_SPEELWIJK_REPORTING = {
  budget: 40000000,
  sponsorshipIncome: [],
  expenses: []
};

function normalizeSpeelwijkReporting(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    budget: Number(source.budget) || DEFAULT_SPEELWIJK_REPORTING.budget,
    sponsorshipIncome: Array.isArray(source.sponsorshipIncome) ? source.sponsorshipIncome.map(item => ({
      ...item,
      type: item.type === 'in-kind' ? 'in-kind' : 'cash',
      amount: Number(item.amount) || 0
    })) : [],
    expenses: Array.isArray(source.expenses) ? source.expenses : []
  };
}

export async function getSpeelwijkReporting({ migrateLocal = false } = {}) {
  try {
    const remote = await getSpeelwijkConfigRemote('SPEELWIJK_REPORTING_CONFIG');
    if (remote && typeof remote === 'object' && !Array.isArray(remote)) {
      const reporting = normalizeSpeelwijkReporting(remote);
      localStorage.setItem('sms_speelwijk_reporting', JSON.stringify(reporting));
      return reporting;
    }
  } catch (error) {
    console.warn('Remote event reporting fetch error:', error.message);
  }

  const local = localStorage.getItem('sms_speelwijk_reporting');
  let reporting = DEFAULT_SPEELWIJK_REPORTING;
  if (local) {
    try { reporting = normalizeSpeelwijkReporting(JSON.parse(local)); } catch (error) { /* use defaults */ }
  } else {
    localStorage.setItem('sms_speelwijk_reporting', JSON.stringify(reporting));
  }

  if (migrateLocal) {
    try { await saveSpeelwijkConfigRemote('SPEELWIJK_REPORTING_CONFIG', reporting); } catch (error) {
      console.warn('Event reporting config migration error:', error.message);
    }
  }
  return reporting;
}

export async function saveSpeelwijkReporting(reportingData) {
  const reporting = normalizeSpeelwijkReporting(reportingData);
  localStorage.setItem('sms_speelwijk_reporting', JSON.stringify(reporting));
  try {
    await saveSpeelwijkConfigRemote('SPEELWIJK_REPORTING_CONFIG', reporting);
    return { success: true, data: reporting, remoteSynced: true };
  } catch (error) {
    console.warn('Event reporting remote save error:', error.message);
    return { success: true, data: reporting, remoteSynced: false, error: error.message };
  }
}

export async function saveSpeelwijkSponsorshipIncome(itemData) {
  const reporting = await getSpeelwijkReporting({ migrateLocal: true });
  const item = {
    id: itemData.id || `sponsor_income_${Date.now()}`,
    sponsor: String(itemData.sponsor || '').trim(),
    type: itemData.type === 'in-kind' ? 'in-kind' : 'cash',
    amount: Number(itemData.amount) || 0,
    date: itemData.date || new Date().toISOString().slice(0, 10),
    notes: String(itemData.notes || '').trim()
  };
  const index = reporting.sponsorshipIncome.findIndex(entry => entry.id === item.id);
  if (index >= 0) reporting.sponsorshipIncome[index] = item;
  else reporting.sponsorshipIncome.unshift(item);
  const result = await saveSpeelwijkReporting(reporting);
  return { ...result, data: item };
}

export async function deleteSpeelwijkSponsorshipIncome(id) {
  const reporting = await getSpeelwijkReporting({ migrateLocal: true });
  reporting.sponsorshipIncome = reporting.sponsorshipIncome.filter(item => item.id !== id);
  return saveSpeelwijkReporting(reporting);
}

export async function saveSpeelwijkExpense(itemData) {
  const reporting = await getSpeelwijkReporting({ migrateLocal: true });
  const item = {
    id: itemData.id || `expense_${Date.now()}`,
    category: String(itemData.category || 'Operasional').trim(),
    description: String(itemData.description || '').trim(),
    amount: Number(itemData.amount) || 0,
    date: itemData.date || new Date().toISOString().slice(0, 10),
    notes: String(itemData.notes || '').trim()
  };
  const index = reporting.expenses.findIndex(entry => entry.id === item.id);
  if (index >= 0) reporting.expenses[index] = item;
  else reporting.expenses.unshift(item);
  const result = await saveSpeelwijkReporting(reporting);
  return { ...result, data: item };
}

export async function deleteSpeelwijkExpense(id) {
  const reporting = await getSpeelwijkReporting({ migrateLocal: true });
  reporting.expenses = reporting.expenses.filter(item => item.id !== id);
  return saveSpeelwijkReporting(reporting);
}
