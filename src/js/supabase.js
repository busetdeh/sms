/**
 * Supabase Client & Data Integration for Sky Multirotor Squad
 * Handles dynamic fetching and realtime synchronization for Events, Pilots, Spots, Gallery, and Contacts.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://pgptktwaqnzrvmsjkbun.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncHRrdHdhcW56cnZtc2prYnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTcxMjMsImV4cCI6MjEwMTkzMzEyM30.CHB-vtEFCBNSzDzPUIm5xEneHvnDX8TL7WoUZ9n-PvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all events sorted by date
 */
export async function getSupabaseEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.warn('Supabase events fetch warning:', error.message);
      return null;
    }
    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('Supabase offline or table not ready, using fallback local events:', err);
    return null;
  }
}

/**
 * Fetch all squad pilots sorted by display order
 */
export async function getSupabasePilots() {
  try {
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase pilots fetch warning:', error.message);
      return null;
    }
    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('Supabase pilots offline, using fallback:', err);
    return null;
  }
}

/**
 * Fetch all flying spots
 */
export async function getSupabaseSpots() {
  try {
    const { data, error } = await supabase
      .from('flying_spots')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase flying_spots fetch warning:', error.message);
      return null;
    }
    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('Supabase spots offline, using fallback:', err);
    return null;
  }
}

/**
 * Fetch all gallery entries
 */
export async function getSupabaseGallery() {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase gallery fetch warning:', error.message);
      return null;
    }
    return data && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('Supabase gallery offline, using fallback:', err);
    return null;
  }
}

/**
 * Submit message or member registration to contacts table
 */
export async function submitSupabaseContact(contactData) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData]);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Failed to submit contact to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Setup Realtime Subscription on any table
 */
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
