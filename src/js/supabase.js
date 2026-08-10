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
