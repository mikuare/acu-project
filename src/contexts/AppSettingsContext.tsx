import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  DEFAULT_PROJECT_CATEGORIES,
  DEFAULT_PROJECT_STATUSES,
  ProjectCategoryConfig,
  ProjectStatusConfig,
  normalizeProjectCategories,
  normalizeProjectStatuses,
} from '@/utils/categoryIcons';

export interface LandingHeaderButtonConfig {
  id: string;
  enabled: boolean;
  label: string;
  url: string;
}

interface AppSettingsContextType {
  isMapLocked: boolean;
  isLoading: boolean;
  setMapLock: (locked: boolean) => Promise<boolean>;
  mapboxToken: string | null;
  updateMapboxToken: (token: string) => Promise<boolean>;
  projectCategories: ProjectCategoryConfig[];
  projectStatuses: ProjectStatusConfig[];
  landingHeaderButtons: LandingHeaderButtonConfig[];
  updateProjectCategories: (categories: ProjectCategoryConfig[]) => Promise<boolean>;
  updateProjectStatuses: (statuses: ProjectStatusConfig[]) => Promise<boolean>;
  updateLandingHeaderButtons: (config: LandingHeaderButtonConfig[]) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const DEFAULT_LANDING_HEADER_BUTTON: LandingHeaderButtonConfig = {
  id: 'header-button-1',
  enabled: false,
  label: '',
  url: '',
};

export const normalizeLandingHeaderButtons = (value: unknown): LandingHeaderButtonConfig[] => {
  const rawButtons = Array.isArray(value) ? value : value ? [value] : [];

  const normalized = rawButtons.map((button: any, index) => ({
    id: String(button?.id || `header-button-${index + 1}`),
    enabled: Boolean(button?.enabled),
    label: String(button?.label || '').trim(),
    url: String(button?.url || '').trim(),
  }));

  return normalized.length > 0 ? normalized : [DEFAULT_LANDING_HEADER_BUTTON];
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [projectCategories, setProjectCategories] = useState<ProjectCategoryConfig[]>(DEFAULT_PROJECT_CATEGORIES);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatusConfig[]>(DEFAULT_PROJECT_STATUSES);
  const [landingHeaderButtons, setLandingHeaderButtons] = useState<LandingHeaderButtonConfig[]>([DEFAULT_LANDING_HEADER_BUTTON]);
  const [isLoading, setIsLoading] = useState(true);

  const parseJsonSetting = <T,>(value: string | null | undefined, fallback: T) => {
    if (!value) return fallback;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing app setting JSON:', error);
      return fallback;
    }
  };

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

      const { data: categoryData, error: categoryError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'project_categories')
        .single();

      setProjectCategories(
        !categoryError && categoryData
          ? normalizeProjectCategories(parseJsonSetting(categoryData.setting_value, DEFAULT_PROJECT_CATEGORIES))
          : DEFAULT_PROJECT_CATEGORIES
      );

      const { data: statusData, error: statusError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'project_statuses')
        .single();

      setProjectStatuses(
        !statusError && statusData
          ? normalizeProjectStatuses(parseJsonSetting(statusData.setting_value, DEFAULT_PROJECT_STATUSES))
          : DEFAULT_PROJECT_STATUSES
      );

      const { data: headerButtonData, error: headerButtonError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'landing_header_button')
        .single();

      setLandingHeaderButtons(
        !headerButtonError && headerButtonData
          ? normalizeLandingHeaderButtons(parseJsonSetting(headerButtonData.setting_value, [DEFAULT_LANDING_HEADER_BUTTON]))
          : [DEFAULT_LANDING_HEADER_BUTTON]
      );
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
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const record = payload.new as any;
              if (record.setting_key === 'map_lock_enabled') {
                setIsMapLocked(record.setting_value === 'true');
              } else if (record.setting_key === 'mapbox_token') {
                setMapboxToken(record.setting_value);
              } else if (record.setting_key === 'project_categories') {
                setProjectCategories(normalizeProjectCategories(parseJsonSetting(record.setting_value, DEFAULT_PROJECT_CATEGORIES)));
              } else if (record.setting_key === 'project_statuses') {
                setProjectStatuses(normalizeProjectStatuses(parseJsonSetting(record.setting_value, DEFAULT_PROJECT_STATUSES)));
              } else if (record.setting_key === 'landing_header_button') {
                setLandingHeaderButtons(normalizeLandingHeaderButtons(parseJsonSetting(record.setting_value, [DEFAULT_LANDING_HEADER_BUTTON])));
              }
            }
          }
        )
        .subscribe();
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

  const upsertSetting = async (settingKey: string, value: string, description: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: value,
          description,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) {
        console.error(`Error updating ${settingKey}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error in upsertSetting for ${settingKey}:`, error);
      return false;
    }
  };

  const updateProjectCategories = async (categories: ProjectCategoryConfig[]): Promise<boolean> => {
    const normalized = normalizeProjectCategories(categories);
    const success = await upsertSetting(
      'project_categories',
      JSON.stringify(normalized),
      'Configurable project categories and icon names'
    );

    if (success) {
      setProjectCategories(normalized);
    }

    return success;
  };

  const updateProjectStatuses = async (statuses: ProjectStatusConfig[]): Promise<boolean> => {
    const normalized = normalizeProjectStatuses(statuses);
    const success = await upsertSetting(
      'project_statuses',
      JSON.stringify(normalized),
      'Configurable project statuses'
    );

    if (success) {
      setProjectStatuses(normalized);
    }

    return success;
  };

  const updateLandingHeaderButtons = async (config: LandingHeaderButtonConfig[]): Promise<boolean> => {
    const normalized = normalizeLandingHeaderButtons(config);

    const success = await upsertSetting(
      'landing_header_button',
      JSON.stringify(normalized),
      'Configurable website button shown in the landing page top header'
    );

    if (success) {
      setLandingHeaderButtons(normalized);
    }

    return success;
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
    <AppSettingsContext.Provider value={{
      isMapLocked,
      isLoading,
      setMapLock,
      mapboxToken,
      updateMapboxToken,
      projectCategories,
      projectStatuses,
      landingHeaderButtons,
      updateProjectCategories,
      updateProjectStatuses,
      updateLandingHeaderButtons,
      refreshSettings
    }}>
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
