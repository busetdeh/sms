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
    return data;
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
  { id: 'session_1', day: '1', time: '08:00 WIB', title: 'Registrasi & Safety Briefing', desc: 'Pemeriksaan failsafe, frekuensi VTX VTX-table lock, dan safety check baterai LiPo.' },
  { id: 'session_2', day: '1', time: '10:00 WIB', title: 'Open Practice & Track Preview', desc: 'Pengenalan layout lintasan reruntuhan Speelwijk, gate tunnel bastion, dan line shooting.' },
  { id: 'session_3', day: '1', time: '13:30 WIB', title: 'Kualifikasi Time Attack (Heat 1-4)', desc: 'Pencatatan lap time resmi 3 lap berturut-turut untuk seeding bracket turnamen.' },
  { id: 'session_4', day: '1', time: '16:00 WIB', title: 'Cinematic Sunset Golden Hour', desc: 'Sesi terbang sinematik bebas mengabadikan siluet menara dan dinding benteng saat senja.' },
  { id: 'session_5', day: '2', time: '08:30 WIB', title: 'Warm-up & Eliminasi Ganda', desc: 'Babak gugur 16 besar kelas 5-Inch Open dan 3.5-Inch Freestyle precision.' },
  { id: 'session_6', day: '2', time: '13:00 WIB', title: 'Semifinal & Final Battle', desc: 'Pertarungan puncak memperebutkan Trophy Juara Benteng Speelwijk Drone Fest 2026.' },
  { id: 'session_7', day: '2', time: '15:30 WIB', title: 'Podium & Closing Ceremony', desc: 'Penyerahan piala, sertifikat kehormatan skuad, dan foto bersama seluruh pilot & komunitas.' }
];

