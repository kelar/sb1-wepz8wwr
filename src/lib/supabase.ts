/**
 * Supabase Configuration and Error Handling
 * 
 * This module sets up the Supabase client and provides tools for
 * handling Supabase-related operations.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get Supabase configuration from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase using the "Connect to Supabase" button.');
}

// Create and export Supabase client instance with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: Platform.OS === 'web' ? localStorage : {
      async getItem(key: string) {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      async setItem(key: string, value: string) {
        try {
          localStorage.setItem(key, value);
        } catch {}
      },
      async removeItem(key: string) {
        try {
          localStorage.removeItem(key);
        } catch {}
      }
    }
  }
});

/**
 * Check if user's email is confirmed
 * @returns {Promise<boolean>} True if email is confirmed
 */
export const isEmailConfirmed = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email_confirmed_at != null;
  } catch (error) {
    console.error('Error checking email confirmation:', error);
    return false;
  }
};

/**
 * Handle Supabase errors
 * 
 * Processes Supabase errors and returns user-friendly error messages in Norwegian.
 * 
 * @param {any} error - The error object from Supabase
 * @returns {string} A user-friendly error message
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Handle specific error codes
  if (error.code === 'PGRST116') {
    return 'Ingen tilgang til databasen. Vennligst logg inn på nytt.';
  }
  if (error.code === '500') {
    return 'En serverfeil har oppstått. Vennligst prøv igjen senere.';
  }
  if (error.message?.includes('Failed to fetch')) {
    return 'Kunne ikke koble til serveren. Sjekk internettforbindelsen.';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'E-postadressen din er ikke bekreftet. Sjekk innboksen din for en bekreftelseslenke.';
  }
  return error.message || 'En ukjent feil har oppstått';
};