import { supabase } from './supabase';

/**
 * Database Operations Module
 * 
 * Dette modulet håndterer alle databaseoperasjoner ved hjelp av Supabase.
 * Det inkluderer funksjoner for CRUD-operasjoner på massetyper, prosjekter og forbruk.
 * 
 * Hovedfunksjonalitet:
 * - Håndtering av massetyper (opprettelse, oppdatering, sletting)
 * - Håndtering av prosjekter (opprettelse, oppdatering, sletting)
 * - Registrering og sporing av forbruk
 * - Statistikk og rapportering
 */

// Event håndtering for sanntidsoppdateringer
const listeners = new Set<() => void>();

/**
 * Abonnerer på dataendringer
 * @param {Function} callback - Funksjon som kalles når data endres
 * @returns {Function} Funksjon for å avslutte abonnementet
 */
export const subscribeToDataChanges = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

/**
 * Varsler alle lyttere om dataendringer
 */
const notifyDataChange = () => {
  listeners.forEach(callback => callback());
};

/**
 * Massetyper Operasjoner
 */

/**
 * Henter alle massetyper
 * @returns {Promise<Array>} Array med massetyper
 */
export const getMassetyper = async () => {
  const { data, error } = await supabase
    .from('massetyper')
    .select('*')
    .order('navn');
  
  if (error) throw error;
  return data;
};

/**
 * Henter en spesifikk massetype basert på ID
 * @param {string} id - Massetype ID
 * @returns {Promise<Object>} Massetype objekt
 */
export const getMassetype = async (id: string) => {
  const { data, error } = await supabase
    .from('massetyper')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Legger til en ny massetype
 * @param {string} navn - Navn på massetypen
 * @param {number} weight_per_skuff - Vekt per skuff i kg (valgfritt)
 * @returns {Promise<Object>} Den nye massetypen
 */
export const addMassetype = async (navn: string, weight_per_skuff?: number | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Sjekk for duplikat navn
  const { data: existing } = await supabase
    .from('massetyper')
    .select('count')
    .eq('navn', navn)
    .eq('user_id', user.id);

  if (existing && existing[0]?.count > 0) {
    throw new Error('Duplicate name');
  }

  const { data, error } = await supabase
    .from('massetyper')
    .insert([{ 
      navn,
      weight_per_skuff,
      user_id: user.id 
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  notifyDataChange();
  return data;
};

export const updateMassetype = async (id: string, navn: string, weight_per_skuff?: number | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('massetyper')
    .select('count')
    .eq('navn', navn)
    .eq('user_id', user.id)
    .neq('id', id);

  if (existing && existing[0]?.count > 0) {
    throw new Error('Duplicate name');
  }

  const { data, error } = await supabase
    .from('massetyper')
    .update({ navn, weight_per_skuff })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  notifyDataChange();
  
  return data;
};

export const deleteMassetype = async (id: string) => {
  // Check if massetype is in use
  const { data: forbruk } = await supabase
    .from('forbruk')
    .select('count')
    .eq('massetype_id', id);

  if (forbruk && forbruk[0]?.count > 0) {
    throw new Error('Cannot delete: Mass type is in use');
  }

  const { error } = await supabase
    .from('massetyper')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  notifyDataChange();
};

// Prosjekter operations
export const getProsjekter = async () => {
  const { data, error } = await supabase
    .from('prosjekter')
    .select('*')
    .order('navn');
  
  if (error) throw error;
  return data;
};

export const getProsjekt = async (id: string) => {
  const { data, error } = await supabase
    .from('prosjekter')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const addProsjekt = async (navn: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('prosjekter')
    .select('count')
    .eq('navn', navn)
    .eq('user_id', user.id);

  if (existing && existing[0]?.count > 0) {
    throw new Error('Duplicate name');
  }

  const { data, error } = await supabase
    .from('prosjekter')
    .insert([{ 
      navn,
      user_id: user.id 
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  notifyDataChange();
  
  return data;
};

export const updateProsjekt = async (id: string, navn: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('prosjekter')
    .select('count')
    .eq('navn', navn)
    .eq('user_id', user.id)
    .neq('id', id);

  if (existing && existing[0]?.count > 0) {
    throw new Error('Duplicate name');
  }

  const { data, error } = await supabase
    .from('prosjekter')
    .update({ navn })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  notifyDataChange();
  
  return data;
};

export const deleteProsjekt = async (id: string) => {
  // Check if project is in use
  const { data: forbruk } = await supabase
    .from('forbruk')
    .select('count')
    .eq('prosjekt_id', id);

  if (forbruk && forbruk[0]?.count > 0) {
    throw new Error('Cannot delete: Project is in use');
  }

  const { error } = await supabase
    .from('prosjekter')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  notifyDataChange();
};

// Forbruk operations
export const addForbruk = async (
  massetype_id: string,
  prosjekt_id: string,
  antall_skuffer: number
) => {
  const { data, error } = await supabase
    .from('forbruk')
    .insert([{
      massetype_id,
      prosjekt_id,
      antall_skuffer,
      dato: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  notifyDataChange();
  
  return data;
};

export const updateForbruk = async (id: string, antall_skuffer: number) => {
  try {
    const { data, error } = await supabase
      .from('forbruk')
      .update({ antall_skuffer })
      .eq('id', id)
      .select(`
        *,
        massetyper (
          id,
          navn,
          weight_per_skuff
        ),
        prosjekter (
          id,
          navn
        )
      `)
      .single();
    
    if (error) throw error;
    
    notifyDataChange();
    
    return data;
  } catch (error) {
    console.error('Error in updateForbruk:', error);
    throw error;
  }
};

export const getForbrukByMonth = async (year: number, month: number) => {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();
  
  const { data, error } = await supabase
    .from('forbruk')
    .select(`
      id,
      antall_skuffer,
      dato,
      massetyper (
        id,
        navn,
        weight_per_skuff
      ),
      prosjekter (
        id,
        navn
      )
    `)
    .gte('dato', startDate)
    .lt('dato', endDate)
    .order('dato', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getMonthlyStats = async (year: number, month: number) => {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0).toISOString();

  // Get total skuffer and weight per massetype using raw SQL
  const { data: massetypeStats, error: massetypeError } = await supabase
    .rpc('get_massetype_stats', {
      start_date: startDate,
      end_date: endDate
    });

  if (massetypeError) throw massetypeError;

  // Get total skuffer per project using raw SQL
  const { data: prosjektStats, error: prosjektError } = await supabase
    .rpc('get_prosjekt_stats', {
      start_date: startDate,
      end_date: endDate
    });

  if (prosjektError) throw prosjektError;

  return {
    massetypeStats: massetypeStats || [],
    prosjektStats: prosjektStats || []
  };
};