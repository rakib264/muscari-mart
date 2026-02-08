'use client';

import { useEffect, useRef, useState } from 'react';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  address: string;
  logo1: string;
  logo2: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  currency: string;
  timezone: string;
  language: string;
}

interface CourierSettingsPublic {
  insideDhaka: number;
  outsideDhaka: number;
}

// Backward-compatible general settings hook
// Priority: Backend Database → Environment Variables → Empty
export function useSettings() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Always fetch fresh data from backend - no cache
        const response = await fetch('/api/settings/general', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // API already handles: Database → Env Vars → Empty
          // So we can use the data directly
          setSettings(data as GeneralSettings);
        } else {
          // If backend fails, set empty settings
          setSettings(null);
          setError('Failed to fetch settings from backend');
        }
      } catch (err) {
        // On error, set empty settings
        setSettings(null);
        setError('Error fetching settings');
        console.error('Error fetching settings:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted.current = false; };
  }, []);

  return { settings, loading, error };
}

// Dedicated courier settings hook
// Priority: Backend Database → Environment Variables → Empty
export function useCourierSettings() {
  const [settings, setSettings] = useState<CourierSettingsPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Always fetch fresh data from backend - no cache
        const response = await fetch('/api/settings/courier', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // Fallback to empty/default values if backend fails
          setSettings({
            insideDhaka: 0,
            outsideDhaka: 0
          });
          setError('Failed to fetch courier settings from backend');
        }
      } catch (err) {
        // On error, use default values
        setSettings({
          insideDhaka: 0,
          outsideDhaka: 0
        });
        setError('Error fetching courier settings');
        console.error('Error fetching courier settings:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted.current = false; };
  }, []);

  return { settings, loading, error };
}
