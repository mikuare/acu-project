import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AppSettingsContextType {
  isMapLocked: boolean;
  isLoading: boolean;
  setMapLock: (locked: boolean) => Promise<boolean>;
  mapboxToken: string | null;
  updateMapboxToken: (token: string) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'map_lock_enabled')
        .single();

      if (error) {
        console.error('Error loading app settings:', error);
        // Default to unlocked if there's an error
        setIsMapLocked(false);
      } else {
        setIsMapLocked(data?.setting_value === 'true');
      }

      // Load Mapbox token
      const { data: tokenData, error: tokenError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'mapbox_token')
        .single();

      if (!tokenError && tokenData) {
        setMapboxToken(tokenData.setting_value);
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
      setIsMapLocked(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Set up real-time subscription for settings changes
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel('app-settings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_settings'
          },
          (payload) => {
            console.log('App settings update received:', payload);
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const record = payload.new as any;
              if (record.setting_key === 'map_lock_enabled') {
                setIsMapLocked(record.setting_value === 'true');
              } else if (record.setting_key === 'mapbox_token') {
                setMapboxToken(record.setting_value);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('App settings subscription status:', status);
        });
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const setMapLock = async (locked: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: locked ? 'true' : 'false',
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'map_lock_enabled');

      if (error) {
        console.error('Error updating map lock setting:', error);
        return false;
      }

      setIsMapLocked(locked);
      return true;
    } catch (error) {
      console.error('Error in setMapLock:', error);
      return false;
    }
  };

  const updateMapboxToken = async (token: string): Promise<boolean> => {
    try {
      // First try to update
      const { error, count } = await supabase
        .from('app_settings')
        .update({
          setting_value: token,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'mapbox_token');

      if (error) {
        console.error('Error updating mapbox token:', error);
        return false;
      }

      // If no rows updated, it might need to be inserted (though migration should have handled this)
      // But for robustness:
      /* 
      if (count === 0) {
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            setting_key: 'mapbox_token',
            setting_value: token
          });
          
        if (insertError) {
             console.error('Error inserting mapbox token:', insertError);
             return false;
        }
      }
      */

      setMapboxToken(token);
      return true;
    } catch (error) {
      console.error('Error in updateMapboxToken:', error);
      return false;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ isMapLocked, isLoading, setMapLock, mapboxToken, updateMapboxToken, refreshSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

