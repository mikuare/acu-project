import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AppSettingsContextType {
  isMapLocked: boolean;
  isLoading: boolean;
  setMapLock: (locked: boolean) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMapLocked, setIsMapLocked] = useState(false);
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
            table: 'app_settings',
            filter: 'setting_key=eq.map_lock_enabled'
          },
          (payload) => {
            console.log('App settings update received:', payload);
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const newValue = (payload.new as any)?.setting_value === 'true';
              setIsMapLocked(newValue);
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

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AppSettingsContext.Provider value={{ isMapLocked, isLoading, setMapLock, refreshSettings }}>
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