// Default Settings
const DEFAULT_SPEELWIJK_SETTINGS = {
  title: 'Fly Through History',
  subtitle: 'Benteng Speelwijk Drone Fest 2026',
  slug: 'sms-fly-through-history',
  date: '17 - 18 Oktober 2026',
  fee: 'Rp 200.000',
  waNumber: '6287772272928',
  location: 'Benteng Speelwijk, Banten Lama',
  coords: "6°01'59\"S 106°09'14\"E",
  desc: 'Eksplorasi aerodinamika drone FPV berkecepatan tinggi menembus reruntuhan bersejarah Benteng Speelwijk, Banten Lama. Misi terbang sinematik dan kompetisi presisi pertama di kawasan cagar budaya Indonesia.',
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
    // Check contacts table first where topic is EVENT_SPEELWIJK_2026
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('topic', 'EVENT_SPEELWIJK_2026')
      .order('created_at', { ascending: false });

    if (!contactError && contactData && contactData.length > 0) {
      return contactData.map(c => {
        let details = {};
        try { details = JSON.parse(c.message); } catch (e) { details = { raw: c.message }; }
        return {
          id: c.id,
          name: c.name || details.name || 'Pilot Speelwijk',
          callsign: details.callsign || '-',
          phone: c.phone || details.phone || '-',
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
  try {
    const isEdit = Boolean(regData.id);
    const id = regData.id || `speel_reg_${Date.now()}`;
    const payload = {
      ...regData,
      id,
      created_at: regData.created_at || new Date().toISOString()
    };

    // Save to contacts in Supabase for persistence
    const contactPayload = {
      name: regData.name,
      phone: regData.phone,
      email: regData.email,
      topic: 'EVENT_SPEELWIJK_2026',
      message: JSON.stringify({
        callsign: regData.callsign,
        category: regData.category,
        paymentMethod: regData.paymentMethod,
        status: regData.status,
        notes: regData.notes,
        paymentProof: regData.paymentProof
      })
    };

    if (isEdit && typeof regData.id === 'string' && regData.id.includes('-')) {
      await supabase.from('contacts').update(contactPayload).eq('id', regData.id);
    } else if (!isEdit) {
      await supabase.from('contacts').insert([contactPayload]);
    }

    // Sync to local storage
    const current = await getSpeelwijkRegistrations();
    let updated;
    if (isEdit) {
      updated = current.map(item => item.id === id ? payload : item);
    } else {
      updated = [payload, ...current];
    }
    localStorage.setItem('sms_speelwijk_registrations', JSON.stringify(updated));

    return { success: true, data: payload };
  } catch (err) {
    console.warn('Save Speelwijk registration error:', err.message);
    return { success: false, error: err.message };
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
export function getSpeelwijkRundown() {
  const local = localStorage.getItem('sms_speelwijk_rundown');
  if (local) {
    try { return JSON.parse(local); } catch (e) { }
  }
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(DEFAULT_SPEELWIJK_RUNDOWN));
  return DEFAULT_SPEELWIJK_RUNDOWN;
}

export function saveSpeelwijkRundownItem(sessionData) {
  const isEdit = Boolean(sessionData.id);
  const id = sessionData.id || `session_${Date.now()}`;
  const payload = { ...sessionData, id };
  const current = getSpeelwijkRundown();
  let updated;
  if (isEdit) {
    updated = current.map(item => item.id === id ? payload : item);
  } else {
    updated = [...current, payload];
  }
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(updated));
  return { success: true, data: payload };
}

export function deleteSpeelwijkRundownItem(id) {
  const current = getSpeelwijkRundown();
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem('sms_speelwijk_rundown', JSON.stringify(filtered));
  return { success: true };
}

// 3. Settings CRUD
export function getSpeelwijkSettings() {
  const local = localStorage.getItem('sms_speelwijk_settings');
  if (local) {
    try { return JSON.parse(local); } catch (e) { }
  }
  localStorage.setItem('sms_speelwijk_settings', JSON.stringify(DEFAULT_SPEELWIJK_SETTINGS));
  return DEFAULT_SPEELWIJK_SETTINGS;
}

export function saveSpeelwijkSettings(settingsData) {
  const payload = { ...DEFAULT_SPEELWIJK_SETTINGS, ...settingsData };
  localStorage.setItem('sms_speelwijk_settings', JSON.stringify(payload));
  return { success: true, data: payload };
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

export function getSpeelwijkPartners() {
  const local = localStorage.getItem('sms_speelwijk_partners');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(DEFAULT_SPEELWIJK_PARTNERS));
  return DEFAULT_SPEELWIJK_PARTNERS;
}

export function saveSpeelwijkPartner(partnerData) {
  const current = getSpeelwijkPartners();
  if (partnerData.id) {
    const idx = current.findIndex(p => p.id === partnerData.id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...partnerData };
    }
  } else {
    partnerData.id = 'p_' + Math.random().toString(36).substr(2, 9);
    current.push(partnerData);
  }
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(current));
  return { success: true, data: partnerData };
}

export function deleteSpeelwijkPartner(id) {
  const current = getSpeelwijkPartners();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem('sms_speelwijk_partners', JSON.stringify(filtered));
  return { success: true };
}

// 5. Prizes CRUD
const SPEELWIJK_PRIZES_CONFIG_VERSION = '2026-08-categories-v2';
const DEFAULT_SPEELWIJK_PRIZES = [
  { id: 'pr1', category: 'Race Whoop Pro', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr2', category: 'Race Whoop Beginner', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr3', category: 'Freestyle Pro', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr4', category: 'Freestyle Beginner', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' },
  { id: 'pr5', category: 'Cinematic FPV', rank: 'Kategori', amount: 'Bagian dari total hadiah Rp. 15.000.000' }
];

export function getSpeelwijkPrizes() {
  const local = localStorage.getItem('sms_speelwijk_prizes');
  const version = localStorage.getItem('sms_speelwijk_prizes_version');
  if (local && version === SPEELWIJK_PRIZES_CONFIG_VERSION) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(DEFAULT_SPEELWIJK_PRIZES));
  localStorage.setItem('sms_speelwijk_prizes_version', SPEELWIJK_PRIZES_CONFIG_VERSION);
  return DEFAULT_SPEELWIJK_PRIZES;
}

export function saveSpeelwijkPrize(prizeData) {
  const current = getSpeelwijkPrizes();
  if (prizeData.id) {
    const idx = current.findIndex(p => p.id === prizeData.id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...prizeData };
    }
  } else {
    prizeData.id = 'pr_' + Math.random().toString(36).substr(2, 9);
    current.push(prizeData);
  }
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(current));
  return { success: true, data: prizeData };
}

export function deleteSpeelwijkPrize(id) {
  const current = getSpeelwijkPrizes();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem('sms_speelwijk_prizes', JSON.stringify(filtered));
  return { success: true };
}
